from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


ALLOWED_ATTENDANCE_STATUSES = ["present", "absent"]


def validate_attendance_status(attendance_status: str):
    if attendance_status not in ALLOWED_ATTENDANCE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be present or absent",
        )


def get_enrollment_or_404(enrollment_id: int, db: Session):
    enrollment = (
        db.query(models.Enrollment)
        .filter(models.Enrollment.id == enrollment_id)
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found",
        )

    return enrollment


def get_batch_or_404(batch_id: int, db: Session):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found",
        )

    return batch


def get_attendance_or_404(attendance_id: int, db: Session):
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


@router.post(
    "/",
    response_model=schemas.AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_or_update_attendance(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
):
    validate_attendance_status(attendance.status)

    enrollment = get_enrollment_or_404(attendance.enrollment_id, db)

    existing_attendance = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.enrollment_id == enrollment.id,
            models.Attendance.attendance_date == attendance.attendance_date,
        )
        .first()
    )

    if existing_attendance:
        existing_attendance.status = attendance.status
        existing_attendance.notes = attendance.notes
        existing_attendance.marked_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(existing_attendance)

        return existing_attendance

    new_attendance = models.Attendance(
        enrollment_id=enrollment.id,
        attendance_date=attendance.attendance_date,
        status=attendance.status,
        notes=attendance.notes,
        marked_at=datetime.now(timezone.utc),
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance


@router.get("/", response_model=List[schemas.AttendanceResponse])
def get_attendance_records(
    attendance_date: Optional[date] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Attendance).order_by(models.Attendance.id.desc())

    if attendance_date is not None:
        query = query.filter(models.Attendance.attendance_date == attendance_date)

    if batch_id is not None:
        query = (
            query.join(models.Enrollment)
            .filter(models.Enrollment.batch_id == batch_id)
        )

    records = query.all()

    return records


@router.get("/details", response_model=List[schemas.AttendanceDetailResponse])
def get_attendance_details(
    attendance_date: Optional[date] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Attendance).order_by(models.Attendance.id.desc())

    if attendance_date is not None:
        query = query.filter(models.Attendance.attendance_date == attendance_date)

    if batch_id is not None:
        query = (
            query.join(models.Enrollment)
            .filter(models.Enrollment.batch_id == batch_id)
        )

    records = query.all()

    result = []

    for record in records:
        enrollment = record.enrollment

        result.append(
            {
                "id": record.id,
                "enrollment_id": record.enrollment_id,
                "student_name": enrollment.student.full_name if enrollment.student else None,
                "course_name": enrollment.course.name if enrollment.course else None,
                "batch_name": enrollment.batch.name if enrollment.batch else None,
                "attendance_date": record.attendance_date,
                "status": record.status,
                "notes": record.notes,
                "marked_at": record.marked_at,
                "created_at": record.created_at,
            }
        )

    return result


@router.get(
    "/batch-students",
    response_model=List[schemas.AttendanceStudentStatusResponse],
)
def get_batch_students_attendance_status(
    batch_id: int = Query(...),
    attendance_date: date = Query(...),
    db: Session = Depends(get_db),
):
    get_batch_or_404(batch_id, db)

    enrollments_query = (
        db.query(models.Enrollment)
        .filter(models.Enrollment.batch_id == batch_id)
        .order_by(models.Enrollment.id.desc())
    )

    if hasattr(models.Enrollment, "status"):
        enrollments_query = enrollments_query.filter(
            models.Enrollment.status == "active"
        )

    enrollments = enrollments_query.all()

    result = []

    for enrollment in enrollments:
        attendance_record = (
            db.query(models.Attendance)
            .filter(
                models.Attendance.enrollment_id == enrollment.id,
                models.Attendance.attendance_date == attendance_date,
            )
            .first()
        )

        if attendance_record:
            attendance_id = attendance_record.id
            attendance_status = attendance_record.status
            notes = attendance_record.notes
            marked_at = attendance_record.marked_at
        else:
            attendance_id = None
            attendance_status = "unmarked"
            notes = None
            marked_at = None

        result.append(
            {
                "attendance_id": attendance_id,
                "enrollment_id": enrollment.id,
                "student_id": enrollment.student.id if enrollment.student else None,
                "student_name": enrollment.student.full_name if enrollment.student else None,
                "course_id": enrollment.course.id if enrollment.course else None,
                "course_name": enrollment.course.name if enrollment.course else None,
                "batch_id": enrollment.batch.id if enrollment.batch else None,
                "batch_name": enrollment.batch.name if enrollment.batch else None,
                "attendance_date": attendance_date,
                "status": attendance_status,
                "notes": notes,
                "marked_at": marked_at,
            }
        )

    return result


@router.get("/summary", response_model=schemas.AttendanceSummaryResponse)
def get_attendance_summary(
    batch_id: int = Query(...),
    attendance_date: date = Query(...),
    db: Session = Depends(get_db),
):
    get_batch_or_404(batch_id, db)

    enrollments_query = db.query(models.Enrollment).filter(
        models.Enrollment.batch_id == batch_id
    )

    if hasattr(models.Enrollment, "status"):
        enrollments_query = enrollments_query.filter(
            models.Enrollment.status == "active"
        )

    enrollments = enrollments_query.all()

    total_students = len(enrollments)
    present_students = 0
    absent_students = 0
    unmarked_students = 0

    for enrollment in enrollments:
        attendance_record = (
            db.query(models.Attendance)
            .filter(
                models.Attendance.enrollment_id == enrollment.id,
                models.Attendance.attendance_date == attendance_date,
            )
            .first()
        )

        if not attendance_record:
            unmarked_students += 1
        elif attendance_record.status == "present":
            present_students += 1
        elif attendance_record.status == "absent":
            absent_students += 1

    return {
        "batch_id": batch_id,
        "attendance_date": attendance_date,
        "total_students": total_students,
        "present_students": present_students,
        "absent_students": absent_students,
        "unmarked_students": unmarked_students,
    }


@router.get("/{attendance_id}", response_model=schemas.AttendanceResponse)
def get_attendance_record(
    attendance_id: int,
    db: Session = Depends(get_db),
):
    record = get_attendance_or_404(attendance_id, db)

    return record


@router.put("/{attendance_id}", response_model=schemas.AttendanceResponse)
def update_attendance_record(
    attendance_id: int,
    updated_attendance: schemas.AttendanceUpdate,
    db: Session = Depends(get_db),
):
    record = get_attendance_or_404(attendance_id, db)

    update_data = updated_attendance.model_dump(exclude_unset=True)

    if "status" in update_data:
        validate_attendance_status(update_data["status"])

    for key, value in update_data.items():
        setattr(record, key, value)

    record.marked_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(record)

    return record


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance_record(
    attendance_id: int,
    db: Session = Depends(get_db),
):
    record = get_attendance_or_404(attendance_id, db)

    db.delete(record)
    db.commit()

    return None