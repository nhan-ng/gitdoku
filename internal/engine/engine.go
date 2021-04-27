package engine

import (
	"errors"
	"fmt"
	"strings"
)

var (
	ErrInvalidCoordinate          = errors.New("engine: invalid coordinate")
	ErrInvalidValue               = errors.New("engine: invalid value")
	ErrCannotChangeFixedPosition  = errors.New("engine: attempt to update a fixed slot")
	ErrCannotUndoEmptyHistory     = errors.New("engine: unable to undo empty history")
	ErrCannotRedoEmptyRedoHistory = errors.New("engine: unable to redo without any undo")
)

type Sudoku struct {
	Board [][]int

	initial [][]int

	history     []move
	redoHistory []move
}

func NewSudoku(initial [][]int) (*Sudoku, error) {
	return &Sudoku{
		Board:       duplicate(initial),
		initial:     duplicate(initial),
		history:     make([]move, 0),
		redoHistory: make([]move, 0),
	}, nil
}

func (s *Sudoku) Change(row, col, val int) error {
	// Validate
	if row <= 0 || row > 9 {
		return ErrInvalidCoordinate
	}
	if col <= 0 || col > 9 {
		return ErrInvalidCoordinate
	}
	if s.initial[row-1][col-1] != 0 {
		return ErrCannotChangeFixedPosition
	}
	if val <= 0 || val > 9 {
		return ErrInvalidValue
	}

	// Get the existing value
	prevVal := s.Board[row-1][col-1]

	// Do nothing if the value is the same so we don't mess up the history
	if prevVal == val {
		return nil
	}

	// Save the move
	s.Board[row-1][col-1] = val
	s.push(&s.history, move{
		row:     row,
		col:     col,
		val:     val,
		prevVal: prevVal,
	})
	return nil
}

func (s *Sudoku) Undo() error {
	if len(s.history) == 0 {
		return ErrCannotUndoEmptyHistory
	}

	// Migrate a move from history to redo history
	m := s.pop(&s.history)
	s.push(&s.redoHistory, m)

	// Revert the board board state
	s.Board[m.row-1][m.col-1] = m.prevVal
	return nil
}

func (s *Sudoku) Redo() error {
	if len(s.redoHistory) == 0 {
		return ErrCannotRedoEmptyRedoHistory
	}

	// Redo the move
	m := s.pop(&s.redoHistory)
	return s.Change(m.row, m.col, m.val)
}

func (s *Sudoku) Validate() bool {
	// Validate every row
	for _, row := range s.Board {
		if !s.validateNumbers(row) {
			return false
		}
	}

	// Validate every column
	for i := 0; i < 9; i++ {
		column := make([]int, 9)
		for j := 0; j < 9; j++ {
			column[j] = s.Board[j][i]
		}
		if !s.validateNumbers(column) {
			return false
		}
	}

	// Validate every box
	for i := 0; i < 9; i += 3 {
		for j := 0; j < 9; j += 3 {
			box := make([]int, 0)
			box = append(box, s.Board[i][j:j+3]...)
			box = append(box, s.Board[i+1][j:j+3]...)
			box = append(box, s.Board[i+2][j:j+3]...)

			if !s.validateNumbers(box) {
				return false
			}
		}
	}

	return true
}

func (s *Sudoku) push(h *[]move, m move) {
	*h = append(*h, m)
}

func (s *Sudoku) pop(h *[]move) move {
	res := (*h)[len(*h)-1]
	*h = (*h)[:len(*h)-1]
	return res
}

func (s *Sudoku) validateNumbers(numbers []int) bool {
	checkList := make([]bool, 10)
	for _, num := range numbers {
		if num < 0 || num > 9 {
			return false
		}
		if num == 0 {
			continue
		}
		if checkList[num] { // Duplicate
			return false
		} else {
			checkList[num] = true
		}
	}

	return true
}

func (s *Sudoku) String() string {
	var str strings.Builder
	fmt.Fprintln(&str, "    1  2  3     4  5  6     7  8  9   ")
	fmt.Fprintln(&str, " -------------------------------------")
	for i := 0; i < 9; i++ {
		fmt.Fprintf(&str, "%d| ", i+1)
		for j := 0; j < 9; j++ {
			num := s.Board[i][j]
			if num == 0 {
				fmt.Fprint(&str, "   ")
			} else {
				fmt.Fprintf(&str, " %d ", num)
			}

			if j%3 == 2 {
				fmt.Fprint(&str, " | ")
			}
		}
		fmt.Fprint(&str, "\n")
		if i%3 == 2 {
			fmt.Fprintln(&str, " -------------------------------------")
		}
	}

	return str.String()
}

func duplicate(input [][]int) [][]int {
	result := make([][]int, len(input))
	for i := range input {
		result[i] = make([]int, len(input[i]))
		copy(result[i], input[i])
	}

	return result
}
