#!/usr/bin/env bash
set -e
set -x

min_port=30000
max_port=30100

port_range="${min_port}-${max_port}"
k3d cluster create agones -p "${port_range}:${port_range}/tcp@server[0]" -p "${port_range}:${port_range}/udp@server[0]"

# Install Agones Helm
helm repo add agones https://agones.dev/chart/stable
helm repo update
helm install agones --namespace agones-system --create-namespace agones/agones \
  --set agones.ping.http.port=8080 \
  --set agones.ping.udp.port=8080 \
  --set agones.allocator.http.port=1443 \
  --set gameservers.minPort=${min_port} \
  --set gameservers.maxPort=${max_port}