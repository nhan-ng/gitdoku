package coordinator

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	pb "agones.dev/agones/pkg/allocation/go"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

var (
	ErrDefaultGraphQL = errors.New("internal server error")
)

type ServeOptions struct {
	Port int

	UseRealClient bool

	// To connect to Agones Allocator
	AgonesEndpoint string
	CertFile       string
	KeyFile        string
	CACertFile     string
}

func Serve(opts ServeOptions) error {
	// Initialize a new client to Agones API
	agonesClient, err := newAllocationServiceClient(opts)
	if err != nil {
		return fmt.Errorf("failed to initialize a new Agones client: %w", err)
	}
	logger := zap.L()

	router := gin.Default()

	router.Use(ginzap.Ginzap(logger, time.RFC3339, false))
	router.Use(ginzap.RecoveryWithZap(logger, true))
	router.Static("/", "./ui/build")

	router.POST("/", func(c *gin.Context) {
		response, err := agonesClient.Allocate(c, &pb.AllocationRequest{
			Namespace: "default",
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		// Address
		address := fmt.Sprintf("%s:%d/graphql", response.Address, response.Ports[0].Port)
		gameID := base64.StdEncoding.EncodeToString([]byte(address))

		logger.Info("Created game server.", zap.String("address", address), zap.String("gameId", gameID))

		c.JSON(http.StatusOK, gin.H{"gameId": gameID})
	})

	return router.Run(fmt.Sprintf(":%d", opts.Port))
}

func newAllocationServiceClient(opts ServeOptions) (pb.AllocationServiceClient, error) {
	if opts.UseRealClient {
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
	} else {
		return &NoopAllocationService{
			logger: zap.L(),
		}, nil
	}
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
