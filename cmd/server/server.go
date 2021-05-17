package server

import (
	"github.com/nhan-ng/sudoku/internal/cmd/server"
	"github.com/spf13/cobra"
)

type options struct {
	useFilesystem bool
	port          int
}

func NewServerCmd() *cobra.Command {
	opts := &options{}

	cmd := &cobra.Command{
		Use:   "server",
		Short: "Run a server",
		RunE:  opts.runE,
	}

	cmd.PersistentFlags().IntVarP(&opts.port, "port", "p", 8808, "The serving port.")
	cmd.PersistentFlags().BoolVarP(&opts.useFilesystem, "filesystem", "f", false, "Whether to use filesystem.")

	return cmd
}

func (o *options) runE(_ *cobra.Command, _ []string) error {
	return server.Serve(o.useFilesystem)
}
