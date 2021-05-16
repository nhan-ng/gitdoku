//go:generate go run github.com/99designs/gqlgen
package graph

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/go-git/go-git/v5/plumbing"

	"github.com/go-git/go-git/v5/plumbing/cache"
	"github.com/go-git/go-git/v5/storage/filesystem"

	"github.com/go-git/go-billy/v5/osfs"

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

type Resolver struct {
	sudoku   *model.Sudoku
	commits  map[string]*model.Commit
	branches map[string]*model.Branch

	repo *git.Repository

	mu sync.RWMutex

	*zap.Logger
}

func NewResolver() (*generated.Config, error) {
	board, err := engine.ReadBoard(sampleSudoku)
	if err != nil {
		return nil, fmt.Errorf("failed to create a Sudoku: %w", err)
	}

	repo, err := gitInit(board)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize git: %w", err)
	}

	return &generated.Config{
		Resolvers: &Resolver{
			repo:   repo,
			Logger: zap.L(),
		},
	}, nil
}

func convertBoard(board [][]int) [][]model.Cell {
	result := make([][]model.Cell, 9)
	for i := 0; i < 9; i++ {
		row := make([]model.Cell, 9)
		for j := 0; j < 9; j++ {
			val := board[i][j]
			row[j] = model.Cell{
				Immutable: val != 0,
				Val:       val,
				Notes:     make([]int, 0),
			}
		}
		result[i] = row
	}

	return result
}

func gitInit(board engine.Board) (*git.Repository, error) {
	// Initialize repo
	//fs := memfs.New()
	path, err := ioutil.TempDir("", "gitdoku")
	if err != nil {
		return nil, fmt.Errorf("failed to create a temp dir for repo: %w", err)
	}
	fs := osfs.New(path)
	storerFS := osfs.New(filepath.Join(path, ".git"))
	storer := filesystem.NewStorage(storerFS, cache.NewObjectLRUDefault())
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

	zap.L().Info("Initialized origin repo.", zap.String("commitId", commitID.String()), zap.String("path", path))

	return repo, nil
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

func MarshalBlob(data []byte) (*model.Blob, error) {
	var board engine.Board
	err := board.Unmarshal(data)
	if err != nil || board == nil {
		return nil, fmt.Errorf("unable to unmarshal data: %w", err)
	}

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

	return &model.Blob{Board: b}, nil
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
