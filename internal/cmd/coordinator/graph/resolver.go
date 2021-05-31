//go:generate go run github.com/99designs/gqlgen
package graph

import (
	"github.com/nhan-ng/sudoku/internal/cmd/coordinator/graph/generated"

	pb "agones.dev/agones/pkg/allocation/go"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	client pb.AllocationServiceClient
}

func NewResolver(client pb.AllocationServiceClient) (*generated.Config, error) {
	return &generated.Config{
		Resolvers: &Resolver{
			client: client,
		},
	}, nil
}
