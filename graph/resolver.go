//go:generate go run github.com/99designs/gqlgen
package graph

import (
	"fmt"

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
	refHeads map[string]*model.RefHead
}

func NewResolver() (*generated.Config, error) {
	defaultRefHead := "master"
	r := &Resolver{
		commits: make(map[string]*model.Commit),
		refHeads: map[string]*model.RefHead{
			defaultRefHead: model.NewRefHead(defaultRefHead),
		},
	}

	sudoku, err := engine.NewSudokuFromRaw(sampleSudoku)
	if err != nil {
		return nil, fmt.Errorf("failed to create a Sudoku: %w", err)
	}

	r.sudoku = &model.Sudoku{
		RefHeadID: defaultRefHead,
		Board:     sudoku.Board,
	}
	return &generated.Config{
		Resolvers: r,
	}, nil
}
