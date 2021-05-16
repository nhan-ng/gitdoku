//go:generate go run github.com/99designs/gqlgen
package graph

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-git/go-git/v5/storage"

	"github.com/go-git/go-billy/v5/osfs"
	"github.com/go-git/go-git/v5/plumbing/cache"
	"github.com/go-git/go-git/v5/storage/filesystem"

	"github.com/go-git/go-billy/v5/memfs"
	"github.com/go-git/go-git/v5/storage/memory"

	"github.com/go-git/go-git/v5/plumbing"

	"github.com/go-git/go-git/v5/plumbing/object"

	"github.com/go-git/go-billy/v5"

	"go.uber.org/zap"

	git "github.com/go-git/go-git/v5"

	"github.com/nhan-ng/sudoku/graph/generated"
	"github.com/nhan-ng/sudoku/graph/model"
	"github.com/nhan-ng/sudoku/internal/engine"
)

const sampleSudoku = `070308100
040100000
000090082
001000500
000000230
000283070
094005000
526000700
000000009`

const gameFile = "game.dat"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type ObserverCleanUpFunc func()

type Resolver struct {
	sudoku *model.Sudoku

	branchObservers map[string]*BranchObserver

	repo *git.Repository
	fs   billy.Filesystem

	mu sync.RWMutex

	*zap.Logger
}

type BranchObserver struct {
	BranchID  string
	Observers map[string]chan *model.Commit
}

func NewResolver() (*generated.Config, error) {
	resolver, err := newGame()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize a new game: %w", err)
	}
	return &generated.Config{
		Resolvers: resolver,
	}, nil
}

