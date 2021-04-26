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
	// Read the file
	file, err := os.Open(o.source)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
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
		return fmt.Errorf("failed to create a new Sudoku: %w", err)
	}

	fmt.Printf("%s", sudoku)

	return nil
}
