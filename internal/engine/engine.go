package engine

import (
	"errors"
	"fmt"
	"strings"
)

var (
	InvalidCoordinateError         = errors.New("invalid coordinate")
	InvalidValueError              = errors.New("invalid value")
	CannotChangeFixedPositionError = errors.New("attempt to update a fixed slot")
)

type Sudoku struct {
	Board [][]int

	initial [][]int
}

func NewSudoku(initial [][]int) (*Sudoku, error) {
	return &Sudoku{
		Board:   duplicate(initial),
		initial: duplicate(initial),
	}, nil
}

func (s *Sudoku) Change(row, col, val int) error {
	// Validate
	if row <= 0 || row > 9 {
		return InvalidCoordinateError
	}
	if col <= 0 || col > 9 {
		return InvalidCoordinateError
	}
	if s.initial[row-1][col-1] != 0 {
		return CannotChangeFixedPositionError
	}
	if val <= 0 || val > 9 {
		return InvalidValueError
	}

	// Update value
	s.Board[row-1][col-1] = val
	return nil
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

	fmt.Println("Validating boxes")

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

func (s *Sudoku) validateNumbers(numbers []int) bool {
	fmt.Printf("Checking: %+v\n", numbers)

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
