package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/nhan-ng/sudoku/graph/model"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func (r *commitResolver) Parent(ctx context.Context, obj *model.Commit) (*model.Commit, error) {
	if obj.ParentID == nil {
		return nil, nil
	}

	commit, ok := r.commits[*obj.ParentID]
	if !ok {
		return nil, gqlerror.Errorf("unknown commit id %d", *obj.ParentID)
	}
	return &commit, nil
}

func (r *mutationResolver) Commit(ctx context.Context, input model.CommitInput) (*model.Commit, error) {
	refHead, ok := r.refHeads[input.RefHeadID]
	if !ok {
		return nil, gqlerror.Errorf("head [%s] not found", input.RefHeadID)
	}
	commitID := refHead.CommitID
	commit := model.Commit{
		ID:  uuid.NewString(),
		Row: input.Row,
		Col: input.Col,
		Val: input.Val,
	}
	if commitID != nil {
		commit.ParentID = commitID
	}

	// Update the ref
	refHead.CommitID = &commit.ID
	r.refHeads[input.RefHeadID] = refHead
	r.commits[commit.ID] = commit

	return &commit, nil
}

func (r *queryResolver) Sudoku(ctx context.Context) (*model.Sudoku, error) {
	return &r.sudoku, nil
}

func (r *queryResolver) RefHead(ctx context.Context, id string) (*model.RefHead, error) {
	refHead, ok := r.refHeads[id]
	if !ok {
		return nil, gqlerror.Errorf("head [%s] not found", id)
	}
	return &refHead, nil
}

func (r *queryResolver) Commit(ctx context.Context, id string) (*model.Commit, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *refHeadResolver) Commits(ctx context.Context, obj *model.RefHead) ([]*model.Commit, error) {
	commits := make([]*model.Commit, 0)
	if obj.CommitID == nil {
		return commits, nil
	}

	for commitID := obj.CommitID; commitID != nil; commitID = r.commits[*commitID].ParentID {
		commit, ok := r.commits[*commitID]
		if !ok {
			return nil, gqlerror.Errorf("unknown commit id %d", commitID)
		}
		commits = append(commits, &commit)
	}

	return commits, nil
}

// Commit returns generated.CommitResolver implementation.
func (r *Resolver) Commit() generated.CommitResolver { return &commitResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// RefHead returns generated.RefHeadResolver implementation.
func (r *Resolver) RefHead() generated.RefHeadResolver { return &refHeadResolver{r} }

type commitResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type refHeadResolver struct{ *Resolver }
