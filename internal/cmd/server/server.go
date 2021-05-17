package server

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/99designs/gqlgen/graphql/handler/extension"

	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/gorilla/websocket"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/nhan-ng/sudoku/graph"
	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/rs/cors"
	"go.uber.org/zap"
)

var (
	ErrDefaultGraphQL = errors.New("internal server error")
)

func Serve(useFilesytem bool) error {
	// Schema
	resolver, err := graph.NewResolver(useFilesytem)
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
	//h.AroundFields(func(ctx context.Context, next graphql.Resolver) (res interface{}, err error) {
	//	rc := graphql.GetFieldContext(ctx)
	//	zap.L().Info("Entered", zap.String("object", rc.Object), zap.String("fieldName", rc.Field.Name))
	//	res, err = next(ctx)
	//	zap.L().Info("Left", zap.String("object", rc.Object), zap.String("fieldName", rc.Field.Name), zap.Any("result", res), zap.Error(err))
	//	return res, err
	//})
	h.AddTransport(transport.POST{})
	h.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	})
	h.Use(extension.Introspection{})

	http.Handle("/", playground.Handler("Sudoku", "/graphql"))
	http.Handle("/graphql", cors.AllowAll().Handler(h))

	zap.L().Info("Serving at localhost:9999")
	return http.ListenAndServe(":9999", nil)
}
