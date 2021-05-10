//go:generate go run github.com/99designs/gqlgen
package graph

import (
	"fmt"

	"github.com/google/uuid"

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

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	sudoku   *model.Sudoku
	commits  map[string]*model.Commit
	branches map[string]*model.Branch
}

func NewResolver() (*generated.Config, error) {
	sudoku, err := engine.NewSudokuFromRaw(sampleSudoku)
	if err != nil {
		return nil, fmt.Errorf("failed to create a Sudoku: %w", err)
	}

	defaultBranch := "master"
	initialCommit := &model.Commit{
		ID:   uuid.NewString(),
		Type: model.CommitTypeInitial,
		Blob: model.Blob{
			Board: convertBoard(sudoku.Board),
		},
	}
	initialBranch := model.NewBranch(defaultBranch, initialCommit)
	r := &Resolver{
		commits: map[string]*model.Commit{
			initialCommit.ID: initialCommit,
		},
		branches: map[string]*model.Branch{
			defaultBranch: initialBranch,
		},
	}

	r.sudoku = &model.Sudoku{
		BranchID: defaultBranch,
		Board:    sudoku.Board,
	}
	return &generated.Config{
		Resolvers: r,
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
