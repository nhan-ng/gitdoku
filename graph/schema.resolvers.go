package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/go-git/go-git/v5/plumbing"
	"github.com/google/uuid"
	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/nhan-ng/sudoku/graph/gqlerrors"
	"github.com/nhan-ng/sudoku/graph/model"
	"go.uber.org/zap"
)

func (r *branchResolver) Commit(ctx context.Context, obj *model.Branch) (*model.Commit, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *branchResolver) Commits(ctx context.Context, obj *model.Branch) ([]*model.Commit, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *commitResolver) Parent(ctx context.Context, obj *model.Commit) (*model.Commit, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *commitResolver) Blob(ctx context.Context, obj *model.Commit) (*model.Blob, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) AddCommit(ctx context.Context, input model.AddCommitInput) (*model.Commit, error) {
	// Validate
	if input.Row < 0 || input.Row >= 9 {
		return nil, gqlerrors.ErrInvalidInputCoordinate()
	}
	if input.Col < 0 || input.Col >= 9 {
		return nil, gqlerrors.ErrInvalidInputCoordinate()
	}
	if r.sudoku.HasConflictWithFixedBoard(input.Row, input.Col) {
		return nil, gqlerrors.ErrInvalidInputCoordinate()
	}

	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) AddBranch(ctx context.Context, input model.AddBranchInput) (*model.Branch, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, err := r.repo.Reference(plumbing.NewBranchReferenceName(input.ID), false)
	if err == nil {
		return nil, gqlerrors.ErrBranchAlreadyExists(input.ID)
	}

	// Validate
	if input.CommitID == nil && input.BranchID == nil {
		return nil, gqlerrors.ErrInvalidInputCoordinate()
	}

	var commitID plumbing.Hash
	if input.CommitID != nil {
		commitID = plumbing.NewHash(*input.CommitID)
	} else {
		ref, err := r.repo.Reference(plumbing.NewBranchReferenceName(*input.BranchID), false)
		if err != nil {
			return nil, gqlerrors.ErrBranchNotFound(*input.BranchID)
		}
		commitID = ref.Hash()
	}

	_, err = r.repo.CommitObject(commitID)
	if err != nil {
		return nil, gqlerrors.ErrCommitNotFound(commitID.String())
	}

	newRef := plumbing.NewHashReference(plumbing.NewBranchReferenceName(input.ID), commitID)
	err = r.repo.Storer.SetReference(newRef)
	if err != nil {
		return nil, fmt.Errorf("failed to create a new branch: %w", err)
	}

	return ConvertBranch(newRef), nil
}

func (r *queryResolver) Sudoku(ctx context.Context) (*model.Sudoku, error) {
	return r.sudoku, nil
}

func (r *queryResolver) Branch(ctx context.Context, id string) (*model.Branch, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	ref, err := r.repo.Reference(plumbing.NewBranchReferenceName(id), false)
	if err != nil {
		return nil, gqlerrors.ErrBranchNotFound(id)
	}
	zap.L().Info("Reference(resolved:false)", zap.Any("ref", ref))

	return ConvertBranch(ref), nil
}

func (r *queryResolver) Branches(ctx context.Context) ([]*model.Branch, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	refs, err := r.repo.References()
	if err != nil {
		return nil, fmt.Errorf("failed to read branches: %w", err)
	}

	branches := make([]*model.Branch, 0, len(r.branches))
	err = refs.ForEach(func(ref *plumbing.Reference) error {
		// Skip
		if !ref.Name().IsBranch() {
			return nil
		}

		branches = append(branches, ConvertBranch(ref))
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to convert branches: %w", err)
	}

	return branches, nil
}

func (r *queryResolver) Commit(ctx context.Context, id string) (*model.Commit, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	ref, err := r.repo.CommitObject(plumbing.NewHash(id))
	if err != nil {
		r.Error("Failed to get commit.", zap.Error(err))
		return nil, gqlerrors.ErrCommitNotFound(id)
	}

	var parentID *string
	if ref.NumParents() > 0 {
		*parentID = ref.ParentHashes[0].String()
	}

	return &model.Commit{
		ID:              ref.Hash.String(),
		ParentID:        parentID,
		Type:            model.CommitTypeAddFill,
		AuthorID:        ref.Author.String(),
		AuthorTimestamp: ref.Author.When,
	}, nil
}

func (r *subscriptionResolver) CommitAdded(ctx context.Context, branchID string) (<-chan *model.Commit, error) {
	branch, ok := r.branches[branchID]
	if !ok {
		return nil, gqlerrors.ErrBranchNotFound(branchID)
	}

	// Add a new observer
	observerID := uuid.NewString()
	commits, cleanUp, err := branch.AddObserver(observerID)
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

func (r *sudokuResolver) Branch(ctx context.Context, obj *model.Sudoku) (*model.Branch, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	ref, err := r.repo.Reference(plumbing.NewBranchReferenceName(obj.BranchID), false)
	if err != nil {
		return nil, gqlerrors.ErrBranchNotFound(obj.BranchID)
	}

	return ConvertBranch(ref), nil
}

// Branch returns generated.BranchResolver implementation.
func (r *Resolver) Branch() generated.BranchResolver { return &branchResolver{r} }

// Commit returns generated.CommitResolver implementation.
func (r *Resolver) Commit() generated.CommitResolver { return &commitResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

// Sudoku returns generated.SudokuResolver implementation.
func (r *Resolver) Sudoku() generated.SudokuResolver { return &sudokuResolver{r} }

type branchResolver struct{ *Resolver }
type commitResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
type sudokuResolver struct{ *Resolver }
