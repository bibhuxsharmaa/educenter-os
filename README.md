# EduCenter OS

EduCenter OS is a full-stack institute/coaching center management system built with a real DevOps workflow.

It includes student management, courses, batches, enrollments, fees, attendance, dashboard analytics, message logs, WhatsApp message links, Docker, GitHub Actions CI/CD, Docker Hub images, and Kubernetes manifests for home server deployment.

---

## Project Status

| Module | Status |
|---|---|
| Students | Complete |
| Courses | Complete |
| Batches | Complete |
| Enrollments | Complete |
| Fees | Complete |
| Attendance | Complete |
| Dashboard | Complete |
| Messages | Complete |
| WhatsApp Link | Complete |
| Docker Compose | Complete |
| Docker Hub Images | Complete |
| GitHub Actions CI/CD | Complete |
| Kubernetes Manifests | Added |
| Home Server Scripts | Added |
| Jenkins | Planned |
| Argo CD | Planned |
| Monitoring | Planned |

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- CSS inline styling / basic UI layout

### Backend

- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database

- PostgreSQL 16

### DevOps

- Docker
- Docker Compose
- Docker Hub
- GitHub Actions
- Kubernetes
- K3s for home server deployment

---

## Repository

```text
https://github.com/lakshaywalia666/educenter-os
```

---

## Docker Hub Images

```text
lakshaywalia666/educenter-os-backend:latest
lakshaywalia666/educenter-os-frontend:latest
postgres:16
```

---

## Project Structure

```text
educenter-os/
  backend/
    app/
      routers/
        students.py
        courses.py
        batches.py
        enrollments.py
        fees.py
        attendance.py
        messages.py
        dashboard.py
      main.py
      models.py
      schemas.py
      database.py
    Dockerfile
    requirements.txt

  frontend/
    app/
      students/
      courses/
      batches/
      enrollments/
      fees/
      attendance/
      messages/
      page.tsx
    Dockerfile
    package.json

  k8s/
    namespace.yaml
    postgres-secret.yaml
    postgres-pvc.yaml
    postgres-deployment.yaml
    postgres-service.yaml
    backend-deployment.yaml
    backend-service.yaml
    frontend-deployment.yaml
    frontend-service.yaml

  scripts/
    install-k3s.sh
    deploy-educenter.sh

  .github/
    workflows/
      docker-build.yml

  docker-compose.yml
  docker-compose.prod.yml
  README.md
```

---

## Features

### Students

- Create students
- View students
- Update students
- Delete students
- Store parent details, phone, email, address, and status

### Courses

- Create courses
- View courses
- Update courses
- Delete courses
- Store monthly fee and duration

### Batches

- Create batches
- Link batches to courses
- Store start time, end time, days, and status

### Enrollments

- Enroll students into course and batch
- Store monthly fee
- Track active/inactive enrollment

### Fees

- Monthly fee tracking
- Mark fee as paid
- Mark fee as pending
- Fee summary
- Student-wise fee status
- Dashboard fee totals

### Attendance

- Select batch
- Select date
- Mark students present
- Mark students absent
- Attendance summary
- Student-wise attendance status

### Dashboard

Live dashboard showing:

- Total students
- Active students
- Total courses
- Total batches
- Total enrollments
- Attendance present / absent / unmarked
- Fee due / paid / pending
- Message totals

### Messages

- Create message logs
- Auto-generate message templates
- Fee reminder template
- Attendance warning template
- Payment reminder template
- Mark message as sent
- Delete message
- WhatsApp send link

### WhatsApp Link

The app can open WhatsApp Web with the message already filled.

