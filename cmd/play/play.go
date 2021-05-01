package play

import (
	"bufio"
	"fmt"
	"os"

	"github.com/nhan-ng/sudoku/internal/engine"

	"github.com/spf13/cobra"
)

type options struct {
	source string
}

func NewPlayCmd() *cobra.Command {
	opts := &options{}

	cmd := &cobra.Command{
		Use:   "play",
		Short: "play",
		RunE:  opts.runE,
	}

	cmd.PersistentFlags().StringVarP(&opts.source, "source", "s", "./sudoku.txt", "file path to sudoku file")

	return cmd
}

func (o *options) runE(cmd *cobra.Command, args []string) error {
	sudoku, err := o.read()
	if err != nil {
		return fmt.Errorf("failed to read Sudoku file: %w", err)
	}

	fmt.Printf("%s", sudoku)

	// Game loop
	scanner := bufio.NewScanner(os.Stdin)

GameLoop:
	for scanner.Scan() {
		text := scanner.Text()

		switch text {
		case "undo":
			err = sudoku.Undo()
			if err != nil {
				fmt.Printf("err: %v\n", err)
			}

		case "redo":
			err = sudoku.Redo()
			if err != nil {
				fmt.Printf("err: %v\n", err)
			}

		case "exit":
			break GameLoop

		case "solve":
			err = sudoku.Solve()
			if err != nil {
				fmt.Printf("err: %v\n", err)
			}

		case "hint":
			err = sudoku.Hint()
			if err != nil {
				fmt.Printf("err: %v\n", err)
			}

		default:
			// Read input as [row][col][val], e.g. 138 -> row 1, col 3, val 8
			row := int(text[0] - '0')
			col := int(text[1] - '0')
			val := int(text[2] - '0')

			err = sudoku.Change(row, col, val)
			if err != nil {
				fmt.Printf("err: %v\n", err)
			} else if !sudoku.Validate() {
				fmt.Println("Board is invalid after the last input.")
			} else if sudoku.IsCompleted() {
				fmt.Println("Congrats! You've solved it.")
			}
		}

		fmt.Printf("%s", sudoku)
	}

	return nil
}

func (o *options) read() (*engine.Sudoku, error) {
	// Read the file
	file, err := os.Open(o.source)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}
	scanner := bufio.NewScanner(file)

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

	sudoku, err := engine.NewSudoku(board)
	if err != nil {
		return nil, fmt.Errorf("failed to create a new Sudoku: %w", err)
	}

	return sudoku, nil
}
