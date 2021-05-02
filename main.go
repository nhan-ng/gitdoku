package main

import (
	"github.com/nhan-ng/sudoku/cmd"
	"go.uber.org/zap"
)

func main() {
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	undo := zap.ReplaceGlobals(logger)
	defer undo()

	cmd.Execute()
}
