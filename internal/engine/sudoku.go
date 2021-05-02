package engine

import (
	"bufio"
	"errors"
	"fmt"
	"math/rand"
	"strings"
)

var (
	ErrInvalidCoordinate          = errors.New("sudoku: invalid coordinate")
	ErrInvalidValue               = errors.New("sudoku: invalid value")
	ErrCannotChangeFixedPosition  = errors.New("sudoku: attempt to update a fixed slot")
	ErrCannotUndoEmptyHistory     = errors.New("sudoku: unable to undo empty history")
	ErrCannotRedoEmptyRedoHistory = errors.New("sudoku: unable to redo without any undo")
	ErrCannotSolveBoard           = errors.New("sudoku: unable to solve board")
	ErrCannotGiveHint             = errors.New("sudoku: unable to give a hint")
)

type Sudoku struct {
	Board [][]int

	initial     [][]int
	solvedBoard [][]int

	history     []move
	redoHistory []move
}

func NewSudokuFromRaw(input string) (*Sudoku, error) {
	// Read the file
	scanner := bufio.NewScanner(strings.NewReader(input))

	scanner.Split(bufio.ScanLines)
	board := make([][]int, 0)
	for scanner.Scan() {
		text := scanner.Text()
		row := make([]int, 0, 9)
		for _, num := range text {
			i := int(num - '0')
			row = append(row, i)
		}
		board = append(board, row)
	}

	return NewSudoku(board)
}

func NewSudoku(initial [][]int) (*Sudoku, error) {
	s := &Sudoku{
		Board:       duplicate(initial),
		initial:     duplicate(initial),
		solvedBoard: duplicate(initial),
		history:     make([]move, 0),
		redoHistory: make([]move, 0),
	}
	if !s.solve(s.solvedBoard, 0, 0) {
		return nil, ErrCannotSolveBoard
	}

	return s, nil
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
	return s.validate(s.Board)
}

func (s *Sudoku) Solve() error {
	board := duplicate(s.initial)
	if s.solve(board, 0, 0) {
		s.Board = board
		return nil
	}

	return ErrCannotSolveBoard
}

func (s *Sudoku) IsCompleted() bool {
	return s.isCompleted(s.Board)
}

func (s *Sudoku) Hint() error {
	// Choose a random offset square to start searching for an empty square
	rowOffset, colOffset := rand.Intn(9), rand.Intn(9)

	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			row := (i + rowOffset) % 9
			col := (j + colOffset) % 9
			if s.Board[row][col] == 0 {
				val := s.solvedBoard[row][col]
				err := s.Change(row+1, col+1, val)
				if err != nil {
					return fmt.Errorf("failed to apply hint at [%d][%d] with value (%d): %w", row+1, col+1, val, err)
				}

				fmt.Printf("Hint was given at [%d][%d]: %d\n", row+1, col+1, val)
				return nil
			}
		}
	}

	return ErrCannotGiveHint
}

func (s *Sudoku) validate(board [][]int) bool {
	// Validate every row
	for _, row := range board {
		if !s.validateNumbers(row) {
			return false
		}
	}

	// Validate every column
	for i := 0; i < 9; i++ {
		column := make([]int, 9)
		for j := 0; j < 9; j++ {
			column[j] = board[j][i]
		}
		if !s.validateNumbers(column) {
			return false
		}
	}

	// Validate every box
	for i := 0; i < 9; i += 3 {
		for j := 0; j < 9; j += 3 {
			box := make([]int, 0)
			box = append(box, board[i][j:j+3]...)
			box = append(box, board[i+1][j:j+3]...)
			box = append(box, board[i+2][j:j+3]...)

			if !s.validateNumbers(box) {
				return false
			}
		}
	}

	return true
}

func (s *Sudoku) isCompleted(board [][]int) bool {
	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			if board[i][j] == 0 {
				return false
			}
		}
	}

	return s.validate(board)
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

func (s *Sudoku) solve(board [][]int, startRow, startCol int) bool {
	for i := startRow; i < 9; i++ {
		for j := startCol; j < 9; j++ {
			cell := board[i][j]
			if cell != 0 {
				continue
			}

			// Try out each value 1-9
			for k := 1; k <= 9; k++ {
				board[i][j] = k
				if s.validate(board) {
					// Determine the next starting point
					nextCol := (j + 1) % 9
					nextRow := i + (j+1)/9
					if s.solve(board, nextRow, nextCol) {
						return true
					}
				}
			}

			// If none of the values solve, this isn't the solution, reset the square and fail
			board[i][j] = 0
			return false
		}

		// Next row, resetting starting col
		startCol = 0
	}

	return s.isCompleted(board)
}

func (s *Sudoku) String() string {
	return s.displayBoard(s.Board)
}

func (s *Sudoku) displayBoard(board [][]int) string {
	var str strings.Builder
	fmt.Fprintln(&str, "    1  2  3     4  5  6     7  8  9   ")
	fmt.Fprintln(&str, " -------------------------------------")
	for i := 0; i < 9; i++ {
		fmt.Fprintf(&str, "%d| ", i+1)
		for j := 0; j < 9; j++ {
			num := board[i][j]
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
