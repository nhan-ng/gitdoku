package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"sort"

	git "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/google/uuid"
	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/nhan-ng/sudoku/graph/gqlerrors"
	"github.com/nhan-ng/sudoku/graph/model"
	"github.com/nhan-ng/sudoku/internal/cmd/server/middleware"
	"github.com/nhan-ng/sudoku/internal/namesgenerator"
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

func (r *mutationResolver) AddCommit(ctx context.Context, input model.AddCommitInput) (*model.AddCommitPayload, error) {
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

	// Verify the author
	player, err := r.getPlayer(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get player: %w", err)
	}

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

	case model.CommitTypeToggleNote:
		cell.Notes[input.Val-1] = !cell.Notes[input.Val-1]
	}

	commitMessage := fmt.Sprintf("%s %d %d %d", input.Type, input.Row, input.Col, input.Val)

	// Commit the change
	c, err := r.CommitBoard(wt, board, commitMessage, player)
	if err != nil {
		return nil, fmt.Errorf("failed to commit the board change: %w", err)
	}
	commit, err := ConvertCommit(c)
	if err != nil {
		return nil, fmt.Errorf("failed to convert commit: %w", err)
	}

	// Broadcast the change
	r.NotifyObservers(input.BranchID, commit)

	return &model.AddCommitPayload{
		Commit: commit,
	}, nil
}

func (r *mutationResolver) AddBranch(ctx context.Context, input model.AddBranchInput) (*model.AddBranchPayload, error) {
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

	return &model.AddBranchPayload{
		Branch: ConvertBranch(newRef),
	}, nil
}

func (r *mutationResolver) MergeBranch(ctx context.Context, input model.MergeBranchInput) (*model.MergeBranchPayload, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Get player
	player, err := r.getPlayer(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get player: %w", err)
	}

	// Get source
	sourceRef, err := r.repo.Reference(plumbing.NewBranchReferenceName(input.SourceBranchID), false)
	if err != nil {
		return nil, gqlerrors.ErrBranchNotFound(input.SourceBranchID)
	}
	sourceCommit, err := r.repo.CommitObject(sourceRef.Hash())
	if err != nil {
		return nil, gqlerrors.ErrCommitNotFound(sourceRef.Hash().String())
	}

	// Get target
	targetRef, err := r.repo.Reference(plumbing.NewBranchReferenceName(input.TargetBranchID), false)
	if err != nil {
		return nil, fmt.Errorf("failed to get target branch: %w", err)
	}
	targetCommit, err := r.repo.CommitObject(targetRef.Hash())
	if err != nil {
		return nil, gqlerrors.ErrCommitNotFound(targetRef.Hash().String())
	}

	bases, err := sourceCommit.MergeBase(targetCommit)
	if err != nil {
		return nil, fmt.Errorf("failed to find merge base: %w", err)
	}

	// Cris-cross scenario
	// Recursive merge strategy would create a virtual branch, but that's a bit complicated
	//	---1---o---A
	//	    \ /
	//	     X
	//	    / \
	//	---2---o---o---B
	if len(bases) != 1 {
		return nil, fmt.Errorf("failed to merge branches with more than 1 ancestors")
	}

	// If base == source then we can fast-forward because source is ancestor of target
	if bases[0].Hash == sourceRef.Hash() {
		newRef := plumbing.NewHashReference(sourceRef.Name(), targetCommit.Hash)
		r.repo.Storer.SetReference(newRef)

		return &model.MergeBranchPayload{
			SourceBranch: ConvertBranch(newRef),
		}, nil
	}

	baseCommitReached := fmt.Errorf("base commit reached")

	// Otherwise, use operation-base merge instead of git 3-way recursive state-base merge
	// Coalesce the commits of the 2 branches, chronologically sorted and perform the commits on top the base ancestor
	commits := make(map[plumbing.Hash]*object.Commit)
	base := bases[0]
	sourceCommitsIter, err := r.repo.Log(&git.LogOptions{
		From:  sourceCommit.Hash,
		Order: git.LogOrderCommitterTime,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get the commits from source branch")
	}
	err = sourceCommitsIter.ForEach(func(c *object.Commit) error {
		// We are done here
		if base.Hash == c.Hash {
			return baseCommitReached
		}

		commits[c.Hash] = c
		return nil
	})
	if err != nil && err != baseCommitReached {
		return nil, fmt.Errorf("failed to iterate through commits from source branch: %w", err)
	}

	targetCommitsIter, err := r.repo.Log(&git.LogOptions{
		From:  targetCommit.Hash,
		Order: git.LogOrderCommitterTime,
	})
	err = targetCommitsIter.ForEach(func(c *object.Commit) error {
		if base.Hash == c.Hash {
			return baseCommitReached
		}

		commits[c.Hash] = c
		return nil
	})
	if err != nil && err != baseCommitReached {
		return nil, fmt.Errorf("failed to iterate through commits from target branch: %w", err)
	}

	// Sort commit based on commit time
	sortedCommits := make([]*object.Commit, 0, len(commits))
	for _, commit := range commits {
		sortedCommits = append(sortedCommits, commit)
	}
	sort.SliceStable(sortedCommits, func(i, j int) bool {
		a := sortedCommits[i]
		b := sortedCommits[j]
		return a.Author.When.Before(b.Author.When)
	})

	board, err := ReadBoard(base)
	if err != nil {
		return nil, fmt.Errorf("failed to get base board: %w", err)
	}

	// For each commits, apply the change
	for _, commit := range sortedCommits {
		board, err = ApplyCommit(board, commit)
		if err != nil {
			return nil, fmt.Errorf("failed to apply commit %s: %w", commit.Hash.String(), err)
		}
	}

	// Commit that new board as the merge commit
	wt, err := r.repo.Worktree()
	if err != nil {
		return nil, fmt.Errorf("failed to get the worktree: %w", err)
	}
	err = wt.Checkout(&git.CheckoutOptions{
		Branch: sourceRef.Name(),
		Force:  true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to checkout the source commit: %w", err)
	}
	_, err = r.CommitBoard(wt, board, fmt.Sprintf("MERGE %s %s", input.SourceBranchID, input.TargetBranchID), player)
	if err != nil {
		return nil, fmt.Errorf("failed to create a merge commit: %w", err)
	}

	// Not support other form of merging yet :(
	return &model.MergeBranchPayload{SourceBranch: ConvertBranch(sourceRef)}, nil
}

func (r *mutationResolver) Join(ctx context.Context) (*model.JoinPayload, error) {
	// Get the IP address from the request
	ip, err := middleware.ForContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get the user's IP")
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	// Return the player if already used
	player, exist := r.players[ip]
	if exist {
		return &model.JoinPayload{Player: player}, nil
	}

	// Otherwise add a new player
	newPlayerName := namesgenerator.GetUniqueRandomName(r.playerNames)
	newPlayer := &model.Player{
		ID:          uuid.NewString(),
		DisplayName: newPlayerName,
	}
	r.playerNames[newPlayerName] = struct{}{}
	r.players[ip] = newPlayer

	return &model.JoinPayload{Player: newPlayer}, nil
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

func (r *queryResolver) Players(ctx context.Context) ([]*model.Player, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := make([]*model.Player, 0, len(r.players))
	for _, player := range r.players {
		result = append(result, player)
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
