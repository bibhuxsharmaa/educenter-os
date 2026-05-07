from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models
from app.database import Base, engine, get_db
from app.routers import students

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduCenter OS API",
    description="Backend API for EduCenter OS coaching center management platform.",
    version="0.1.0",
)

app.include_router(students.router)


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