This is not automatic WhatsApp Cloud API sending yet. It opens WhatsApp and the user manually presses Send.

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/lakshaywalia666/educenter-os.git
cd educenter-os
```

---

## Run With Docker Compose - Local Build

This builds images from local source code.

```bash
docker compose up -d --build
```

Check containers:

```bash
docker compose ps
```

Open frontend:

```text
http://localhost:3000
```

Open backend docs:

```text
http://127.0.0.1:8000/docs
```

Stop containers:

```bash
docker compose down
```

---

## Run With Docker Hub Images

This uses already pushed Docker Hub images.

```bash
docker compose -f docker-compose.prod.yml up -d
```

Check containers:

```bash
docker compose -f docker-compose.prod.yml ps
```

Open frontend:

```text
http://localhost:3000
```

Open backend docs:

```text
http://127.0.0.1:8000/docs
```

Stop containers:

```bash
docker compose -f docker-compose.prod.yml down
```

Pull latest images:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## Backend API

Base URL:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

Main API groups:

```text
/students
/courses
/batches
/enrollments
/fees
/attendance
/messages
/dashboard
```

Health endpoints:

```text
GET /
GET /health
GET /db-health
```

---

## Important API Endpoints

### Dashboard

```text
GET /dashboard/stats
```

### Fees

```text
GET  /fees/
GET  /fees/details
GET  /fees/monthly-students
GET  /fees/summary
POST /fees/
PUT  /fees/{fee_payment_id}
DELETE /fees/{fee_payment_id}
```

### Attendance

```text
GET  /attendance/
GET  /attendance/details
GET  /attendance/batch-students
GET  /attendance/summary
POST /attendance/
PUT  /attendance/{attendance_id}
DELETE /attendance/{attendance_id}
```

### Messages

```text
GET  /messages/
GET  /messages/details
POST /messages/
PUT  /messages/{message_id}
DELETE /messages/{message_id}
POST /messages/{message_id}/mark-sent
```

---

## GitHub Actions CI/CD

GitHub Actions workflow:

```text
.github/workflows/docker-build.yml
```

On every push to `main`, GitHub Actions builds and pushes:

```text
lakshaywalia666/educenter-os-backend:latest
lakshaywalia666/educenter-os-frontend:latest
```

Required GitHub repository secrets:

```text
DOCKER_USERNAME
DOCKER_PASSWORD
```

`DOCKER_PASSWORD` should be a Docker Hub access token.

---

## Manual Docker Build and Push

Login:

```bash
docker login
```

Build backend:

```bash
docker build -t lakshaywalia666/educenter-os-backend:latest ./backend
```

Build frontend:

```bash
docker build -t lakshaywalia666/educenter-os-frontend:latest ./frontend
```

Push backend:

```bash
docker push lakshaywalia666/educenter-os-backend:latest
```

Push frontend:

```bash
docker push lakshaywalia666/educenter-os-frontend:latest
```

Check images:

```bash
docker images | findstr educenter
```

---

# Home Server Deployment With K3s

This project includes Kubernetes files and scripts for deploying EduCenter OS on a Linux home server.

Recommended server:

```text
Ubuntu Server 22.04 or 24.04
2 CPU cores minimum
4 GB RAM minimum
20 GB+ storage
Internet connection
SSH access
```

---

## Home Server Architecture

```text
Home Server
  └── K3s Kubernetes
        ├── frontend pod
        ├── backend pod
        └── postgres pod
