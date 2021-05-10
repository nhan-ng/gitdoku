package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"sort"

	"github.com/google/uuid"
	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/nhan-ng/sudoku/graph/gqlerrors"
	"github.com/nhan-ng/sudoku/graph/model"
)

func (r *branchResolver) Commits(ctx context.Context, obj *model.Branch) ([]*model.Commit, error) {
	commits := make([]*model.Commit, 0)
	for commit := obj.Commit; commit != nil; {
		commits = append(commits, commit)
		if parentID := commit.ParentID; parentID == nil {
			commit = nil
		} else {
			var ok bool
			commit, ok = r.commits[*parentID]
			if !ok {
				return nil, gqlerrors.ErrCommitNotFound(*parentID)
			}
		}
	}

	return commits, nil
}

func (r *commitResolver) Parent(ctx context.Context, obj *model.Commit) (*model.Commit, error) {
	if obj.ParentID == nil {
		return nil, nil
	}

	commit, ok := r.commits[*obj.ParentID]
	if !ok {
		return nil, gqlerrors.ErrCommitNotFound(*obj.ParentID)
	}
	return commit, nil
}

func (r *mutationResolver) AddCommit(ctx context.Context, input model.AddCommitInput) (*model.Commit, error) {
	branch, ok := r.branches[input.BranchID]
	if !ok {
		return nil, gqlerrors.ErrBranchNotFound(input.BranchID)
	}

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
	commit := &model.Commit{
		ID:       uuid.NewString(),
		AuthorID: "me",
		Type:     input.Type,
		Row:      input.Row,
		Col:      input.Col,
		Val:      input.Val,
	}
	branch.AddCommit(commit)
	r.commits[commit.ID] = commit

	return commit, nil
}

func (r *mutationResolver) AddBranch(ctx context.Context, input model.AddBranchInput) (*model.Branch, error) {
	// Validate
	_, ok := r.branches[input.ID]
	if ok {
		return nil, gqlerrors.ErrBranchAlreadyExists(input.ID)
	}
	if input.CommitID == nil && input.BranchID == nil {
		return nil, gqlerrors.ErrInvalidInputCoordinate()
	}

	var commitID string
	if input.CommitID != nil {
		commitID = *input.CommitID
	} else {
		branch, ok := r.branches[*input.BranchID]
		if !ok {
			return nil, gqlerrors.ErrBranchNotFound(*input.BranchID)
		}
		commitID = branch.CommitID
	}

	// Add a new ref head
	commit, ok := r.commits[commitID]
	if !ok {
		return nil, gqlerrors.ErrCommitNotFound(commitID)
	}
	branch := model.NewBranch(input.ID, commit)
	r.branches[input.ID] = branch
	return branch, nil
}

func (r *queryResolver) Sudoku(ctx context.Context) (*model.Sudoku, error) {
	return r.sudoku, nil
}

func (r *queryResolver) Branch(ctx context.Context, id string) (*model.Branch, error) {
	branch, ok := r.branches[id]
	if !ok {
		return nil, gqlerrors.ErrBranchNotFound(id)
	}
	return branch, nil
}

func (r *queryResolver) Branches(ctx context.Context) ([]*model.Branch, error) {
	branches := make([]*model.Branch, 0, len(r.branches))
	for _, branch := range r.branches {
		branches = append(branches, branch)
	}
	sort.SliceStable(branches, func(i, j int) bool {
		// Sort by timestamp desc
		return branches[i].Commit.AuthorTimestamp.After(branches[j].Commit.AuthorTimestamp)
	})
	return branches, nil
}

func (r *queryResolver) Commit(ctx context.Context, id string) (*model.Commit, error) {
	commit, ok := r.commits[id]
	if !ok {
		return nil, gqlerrors.ErrCommitNotFound(id)
	}

	return commit, nil
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
	branch, ok := r.branches[obj.BranchID]
	if !ok {
		return nil, gqlerrors.ErrBranchNotFound(obj.BranchID)
	}

	return branch, nil
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
