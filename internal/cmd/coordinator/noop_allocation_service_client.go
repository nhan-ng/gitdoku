package coordinator

import (
	"context"

	"go.uber.org/zap"

	pb "agones.dev/agones/pkg/allocation/go"
	"google.golang.org/grpc"
)

type NoopAllocationService struct {
	logger *zap.Logger
}

func (n *NoopAllocationService) Allocate(ctx context.Context, in *pb.AllocationRequest, opts ...grpc.CallOption) (*pb.AllocationResponse, error) {
	n.logger.Info("Sending Allocation Request", zap.Any("request", in))

	response := &pb.AllocationResponse{
		GameServerName: "game_server",
		Ports: []*pb.AllocationResponse_GameServerStatusPort{
			{
				Name: "default",
				Port: 9999,
			},
		},
		Address:  "localhost",
		NodeName: "this_node",
	}

	n.logger.Info("Returning Allocation Response", zap.Any("response", response))

	return response, nil
}
