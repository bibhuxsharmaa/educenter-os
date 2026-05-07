from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.routers import batches, courses, dashboard, enrollments, students

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduCenter OS API",
    description="Backend API for EduCenter OS coaching center management platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(courses.router)
app.include_router(batches.router)
app.include_router(enrollments.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "message": "EduCenter OS API is running",
        "status": "healthy",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "educenter-backend",
    }


@app.get("/db-health")
def database_health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "connected",
    }