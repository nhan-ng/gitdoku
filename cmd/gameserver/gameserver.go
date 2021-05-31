package gameserver

import (
	"github.com/nhan-ng/sudoku/internal/cmd/gameserver"
	"github.com/spf13/cobra"
)

type options struct {
	useFilesystem bool
	port          int
}

func NewGameServerCmd() *cobra.Command {
	opts := &options{}

	cmd := &cobra.Command{
		Use:   "gameserver",
		Short: "Run a server",
		RunE:  opts.runE,
	}

	cmd.PersistentFlags().IntVarP(&opts.port, "port", "p", 9999, "The serving port.")
	cmd.PersistentFlags().BoolVarP(&opts.useFilesystem, "filesystem", "f", false, "Whether to use filesystem.")

	return cmd
}

func (o *options) runE(_ *cobra.Command, _ []string) error {
	return gameserver.Serve(gameserver.ServeOptions{
		Port:          o.port,
		UseFilesystem: o.useFilesystem,
	})
}
