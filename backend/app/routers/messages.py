from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)


ALLOWED_MESSAGE_STATUSES = ["draft", "queued", "sent", "failed"]
ALLOWED_MESSAGE_TYPES = [
    "general",
    "fee_reminder",
    "attendance_warning",
    "payment_reminder",
]


def validate_message_status(message_status: str):
    if message_status not in ALLOWED_MESSAGE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be draft, queued, sent, or failed",
        )


def validate_message_type(message_type: str):
    if message_type not in ALLOWED_MESSAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message type must be general, fee_reminder, attendance_warning, or payment_reminder",
        )


def get_student_or_404(student_id: int, db: Session):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    return student


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


def get_message_or_404(message_id: int, db: Session):
    message = (
        db.query(models.MessageLog)
        .filter(models.MessageLog.id == message_id)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    return message


@router.post(
    "/",
    response_model=schemas.MessageLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_message_log(
    message: schemas.MessageLogCreate,
    db: Session = Depends(get_db),
):
    validate_message_status(message.status)
    validate_message_type(message.message_type)

    if message.student_id is not None:
        get_student_or_404(message.student_id, db)

    if message.enrollment_id is not None:
        get_enrollment_or_404(message.enrollment_id, db)

    sent_at = None

    if message.status == "sent":
        sent_at = datetime.now(timezone.utc)

    new_message = models.MessageLog(
        student_id=message.student_id,
        enrollment_id=message.enrollment_id,
        recipient_name=message.recipient_name,
        recipient_phone=message.recipient_phone,
        message_type=message.message_type,
        message_text=message.message_text,
        status=message.status,
        provider=message.provider,
        provider_response=message.provider_response,
        sent_at=sent_at,
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message


@router.get("/", response_model=List[schemas.MessageLogResponse])
def get_message_logs(
    status_filter: Optional[str] = Query(default=None),
    message_type: Optional[str] = Query(default=None),
    student_id: Optional[int] = Query(default=None),
    enrollment_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.MessageLog).order_by(models.MessageLog.id.desc())

    if status_filter is not None:
        validate_message_status(status_filter)
        query = query.filter(models.MessageLog.status == status_filter)

    if message_type is not None:
        validate_message_type(message_type)
        query = query.filter(models.MessageLog.message_type == message_type)

    if student_id is not None:
        query = query.filter(models.MessageLog.student_id == student_id)

    if enrollment_id is not None:
        query = query.filter(models.MessageLog.enrollment_id == enrollment_id)

    messages = query.all()

    return messages


@router.get("/details", response_model=List[schemas.MessageLogDetailResponse])
def get_message_log_details(
    status_filter: Optional[str] = Query(default=None),
    message_type: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.MessageLog).order_by(models.MessageLog.id.desc())

    if status_filter is not None:
        validate_message_status(status_filter)
        query = query.filter(models.MessageLog.status == status_filter)

    if message_type is not None:
        validate_message_type(message_type)
        query = query.filter(models.MessageLog.message_type == message_type)

    messages = query.all()

    result = []

    for message in messages:
        student_name = None
        course_name = None
        batch_name = None

        if message.student:
            student_name = message.student.full_name

        if message.enrollment:
            if message.enrollment.student:
                student_name = message.enrollment.student.full_name

            if message.enrollment.course:
                course_name = message.enrollment.course.name

            if message.enrollment.batch:
                batch_name = message.enrollment.batch.name

        result.append(
            {
                "id": message.id,
                "student_id": message.student_id,
                "enrollment_id": message.enrollment_id,
                "student_name": student_name,
                "course_name": course_name,
                "batch_name": batch_name,
                "recipient_name": message.recipient_name,
                "recipient_phone": message.recipient_phone,
                "message_type": message.message_type,
                "message_text": message.message_text,
                "status": message.status,
                "provider": message.provider,
                "provider_response": message.provider_response,
                "sent_at": message.sent_at,
                "created_at": message.created_at,
            }
        )

    return result


@router.get("/{message_id}", response_model=schemas.MessageLogResponse)
def get_message_log(
    message_id: int,
    db: Session = Depends(get_db),
):
    message = get_message_or_404(message_id, db)

    return message


@router.put("/{message_id}", response_model=schemas.MessageLogResponse)
def update_message_log(
    message_id: int,
    updated_message: schemas.MessageLogUpdate,
    db: Session = Depends(get_db),
):
    message = get_message_or_404(message_id, db)

    update_data = updated_message.model_dump(exclude_unset=True)

    if "status" in update_data:
        validate_message_status(update_data["status"])

    if "message_type" in update_data:
        validate_message_type(update_data["message_type"])

    if "student_id" in update_data and update_data["student_id"] is not None:
        get_student_or_404(update_data["student_id"], db)

    if "enrollment_id" in update_data and update_data["enrollment_id"] is not None:
        get_enrollment_or_404(update_data["enrollment_id"], db)

    for key, value in update_data.items():
        setattr(message, key, value)

    if update_data.get("status") == "sent" and message.sent_at is None:
        message.sent_at = datetime.now(timezone.utc)

    if update_data.get("status") in ["draft", "queued", "failed"]:
        message.sent_at = None

    db.commit()
    db.refresh(message)

    return message


@router.post("/{message_id}/mark-sent", response_model=schemas.MessageLogResponse)
def mark_message_as_sent(
    message_id: int,
    db: Session = Depends(get_db),
):
    message = get_message_or_404(message_id, db)

    message.status = "sent"
    message.sent_at = datetime.now(timezone.utc)
    message.provider = message.provider or "manual"
    message.provider_response = message.provider_response or "Marked as sent manually"

    db.commit()
    db.refresh(message)

    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message_log(
    message_id: int,
    db: Session = Depends(get_db),
):
    message = get_message_or_404(message_id, db)

    db.delete(message)
    db.commit()

    return None