func newGame() (*Resolver, error) {
	// Read the board
	board, err := engine.ReadBoard(sampleSudoku)
	if err != nil {
		return nil, fmt.Errorf("failed to create a Sudoku: %w", err)
	}

	// Initialize the backing fs
	var fs billy.Filesystem
	var storer storage.Storer
	useFS := false
	if useFS {
		// Initialize repo folder
		path, err := ioutil.TempDir("", "gitdoku")
		if err != nil {
			return nil, fmt.Errorf("failed to create a temp dir for repo: %w", err)
		}
		zap.L().Info("Initialized origin repo on filesystem.", zap.String("path", path))

		fs = osfs.New(path)
		storerFS := osfs.New(filepath.Join(path, ".git"))
		storer = filesystem.NewStorage(storerFS, cache.NewObjectLRUDefault())
	} else { // Memory
		zap.L().Info("Initialized origin repo in memory.")
		fs = memfs.New()
		storer = memory.NewStorage()
	}

	// Initialize the repo
	repo, err := git.Init(storer, fs)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize the repo: %w", err)
	}

	w, err := repo.Worktree()
	if err != nil {
		return nil, fmt.Errorf("failed to create worktree: %w", err)
	}

	// Add board to index
	boardContent, err := board.Marshal()
	if err != nil {
		return nil, fmt.Errorf("failed to marshal board: %w", err)
	}
	err = WriteFile(fs, gameFile, boardContent, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write data to file: %w", err)
	}
	_, err = w.Add(gameFile)
	if err != nil {
		return nil, fmt.Errorf("failed to add file to worktree: %w", err)
	}

	// Add board to index
	sig := &object.Signature{
		Name:  "Game Master",
		Email: "gm@gitdoku.io",
		When:  time.Now(),
	}
	commitID, err := w.Commit("Initial commit", &git.CommitOptions{
		Author:    sig,
		Committer: sig,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create initial commit: %w", err)
	}

	commits, err := repo.CommitObjects()
	if err != nil {
		return nil, fmt.Errorf("failed to create initial commit: %w", err)
	}

	err = commits.ForEach(func(commit *object.Commit) error {
		file, err := commit.File(gameFile)
		if err != nil {
			return err
		}
		content, err := file.Contents()
		if err != nil {
			return err
		}

		zap.L().Info("Commit: ", zap.String("commitId", commit.Hash.String()), zap.String("content", content))
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create initial commit: %w", err)
	}

	zap.L().Info("Initialized origin repo.", zap.String("commitId", commitID.String()))

	// Prepare the sudoku
	sudoku := &model.Sudoku{
		BranchID: "master",
		Board:    board.GetImmutableBoards(),
	}

	// Prepare the observers
	branchObservers := make(map[string]*BranchObserver)

	return &Resolver{
		sudoku:          sudoku,
		repo:            repo,
		fs:              fs,
		branchObservers: branchObservers,
		Logger:          zap.L(),
	}, nil
}

func (r *Resolver) AddBranchObserver(branchID, observerID string) (<-chan *model.Commit, ObserverCleanUpFunc, error) {
	branch, ok := r.branchObservers[branchID]
	if !ok {
		branch = &BranchObserver{
			BranchID:  branchID,
			Observers: make(map[string]chan *model.Commit),
		}
		r.branchObservers[branchID] = branch
	}

	// Add the observer in
	observers := branch.Observers
	commitsChan := make(chan *model.Commit, 3)
	observers[observerID] = commitsChan
	cleanUp := func() {
		delete(observers, observerID)
	}

	return commitsChan, cleanUp, nil
}

func (r *Resolver) NotifyObservers(branchID string, commit *model.Commit) {
	branch, ok := r.branchObservers[branchID]
	if !ok {
		return
	}

	for _, observer := range branch.Observers {
		observer <- commit
	}
}

func (r *Resolver) Close() error {
	type fsBased interface {
		Filesystem() billy.Filesystem
	}

	fs, isFSBased := r.fs.(fsBased)
	if !isFSBased {
		return nil
	}

	root := fs.Filesystem().Root()
	r.Info("Removing root folder.", zap.String("root", root))

	// Clean up filesystem
	return os.RemoveAll(root)
}

func (r *Resolver) ReadBoard() (engine.Board, error) {
	// Get the head commit
	ref, err := r.repo.Head()
	if err != nil {
		return nil, fmt.Errorf("failed to get HEAD: %w", err)
	}

	commit, err := r.repo.CommitObject(ref.Hash())
	if err != nil {
		return nil, fmt.Errorf("failed to read HEAD commit %s: %w", ref.Hash().String(), err)
	}

	// Read file
	board, err := ReadBoard(commit)
	if err != nil {
		return nil, fmt.Errorf("failed to read board: %w", err)
	}

	return board, nil
}

func (r *Resolver) CommitBoard(board engine.Board, message string) (*object.Commit, error) {
	// Add board to index
	boardContent, err := board.Marshal()
	if err != nil {
		return nil, fmt.Errorf("failed to marshal board: %w", err)
	}

	wt, err := r.repo.Worktree()
	if err != nil {
		return nil, fmt.Errorf("failed to get worktree: %w", err)
	}
	r.writeGameFile(boardContent)

	// Add the change
	_, err = wt.Add(gameFile)
	if err != nil {
		return nil, fmt.Errorf("failed to add file to worktree: %w", err)
	}

	// Add board to index
	sig := &object.Signature{
		Name:  "Game Master",
		Email: "gm@gitdoku.io",
		When:  time.Now(),
	}
	commitID, err := wt.Commit(message, &git.CommitOptions{
		Author:    sig,
		Committer: sig,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to commit: %w", err)
	}

	commit, err := r.repo.CommitObject(commitID)
	if err != nil {
		return nil, fmt.Errorf("failed to load the commit %s: %w", commitID.String(), err)
	}

	return commit, nil
}

func (r *Resolver) writeGameFile(data []byte) error {
	err := WriteFile(r.fs, gameFile, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write data to file: %w", err)
	}
	return nil
}

func ReadBoard(commit *object.Commit) (engine.Board, error) {
	// Read file
	file, err := commit.File(gameFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read game file: %w", err)
	}
	content, err := file.Contents()
	if err != nil {
		return nil, fmt.Errorf("failed to read game file content: %w", err)
	}

	// Marshal the board
	board, err := MarshalBoard([]byte(content))
	if err != nil {
		return nil, fmt.Errorf("failed to marshal board from game file content: %w", err)
	}

	return board, nil
}

func WriteFile(fs billy.Filesystem, filename string, data []byte, perm os.FileMode) error {
	f, err := fs.OpenFile(filename, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, perm)
	if err != nil {
		return err
	}

	n, err := f.Write(data)
	if err == nil && n < len(data) {
		err = io.ErrShortWrite
	}
	if err1 := f.Close(); err == nil {
		err = err1
	}
	return err
}

func MarshalBoard(data []byte) (engine.Board, error) {
	var board engine.Board
	err := board.Unmarshal(data)
	if err != nil || board == nil {
		return nil, fmt.Errorf("unable to unmarshal data: %w", err)
	}

	return board, nil
}

func ConvertBlob(board engine.Board) *model.Blob {
	// Convert from blob to board
	b := make([][]model.Cell, 9)
	for i, row := range board {
		r := make([]model.Cell, 9)
		for j, cell := range row {
			r[j] = model.Cell{
				Immutable: cell.Immutable,
				Val:       cell.Value,
				Notes:     cell.Notes.AsNumbers(),
			}
		}
		b[i] = r
	}

	return &model.Blob{Board: b}
}

func ConvertBranch(ref *plumbing.Reference) *model.Branch {
	if ref == nil {
		return nil
	}

	return &model.Branch{
		ID:       ref.Name().Short(),
		CommitID: ref.Hash().String(),
	}
}

func ConvertCommit(commit *object.Commit) (*model.Commit, error) {
	if commit == nil {
		return nil, nil
	}

	parentIDs := make([]string, 0, len(commit.ParentHashes))
	for _, parentID := range commit.ParentHashes {
		parentIDs = append(parentIDs, parentID.String())
	}

	result := &model.Commit{
		ID:              commit.Hash.String(),
		ParentIDs:       parentIDs,
		AuthorID:        commit.Author.String(),
		AuthorTimestamp: commit.Author.When,
	}

	// Parse message only if it's not a merge commit, a merge commit has multiple parents
	if len(parentIDs) == 1 {
		parts := strings.Split(commit.Message, " ")
		result.Type = model.CommitType(parts[0])

		row, err := strconv.Atoi(parts[1])
		if err != nil {
			return nil, fmt.Errorf("failed to parse row in message: %w", err)
		}
		result.Row = row

		col, err := strconv.Atoi(parts[2])
		if err != nil {
			return nil, fmt.Errorf("failed to parse col in message: %w", err)
		}
		result.Col = col

		val, err := strconv.Atoi(parts[3])
		if err != nil {
			return nil, fmt.Errorf("failed to parse value in message: %w", err)
		}
		result.Val = val
	}

	return result, nil
}
