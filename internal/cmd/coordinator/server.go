package coordinator

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/nhan-ng/sudoku/internal/cmd/coordinator/graph"
	"github.com/nhan-ng/sudoku/internal/cmd/coordinator/graph/generated"

	pb "agones.dev/agones/pkg/allocation/go"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/rs/cors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

var (
	ErrDefaultGraphQL = errors.New("internal server error")
)

type ServeOptions struct {
	Port int

	// To connect to Agones Allocator
	AgonesEndpoint string
	CertFile       string
	KeyFile        string
	CACertFile     string
}

func Serve(opts ServeOptions) error {
	// Initialize a new client to Agones API
	agonesClient, err := newAgonesClient(opts)
	if err != nil {
		return fmt.Errorf("failed to initialize a new Agones client: %w", err)
	}

	resolver, err := graph.NewResolver(agonesClient)
	if closer, ok := resolver.Resolvers.(io.Closer); ok {
		defer closer.Close()
	}
	if err != nil {
		return fmt.Errorf("failed to create a GraphQL resolver: %w", err)
	}

	h := handler.New(generated.NewExecutableSchema(*resolver))
	h.SetRecoverFunc(func(ctx context.Context, err interface{}) (userMessage error) {
		zap.L().Error("Panic error when processing GraphQL.", zap.Any("error", err))
		return ErrDefaultGraphQL
	})
	h.AddTransport(transport.POST{})
	h.Use(extension.Introspection{})

	http.Handle("/", playground.Handler("Sudoku", "/graphql"))
	http.Handle("/graphql", cors.AllowAll().Handler(h))

	zap.L().Info("Serving coordinator service", zap.Int("port", opts.Port))
	return http.ListenAndServe(fmt.Sprintf(":%d", opts.Port), nil)
}

func newAgonesClient(opts ServeOptions) (pb.AllocationServiceClient, error) {
	cert, err := ioutil.ReadFile(opts.CertFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read client cert: %w", err)
	}
	key, err := ioutil.ReadFile(opts.KeyFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read client key: %w", err)
	}
	caCert, err := ioutil.ReadFile(opts.CACertFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read client CA cert: %w", err)
	}

	dialOpts, err := createRemoteClusterDialOption(cert, key, caCert)
	if err != nil {
		return nil, fmt.Errorf("failed to create new dial options: %w", err)
	}
	conn, err := grpc.Dial(opts.AgonesEndpoint, dialOpts)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Agones API: %w", err)
	}

	return pb.NewAllocationServiceClient(conn), nil
}

func createRemoteClusterDialOption(clientCert, clientKey, caCert []byte) (grpc.DialOption, error) {
	// Load client cert
	cert, err := tls.X509KeyPair(clientCert, clientKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create an X509 cert to Agones API: %w", err)
	}

	tlsConfig := &tls.Config{
		Certificates: []tls.Certificate{
			cert,
		},
	}

	// Load CA cert, if provided and trust the server certification
	// Required for self-signed certs
	if len(caCert) != 0 {
		tlsConfig.RootCAs = x509.NewCertPool()
		if !tlsConfig.RootCAs.AppendCertsFromPEM(caCert) {
			return nil, errors.New("only PEM format is accepted for server CA")
		}
	}

	return grpc.WithTransportCredentials(credentials.NewTLS(tlsConfig)), nil
}
