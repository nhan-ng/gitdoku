package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	pb "agones.dev/agones/pkg/allocation/go"

	"github.com/nhan-ng/sudoku/internal/cmd/coordinator/graph/generated"
	"github.com/nhan-ng/sudoku/internal/cmd/coordinator/graph/model"
)

func (r *mutationResolver) AllocateGame(ctx context.Context) (*model.AllocateGamePayload, error) {
	request := &pb.AllocationRequest{
		Namespace: "default",
	}
	response, err := r.client.Allocate(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("failed to allocate a game server: %w", err)
	}

	return &model.AllocateGamePayload{
		Address: fmt.Sprintf("%s:%d", response.Address, response.Ports[0].Port),
	}, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
