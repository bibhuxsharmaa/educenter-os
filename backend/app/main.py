from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.routers import (
    attendance,
    batches,
    courses,
    dashboard,
    enrollments,
    fees,
    messages,
    students,
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduCenter OS API",
    description="Backend API for EduCenter OS",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.18:30080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(courses.router)
app.include_router(batches.router)
app.include_router(enrollments.router)
app.include_router(fees.router)
app.include_router(attendance.router)
app.include_router(messages.router)
app.include_router(dashboard.router)


@app.get("/")
def read_root():
    return {
        "message": "EduCenter OS API is running",
        "status": "healthy",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "educenter-os-api",
    }


@app.get("/db-health")
def db_health_check():
    try:
        connection = engine.connect()
        connection.close()

        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception as error:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(error),
        }