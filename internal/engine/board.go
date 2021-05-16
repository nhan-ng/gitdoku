package engine

import (
	"bufio"
	"bytes"
	"fmt"
	"strings"
)

type Board [][]Cell

type Notes []bool

type Cell struct {
	Immutable bool
	Value     int
	Notes     Notes
}

var (
	space byte = ' '
	lf    byte = '\n'
)

func ReadBoard(input string) (Board, error) {
	// Read the file
	scanner := bufio.NewScanner(strings.NewReader(input))

	scanner.Split(bufio.ScanLines)
	board := make([][]Cell, 0, 9)
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			continue
		}
		row := make([]Cell, 0, 9)
		for _, num := range line {
			cell := Cell{
				Immutable: num != '0',
				Value:     int(num - '0'),
				Notes:     make([]bool, 9),
			}
			row = append(row, cell)
		}
		board = append(board, row)
	}

	return board, nil
}

func (b Board) Marshal() ([]byte, error) {
	result := make([]byte, 0)
	for row := 0; row < 9; row++ {
		for col := 0; col < 9; col++ {
			cellBytes, err := b[row][col].Marshal()
			if err != nil {
				return nil, fmt.Errorf("unable to marshal Cell [%d][%d]: %w", row, col, err)
			}
			result = append(result, cellBytes...)
			if col < 8 {
				result = append(result, space)
			}
		}

		// Add new line
		result = append(result, lf)
	}

	return result, nil
}

func (b *Board) Unmarshal(data []byte) error {
	// Initialize
	result := make([][]Cell, 9)
	for i := range result {
		result[i] = make([]Cell, 9)
	}

	// Process each line
	lines := bytes.Split(data, []byte{lf})
	for row, line := range lines {
		if len(line) == 0 {
			continue
		}

		words := bytes.Split(line, []byte{space})
		for col, word := range words {
			var c Cell
			err := c.Unmarshal(word)
			if err != nil {
				return fmt.Errorf("unable to unmarshal Cell [%d][%d]: %w", row, col, err)
			}
			result[row][col] = c
		}
	}

	*b = result
	return nil
}

func (c Cell) Marshal() ([]byte, error) {
	// 1 Immutable byte, 1 Value byte, 9 Notes bytes
	result := make([]byte, 11)

	// Immutable
	if c.Immutable {
		result[0] = '1'
	} else {
		result[0] = '0'
	}

	// Value
	result[1] = byte(c.Value) + '0'

	// Notes
	notesBytes, err := c.Notes.Marshal()
	if err != nil {
		return nil, fmt.Errorf("unable to marshal Notes: %w", err)
	}

	copy(result[2:], notesBytes)
	return result, nil
}

func (c *Cell) Unmarshal(data []byte) error {
	if len(data) != 11 {
		return fmt.Errorf("invalid data length for unmarshalling Cell")
	}

	c.Immutable = data[0] == '1'
	c.Value = int(data[1] - '0')
	err := c.Notes.Unmarshal(data[2:])
	if err != nil {
		return fmt.Errorf("unable to unmarshal Cell: %w", err)
	}

	return nil
}

func (n Notes) Marshal() ([]byte, error) {
	result := make([]byte, len(n))
	for i, hasNote := range n {
		if hasNote {
			result[i] = '1'
		} else {
			result[i] = '0'
		}
	}

	return result, nil
}

func (n *Notes) Unmarshal(data []byte) error {
	if len(data) != 9 {
		return fmt.Errorf("invalid data length for unmarshalling Notes")
	}

	result := make([]bool, len(data))
	for i, val := range data {
		if val == '1' {
			result[i] = true
		}
	}

	*n = result
	return nil
}

func (n Notes) AsNumbers() []int {
	result := make([]int, 0)
	for i, hasNote := range n {
		if hasNote {
			result = append(result, i+1)
		}
	}

	return result
}
