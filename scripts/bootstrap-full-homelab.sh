#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# EduCenter OS Full Homelab Bootstrap Script
# Fresh Ubuntu Server / Laptop Setup
# ============================================================

PROJECT_NAME="educenter-os"
GITHUB_REPO="https://github.com/lakshaywalia666/educenter-os.git"
APP_NAMESPACE="educenter-os"

SERVER_IP="${SERVER_IP:-192.168.1.18}"

FRONTEND_URL="http://${SERVER_IP}:30080"
BACKEND_URL="http://${SERVER_IP}:30081"
ARGOCD_URL="https://${SERVER_IP}:30083"
GRAFANA_URL="http://${SERVER_IP}:30084"
PROMETHEUS_URL="http://${SERVER_IP}:30085"
JENKINS_URL="http://${SERVER_IP}:30086"

echo "============================================================"
echo "🚀 EduCenter OS Full Homelab Bootstrap"
echo "============================================================"
echo "Server IP: ${SERVER_IP}"
echo "Frontend: ${FRONTEND_URL}"
echo "Backend:  ${BACKEND_URL}"
echo "Argo CD:  ${ARGOCD_URL}"
echo "Grafana:  ${GRAFANA_URL}"
echo "Prometheus: ${PROMETHEUS_URL}"
echo "Jenkins: ${JENKINS_URL}"
echo "============================================================"

echo ""
echo "🔧 Step 1: Updating Ubuntu packages..."
sudo apt update -y
sudo apt install -y curl wget git ca-certificates gnupg lsb-release apt-transport-https unzip

echo ""
echo "🐳 Step 2: Installing Docker if missing..."
if ! command -v docker >/dev/null 2>&1; then
  sudo apt install -y docker.io
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker "$USER"
  echo "✅ Docker installed."
else
  echo "✅ Docker already installed."
fi

echo ""
echo "☸️ Step 3: Installing K3s Kubernetes if missing..."
if ! command -v k3s >/dev/null 2>&1; then
  curl -sfL https://get.k3s.io | sh -
else
  echo "✅ K3s already installed."
fi

echo ""
echo "🔐 Step 4: Preparing kubectl access..."
mkdir -p "$HOME/.kube"
sudo cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
sudo chown "$USER:$USER" "$HOME/.kube/config"
export KUBECONFIG="$HOME/.kube/config"

echo ""
echo "⏳ Waiting for Kubernetes node to become Ready..."
kubectl wait --for=condition=Ready node --all --timeout=180s
kubectl get nodes -o wide

echo ""
echo "⎈ Step 5: Installing Helm if missing..."
if ! command -v helm >/dev/null 2>&1; then
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
else
  echo "✅ Helm already installed."
fi

echo ""
echo "📦 Step 6: Cloning EduCenter OS repo if missing..."
cd "$HOME"

if [ ! -d "$HOME/${PROJECT_NAME}" ]; then
  git clone "${GITHUB_REPO}"
else
  echo "✅ Repo already exists. Pulling latest code..."
  cd "$HOME/${PROJECT_NAME}"
  git pull origin main
fi

cd "$HOME/${PROJECT_NAME}"

echo ""
echo "🧠 Step 7: Updating homelab IP references in source files..."
grep -RIl "http://localhost:8000" frontend/app 2>/dev/null | xargs -r sed -i "s|http://localhost:8000|${BACKEND_URL}|g"
grep -RIl "http://192.168.1.18:30081" frontend/app 2>/dev/null | xargs -r sed -i "s|http://192.168.1.18:30081|${BACKEND_URL}|g"

if grep -q "http://localhost:3000" backend/app/main.py; then
  python3 - <<PY
from pathlib import Path

p = Path("backend/app/main.py")
text = p.read_text()

origin = "${FRONTEND_URL}"

if origin not in text:
    old = '''    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",'''
    new = '''    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "''' + origin + '''",'''
    text = text.replace(old, new)

p.write_text(text)
PY
fi

echo ""
echo "🚢 Step 8: Deploying EduCenter OS Kubernetes manifests..."
kubectl apply -f k8s/ || true
sleep 5
kubectl apply -f k8s/

