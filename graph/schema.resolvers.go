package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	git "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/google/uuid"
	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/nhan-ng/sudoku/graph/gqlerrors"
	"github.com/nhan-ng/sudoku/graph/model"
	"go.uber.org/zap"
)

func (r *branchResolver) Commit(ctx context.Context, obj *model.Branch) (*model.Commit, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	commit, err := r.repo.CommitObject(plumbing.NewHash(obj.CommitID))
	if err != nil {
		return nil, gqlerrors.ErrCommitNotFound(obj.CommitID)
	}

	result, err := ConvertCommit(commit)
	if err != nil {
		return nil, fmt.Errorf("failed to convert result: %w", err)
	}

	return result, nil
}

func (r *branchResolver) Commits(ctx context.Context, obj *model.Branch) ([]*model.Commit, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	commits, err := r.repo.Log(&git.LogOptions{
		From: plumbing.NewHash(obj.CommitID),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get all commits: %w", err)
	}

	result := make([]*model.Commit, 0)
	err = commits.ForEach(func(c *object.Commit) error {
		commit, err := ConvertCommit(c)
		if err != nil {
			return fmt.Errorf("failed to convert commit: %w", err)
		}
		result = append(result, commit)
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to load parent commits: %w", err)
	}

	return result, nil
}

func (r *commitResolver) Parents(ctx context.Context, obj *model.Commit) ([]*model.Commit, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := make([]*model.Commit, 0, len(obj.ParentIDs))
	for _, parentID := range obj.ParentIDs {
		parentCommit, err := r.repo.CommitObject(plumbing.NewHash(parentID))
		if err != nil {
			return nil, gqlerrors.ErrCommitNotFound(parentID)
		}
		c, err := ConvertCommit(parentCommit)
		if err != nil {
			return nil, fmt.Errorf("failed to convert parent commit: %w", err)
		}
		result = append(result, c)
	}

	return result, nil
}

func (r *commitResolver) Blob(ctx context.Context, obj *model.Commit) (*model.Blob, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	commit, err := r.repo.CommitObject(plumbing.NewHash(obj.ID))
	if err != nil {
		return nil, fmt.Errorf("failed to read commit: %w", err)
	}

	board, err := ReadBoard(commit)
	if err != nil {
		return nil, fmt.Errorf("failed to read board: %w", err)
	}

	return ConvertBlob(board), nil
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

	// Create a commit
	r.mu.Lock()
	defer r.mu.Unlock()

	// Verify the branch
	ref, err := r.repo.Reference(plumbing.NewBranchReferenceName(input.BranchID), false)
	if err != nil {
		return nil, gqlerrors.ErrBranchNotFound(input.BranchID)
	}

	// Create a commit
	wt, err := r.repo.Worktree()
	if err != nil {
		return nil, fmt.Errorf("failed to get worktree: %w", err)
	}

	// Checkout
	err = wt.Checkout(&git.CheckoutOptions{
		Branch: ref.Name(),
		Force:  true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get worktree: %w", err)
	}

	// Make the change
	board, err := r.ReadBoard()
	if err != nil {
		return nil, fmt.Errorf("failed to read board from current worktree: %w", err)
	}

	cell := &board[input.Row][input.Col]
	switch input.Type {
	case model.CommitTypeAddFill:
		cell.Value = input.Val

	case model.CommitTypeRemoveFill:
		cell.Value = 0

	case model.CommitTypeAddNote:
		cell.Notes[input.Val-1] = true

	case model.CommitTypeRemoveNote:
		cell.Notes[input.Val-1] = false
	}

	commitMessage := fmt.Sprintf("%s %d %d %d", input.Type, input.Row, input.Col, input.Val)

	// Commit the change
	c, err := r.CommitBoard(board, commitMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to commit the board change: %w", err)
	}
	commit, err := ConvertCommit(c)
	if err != nil {
		return nil, fmt.Errorf("failed to convert commit: %w", err)
	}

	// Broadcast the change
	r.NotifyObservers(input.BranchID, commit)

	return commit, nil
}

func (r *mutationResolver) AddBranch(ctx context.Context, input model.AddBranchInput) (*model.Branch, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, err := r.repo.Reference(plumbing.NewBranchReferenceName(input.ID), false)
	if err == nil {
		return nil, gqlerrors.ErrBranchAlreadyExists(input.ID)
	}

	// Validate that both arguments can't be specified
	if input.CommitID == nil && input.BranchID == nil {
		return nil, gqlerrors.ErrInvalidInputCoordinate()
	}

	// Determine which argument to use
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

	// Check if the commit exists
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

	refs, err := r.repo.Branches()
	if err != nil {
		return nil, fmt.Errorf("failed to read branches: %w", err)
	}

	branches := make([]*model.Branch, 0)
	err = refs.ForEach(func(ref *plumbing.Reference) error {
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

	commit, err := r.repo.CommitObject(plumbing.NewHash(id))
	if err != nil {
		r.Error("Failed to get commit.", zap.Error(err))
		return nil, gqlerrors.ErrCommitNotFound(id)
	}

	result, err := ConvertCommit(commit)
	if err != nil {
		return nil, fmt.Errorf("failed to convert commit: %w", err)
	}

	return result, nil
}

func (r *subscriptionResolver) CommitAdded(ctx context.Context, branchID string) (<-chan *model.Commit, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	commitsChan, cleanUp, err := r.AddBranchObserver(branchID, uuid.NewString())
	if err != nil {
		return nil, fmt.Errorf("failed to add observer: %w", err)
	}

	// Add a defered clean up
	go func() {
		<-ctx.Done()
		r.mu.Lock()
		defer r.mu.Unlock()
		cleanUp()
	}()

	return commitsChan, nil
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
