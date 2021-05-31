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

func (r *queryResolver) Ping(ctx context.Context) (*string, error) {
	result := "pong"
	return &result, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *queryResolver) _(ctx context.Context) (*bool, error) {
	panic(fmt.Errorf("not implemented"))
}
