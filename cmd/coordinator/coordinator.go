package coordinator

import (
	"github.com/nhan-ng/sudoku/internal/cmd/coordinator"
	"github.com/spf13/cobra"
)

type options struct {
	port int
}

func NewCoordinatorCmd() *cobra.Command {
	opts := &options{}

	cmd := &cobra.Command{
		Use:   "coordinator",
		Short: "Run a coordinator server that also serves UI",
		RunE:  opts.runE,
	}

	cmd.PersistentFlags().IntVarP(&opts.port, "port", "p", 9998, "The serving port.")

	return cmd
}

func (o *options) runE(_ *cobra.Command, _ []string) error {
	return coordinator.Serve(coordinator.ServeOptions{
		Port: o.port,
	})
}
