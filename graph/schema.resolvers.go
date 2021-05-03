package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/google/uuid"
	"github.com/nhan-ng/sudoku/graph/errors"
	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/nhan-ng/sudoku/graph/model"
)

func (r *commitResolver) Parent(ctx context.Context, obj *model.Commit) (*model.Commit, error) {
	if obj.ParentID == nil {
		return nil, nil
	}

	commit, ok := r.commits[*obj.ParentID]
	if !ok {
		return nil, errors.ErrCommitNotFound(*obj.ParentID)
	}
	return commit, nil
}

func (r *mutationResolver) Commit(ctx context.Context, input model.CommitInput) (*model.Commit, error) {
	refHead, ok := r.refHeads[input.RefHeadID]
	if !ok {
		return nil, errors.ErrRefHeadNotFound(input.RefHeadID)
	}

	// Validate
	if input.Row < 0 || input.Row >= 9 {
		return nil, errors.ErrInvalidInputCoordinate()
	}
	if input.Col < 0 || input.Col >= 9 {
		return nil, errors.ErrInvalidInputCoordinate()
	}

	if r.sudoku.HasConflictWithFixedBoard(input.Row, input.Col) {
		return nil, errors.ErrInvalidInputCoordinate()
	}

	// Create a commit
	commit := &model.Commit{
		ID:  uuid.NewString(),
		Row: input.Row,
		Col: input.Col,
		Val: input.Val,
	}
	refHead.AddCommit(commit)
	r.commits[commit.ID] = commit

	return commit, nil
}

func (r *queryResolver) Sudoku(ctx context.Context) (*model.Sudoku, error) {
	return r.sudoku, nil
}

func (r *queryResolver) RefHead(ctx context.Context, id string) (*model.RefHead, error) {
	refHead, ok := r.refHeads[id]
	if !ok {
		return nil, errors.ErrRefHeadNotFound(id)
	}
	return refHead, nil
}

func (r *queryResolver) Commit(ctx context.Context, id string) (*model.Commit, error) {
	commit, ok := r.commits[id]
	if !ok {
		return nil, errors.ErrCommitNotFound(id)
	}

	return commit, nil
}

func (r *refHeadResolver) Commits(ctx context.Context, obj *model.RefHead) ([]*model.Commit, error) {
	commits := make([]*model.Commit, 0)
	if obj.CommitID == nil {
		return commits, nil
	}

	for commitID := obj.CommitID; commitID != nil; commitID = r.commits[*commitID].ParentID {
		commit, ok := r.commits[*commitID]
		if !ok {
			return nil, errors.ErrCommitNotFound(*commitID)
		}
		commits = append(commits, commit)
	}

	return commits, nil
}

func (r *subscriptionResolver) CommitAdded(ctx context.Context, refHeadID string) (<-chan *model.Commit, error) {
	refHead, ok := r.refHeads[refHeadID]
	if !ok {
		return nil, errors.ErrRefHeadNotFound(refHeadID)
	}

	// Add a new observer
	observerID := uuid.NewString()
	commits, cleanUp, err := refHead.AddObserver(observerID)
	if err != nil {
		return nil, err
	}

	// Start a watcher to clean up the observer once the connection is disconnected
	go func() {
		<-ctx.Done()
		cleanUp()
	}()

	return commits, nil
}

func (r *sudokuResolver) RefHead(ctx context.Context, obj *model.Sudoku) (*model.RefHead, error) {
	refHead, ok := r.refHeads[obj.RefHeadID]
	if !ok {
		return nil, errors.ErrRefHeadNotFound(obj.RefHeadID)
	}

	return refHead, nil
}

// Commit returns generated.CommitResolver implementation.
func (r *Resolver) Commit() generated.CommitResolver { return &commitResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// RefHead returns generated.RefHeadResolver implementation.
func (r *Resolver) RefHead() generated.RefHeadResolver { return &refHeadResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

// Sudoku returns generated.SudokuResolver implementation.
func (r *Resolver) Sudoku() generated.SudokuResolver { return &sudokuResolver{r} }

type commitResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type refHeadResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
type sudokuResolver struct{ *Resolver }
