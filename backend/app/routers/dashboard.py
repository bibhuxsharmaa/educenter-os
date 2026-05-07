from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_students = db.query(models.Student).count()
    total_courses = db.query(models.Course).count()
    total_batches = db.query(models.Batch).count()

    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_batches": total_batches,
    }