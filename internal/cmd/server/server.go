package server

import (
	"fmt"
	"net/http"

	"github.com/nhan-ng/sudoku/graph"
	"github.com/nhan-ng/sudoku/graph/generated"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"go.uber.org/zap"
)

func Serve() error {
	// Schema
	resolver, err := graph.NewResolver()
	if err != nil {
		return fmt.Errorf("failed to create a GraphQL resolver: %w", err)
	}
	h := handler.NewDefaultServer(generated.NewExecutableSchema(*resolver))

	http.Handle("/", playground.Handler("Sudoku", "/graphql"))
	http.Handle("/graphql", h)

	zap.L().Info("Serving at localhost:9999")
	return http.ListenAndServe(":9999", nil)
}
