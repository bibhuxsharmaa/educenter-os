#!/bin/bash

set -e

echo "===================================="
echo "EduCenter OS - Kubernetes Deploy"
echo "===================================="

echo "Applying Kubernetes manifests..."

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

echo "Waiting for pods..."
kubectl get pods -n educenter-os

echo "Deployment applied."
echo ""
echo "Check status:"
echo "kubectl get all -n educenter-os"
echo ""
echo "Frontend service:"
echo "kubectl get svc -n educenter-os"