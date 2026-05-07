from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/enrollments",
    tags=["Enrollments"],
)


@router.post(
    "/",
    response_model=schemas.EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_enrollment(
    enrollment: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
):
    student = (
        db.query(models.Student)
        .filter(models.Student.id == enrollment.student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    course = (
        db.query(models.Course)
        .filter(models.Course.id == enrollment.course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    batch = (
        db.query(models.Batch)
        .filter(models.Batch.id == enrollment.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found",
        )

    if batch.course_id != enrollment.course_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected batch does not belong to selected course",
        )

    new_enrollment = models.Enrollment(**enrollment.model_dump())

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return new_enrollment


@router.get("/", response_model=List[schemas.EnrollmentResponse])
def get_enrollments(db: Session = Depends(get_db)):
    enrollments = (
        db.query(models.Enrollment)
        .order_by(models.Enrollment.id.desc())
        .all()
    )

    return enrollments


@router.get("/details", response_model=List[schemas.EnrollmentDetailResponse])
def get_enrollment_details(db: Session = Depends(get_db)):
    enrollments = (
        db.query(models.Enrollment)
        .order_by(models.Enrollment.id.desc())
        .all()
    )

    result = []

    for enrollment in enrollments:
        result.append(
            {
                "id": enrollment.id,
                "student_id": enrollment.student_id,
                "student_name": enrollment.student.full_name,
                "course_id": enrollment.course_id,
                "course_name": enrollment.course.name,
                "batch_id": enrollment.batch_id,
                "batch_name": enrollment.batch.name,
                "monthly_fee": enrollment.monthly_fee,
                "status": enrollment.status,
                "created_at": enrollment.created_at,
            }
        )

    return result


@router.get("/{enrollment_id}", response_model=schemas.EnrollmentResponse)
def get_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
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


@router.put("/{enrollment_id}", response_model=schemas.EnrollmentResponse)
def update_enrollment(
    enrollment_id: int,
    updated_enrollment: schemas.EnrollmentUpdate,
    db: Session = Depends(get_db),
):
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

    update_data = updated_enrollment.model_dump(exclude_unset=True)

    if "student_id" in update_data:
        student = (
            db.query(models.Student)
            .filter(models.Student.id == update_data["student_id"])
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found",
            )

    if "course_id" in update_data:
        course = (
            db.query(models.Course)
            .filter(models.Course.id == update_data["course_id"])
            .first()
        )

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

    if "batch_id" in update_data:
        batch = (
            db.query(models.Batch)
            .filter(models.Batch.id == update_data["batch_id"])
            .first()
        )

        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found",
            )

    final_course_id = update_data.get("course_id", enrollment.course_id)
    final_batch_id = update_data.get("batch_id", enrollment.batch_id)

    batch = db.query(models.Batch).filter(models.Batch.id == final_batch_id).first()

    if batch and batch.course_id != final_course_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected batch does not belong to selected course",
        )

    for key, value in update_data.items():
        setattr(enrollment, key, value)

    db.commit()
    db.refresh(enrollment)

    return enrollment


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
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

    db.delete(enrollment)
    db.commit()

    return None