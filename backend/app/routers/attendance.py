from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


@router.post(
    "/",
    response_model=schemas.AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_or_update_attendance(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
):
    enrollment = (
        db.query(models.Enrollment)
        .filter(models.Enrollment.id == attendance.enrollment_id)
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found",
        )

    if attendance.status not in ["present", "absent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be present or absent",
        )

    existing_attendance = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.enrollment_id == attendance.enrollment_id,
            models.Attendance.attendance_date == attendance.attendance_date,
        )
        .first()
    )

    if existing_attendance:
        existing_attendance.status = attendance.status
        existing_attendance.notes = attendance.notes

        db.commit()
        db.refresh(existing_attendance)

        return existing_attendance

    new_attendance = models.Attendance(**attendance.model_dump())

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance


@router.get("/", response_model=List[schemas.AttendanceResponse])
def get_attendance_records(
    attendance_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Attendance).order_by(models.Attendance.id.desc())

    if attendance_date:
      query = query.filter(models.Attendance.attendance_date == attendance_date)

    records = query.all()
    return records


@router.get("/details", response_model=List[schemas.AttendanceDetailResponse])
def get_attendance_details(
    attendance_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Attendance).order_by(models.Attendance.id.desc())

    if attendance_date:
        query = query.filter(models.Attendance.attendance_date == attendance_date)

    records = query.all()

    result = []

    for record in records:
        result.append(
            {
                "id": record.id,
                "enrollment_id": record.enrollment_id,
                "attendance_date": record.attendance_date,
                "status": record.status,
                "notes": record.notes,
                "student_name": record.enrollment.student.full_name,
                "course_name": record.enrollment.course.name,
                "batch_name": record.enrollment.batch.name,
                "created_at": record.created_at,
            }
        )

    return result


@router.get("/{attendance_id}", response_model=schemas.AttendanceResponse)
def get_attendance_record(attendance_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(models.Attendance)
        .filter(models.Attendance.id == attendance_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    return record


@router.put("/{attendance_id}", response_model=schemas.AttendanceResponse)
def update_attendance_record(
    attendance_id: int,
    updated_attendance: schemas.AttendanceUpdate,
    db: Session = Depends(get_db),
):
    record = (
        db.query(models.Attendance)
        .filter(models.Attendance.id == attendance_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    update_data = updated_attendance.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] not in ["present", "absent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be present or absent",
        )

    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    return record


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance_record(attendance_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(models.Attendance)
        .filter(models.Attendance.id == attendance_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    db.delete(record)
    db.commit()

    return None