```

Frontend exposed using NodePort:

```text
30080
```

App URL on home network:

```text
http://SERVER_IP:30080
```

Example:

```text
http://192.168.1.50:30080
```

---

## Kubernetes Files

```text
k8s/namespace.yaml
k8s/postgres-secret.yaml
k8s/postgres-pvc.yaml
k8s/postgres-deployment.yaml
k8s/postgres-service.yaml
k8s/backend-deployment.yaml
k8s/backend-service.yaml
k8s/frontend-deployment.yaml
k8s/frontend-service.yaml
```

---

## Home Server Scripts

```text
scripts/install-k3s.sh
scripts/deploy-educenter.sh
```

These scripts are for Linux server, not Windows PowerShell.

---

## Deploy On Home Server

### 1. SSH Into Server

```bash
ssh username@SERVER_IP
```

Example:

```bash
ssh lakshay@192.168.1.50
```

---

### 2. Install Git

```bash
sudo apt update -y
sudo apt install -y git
```

---

### 3. Clone Repository

```bash
git clone https://github.com/lakshaywalia666/educenter-os.git
cd educenter-os
```

---

### 4. Install K3s

```bash
bash scripts/install-k3s.sh
```

Check node:

```bash
kubectl get nodes
```

Expected:

```text
NAME      STATUS   ROLES
server    Ready    control-plane,master
```

---

### 5. Deploy EduCenter OS

```bash
bash scripts/deploy-educenter.sh
```

Check all resources:

```bash
kubectl get all -n educenter-os
```

Check pods:

```bash
kubectl get pods -n educenter-os
```

Expected pods:

```text
backend
frontend
postgres
```

---

### 6. Open App

Find server IP:

```bash
hostname -I
```

Open in browser:

```text
http://SERVER_IP:30080
```

Example:

```text
http://192.168.1.50:30080
```

---

## Kubernetes Commands

Check namespace:

```bash
kubectl get ns
```

Check all EduCenter resources:

```bash
kubectl get all -n educenter-os
```

Check pods:

```bash
kubectl get pods -n educenter-os
```

Check services:

```bash
kubectl get svc -n educenter-os
```

Check backend logs:

```bash
kubectl logs deployment/backend -n educenter-os
```

Check frontend logs:

```bash
kubectl logs deployment/frontend -n educenter-os
```

Check postgres logs:

```bash
kubectl logs deployment/postgres -n educenter-os
```

Restart backend:

```bash
kubectl rollout restart deployment/backend -n educenter-os
```

Restart frontend:

```bash
kubectl rollout restart deployment/frontend -n educenter-os
```

Delete full EduCenter namespace:

```bash
kubectl delete namespace educenter-os
```

---

## Update App On Home Server

On laptop:

```bash
git add .
git commit -m "your update message"
git push origin main
```

GitHub Actions will build and push Docker images.

On home server:

```bash
cd educenter-os
git pull
kubectl rollout restart deployment/backend -n educenter-os
kubectl rollout restart deployment/frontend -n educenter-os
kubectl get pods -n educenter-os
```

---

## Database Details

PostgreSQL database:

```text
Database: educenter
User: educenter_user
Password: educenter_password
Host inside Docker Compose: postgres
Host inside Kubernetes: postgres
Port: 5432
```

In production, these should later be changed to stronger secrets.

---

## Environment Variables

Backend uses:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_HOST
POSTGRES_PORT
```

Docker Compose sets these in:

```text
docker-compose.yml
docker-compose.prod.yml
```

Kubernetes sets these using:

```text
k8s/postgres-secret.yaml
backend-deployment.yaml
```

---

## Current Known Limitations

- No login/auth yet
- WhatsApp is currently link-based, not automatic Cloud API sending
- Database migrations are currently handled with SQLAlchemy `create_all`
- No Alembic migrations yet
- No HTTPS yet
- No Ingress yet
- No Jenkins pipeline yet
- No Argo CD yet
- No monitoring stack yet

---

## Planned Next Improvements

```text
1. Add login/auth
2. Add Alembic database migrations
3. Add real WhatsApp Cloud API integration
4. Add Kubernetes Ingress
5. Add Argo CD GitOps deployment
6. Add Jenkins pipeline for resume/demo
7. Add Prometheus and Grafana monitoring
8. Add backup and restore for PostgreSQL
9. Add role-based admin access
10. Add proper production secrets
```

---

## Quick Commands

### Start local Docker build

```bash
docker compose up -d --build
```

### Start Docker Hub production compose

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Stop Docker Hub production compose

```bash
docker compose -f docker-compose.prod.yml down
```

### Pull latest Docker Hub images

```bash
docker compose -f docker-compose.prod.yml pull
```

### Check Git status

```bash
git status
```

### Push code

```bash
git add .
git commit -m "update"
git push origin main
```

---

## Author

Built by Lakshay Walia.

Docker Hub:

```text
lakshaywalia666
```

GitHub:

```text
https://github.com/lakshaywalia666
```