echo ""
echo "⏳ Waiting for EduCenter OS pods..."
kubectl rollout status deployment/postgres -n "${APP_NAMESPACE}" --timeout=180s || true
kubectl rollout status deployment/backend -n "${APP_NAMESPACE}" --timeout=180s || true
kubectl rollout status deployment/frontend -n "${APP_NAMESPACE}" --timeout=180s || true

echo ""
echo "📡 EduCenter OS services:"
kubectl get svc -n "${APP_NAMESPACE}"

echo ""
echo "📚 Step 9: Adding Helm repositories..."
helm repo add argo https://argoproj.github.io/argo-helm || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo add jenkins https://charts.jenkins.io || true
helm repo update

echo ""
echo "🐙 Step 10: Installing Argo CD..."
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.service.type=NodePort \
  --set server.service.nodePortHttp=30082 \
  --set server.service.nodePortHttps=30083

echo ""
echo "⏳ Waiting for Argo CD..."
kubectl rollout status deployment/argocd-server -n argocd --timeout=240s
kubectl rollout status deployment/argocd-repo-server -n argocd --timeout=240s
kubectl rollout status deployment/argocd-dex-server -n argocd --timeout=240s || true

echo ""
echo "🔁 Step 11: Creating Argo CD Application for EduCenter OS..."
if [ -f argocd/educenter-os-app.yaml ]; then
  kubectl apply -f argocd/educenter-os-app.yaml
else
  mkdir -p argocd
  cat > argocd/educenter-os-app.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: educenter-os
  namespace: argocd
spec:
  project: default
  source:
    repoURL: ${GITHUB_REPO}
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: educenter-os
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF
  kubectl apply -f argocd/educenter-os-app.yaml
fi

echo ""
echo "📊 Step 12: Installing Prometheus + Grafana..."
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=30084 \
  --set prometheus.service.type=NodePort \
  --set prometheus.service.nodePort=30085 \
  --set kubeControllerManager.enabled=false \
  --set kubeScheduler.enabled=false \
  --set kubeEtcd.enabled=false

echo ""
echo "⏳ Waiting for monitoring stack..."
kubectl rollout status deployment/monitoring-grafana -n monitoring --timeout=240s || true
kubectl rollout status deployment/monitoring-kube-prometheus-operator -n monitoring --timeout=240s || true
kubectl rollout status deployment/monitoring-kube-state-metrics -n monitoring --timeout=240s || true

echo ""
echo "🏗️ Step 13: Installing Jenkins..."
helm upgrade --install jenkins jenkins/jenkins \
  --namespace jenkins \
  --create-namespace \
  --set controller.serviceType=NodePort \
  --set controller.nodePort=30086 \
  --set persistence.storageClass=local-path \
  --set persistence.size=8Gi

echo ""
echo "⏳ Waiting for Jenkins..."
kubectl rollout status statefulset/jenkins -n jenkins --timeout=300s || true

echo ""
echo "============================================================"
echo "✅ EduCenter OS Homelab Setup Complete"
echo "============================================================"
echo ""
echo "🌐 Application URLs"
echo "Frontend:   ${FRONTEND_URL}"
echo "Backend:    ${BACKEND_URL}"
echo ""
echo "🛠️ DevOps URLs"
echo "Argo CD:    ${ARGOCD_URL}"
echo "Grafana:    ${GRAFANA_URL}"
echo "Prometheus: ${PROMETHEUS_URL}"
echo "Jenkins:    ${JENKINS_URL}"
echo ""
echo "============================================================"

echo ""
echo "🔑 Argo CD admin password:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d || true
echo ""

echo ""
echo "🔑 Grafana admin password:"
kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" 2>/dev/null | base64 -d || true
echo ""

echo ""
echo "🔑 Jenkins admin password:"
kubectl exec -n jenkins -it jenkins-0 -c jenkins -- cat /run/secrets/additional/chart-admin-password 2>/dev/null || true
echo ""

echo ""
echo "📦 Final cluster health:"
kubectl get pods -A
echo ""
echo "✅ Done."
