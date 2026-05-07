#!/bin/bash

set -e

echo "===================================="
echo "EduCenter OS - K3s Install Script"
echo "===================================="

echo "Updating server packages..."
sudo apt update -y

echo "Installing required tools..."
sudo apt install -y curl git

echo "Installing K3s..."
curl -sfL https://get.k3s.io | sh -

echo "Waiting for K3s to start..."
sleep 15

echo "Checking K3s service..."
sudo systemctl status k3s --no-pager

echo "Creating kubeconfig for current user..."
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

echo "Checking Kubernetes nodes..."
kubectl get nodes

echo "K3s installation completed successfully."