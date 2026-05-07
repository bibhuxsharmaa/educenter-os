from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/fees",
    tags=["Fees"],
)


ALLOWED_FEE_STATUSES = ["pending", "paid"]


def validate_fee_month_year(fee_month: int, fee_year: int):
    if fee_month < 1 or fee_month > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="fee_month must be between 1 and 12",
        )

    if fee_year < 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="fee_year must be valid",
        )


def validate_fee_status(fee_status: str):
    if fee_status not in ALLOWED_FEE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be pending or paid",
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


def get_fee_payment_or_404(fee_payment_id: int, db: Session):
    fee_payment = (
        db.query(models.FeePayment)
        .filter(models.FeePayment.id == fee_payment_id)
        .first()
    )

    if not fee_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee payment not found",
        )

    return fee_payment


@router.post(
    "/",
    response_model=schemas.FeePaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_or_update_fee_payment(
    fee_payment: schemas.FeePaymentCreate,
    db: Session = Depends(get_db),
):
    validate_fee_month_year(fee_payment.fee_month, fee_payment.fee_year)
    validate_fee_status(fee_payment.status)

    enrollment = get_enrollment_or_404(fee_payment.enrollment_id, db)

    existing_fee_payment = (
        db.query(models.FeePayment)
        .filter(
            models.FeePayment.enrollment_id == fee_payment.enrollment_id,
            models.FeePayment.fee_month == fee_payment.fee_month,
            models.FeePayment.fee_year == fee_payment.fee_year,
        )
        .first()
    )

    paid_at = None

    if fee_payment.status == "paid":
        paid_at = datetime.now(timezone.utc)

    if existing_fee_payment:
        existing_fee_payment.amount_due = fee_payment.amount_due
        existing_fee_payment.amount_paid = fee_payment.amount_paid
        existing_fee_payment.status = fee_payment.status
        existing_fee_payment.notes = fee_payment.notes
        existing_fee_payment.paid_at = paid_at

        db.commit()
        db.refresh(existing_fee_payment)

        return existing_fee_payment

    new_fee_payment = models.FeePayment(
        enrollment_id=enrollment.id,
        fee_month=fee_payment.fee_month,
        fee_year=fee_payment.fee_year,
        amount_due=fee_payment.amount_due,
        amount_paid=fee_payment.amount_paid,
        status=fee_payment.status,
        paid_at=paid_at,
        notes=fee_payment.notes,
    )

    db.add(new_fee_payment)
    db.commit()
    db.refresh(new_fee_payment)

    return new_fee_payment


@router.get("/", response_model=List[schemas.FeePaymentResponse])
def get_fee_payments(
    fee_month: Optional[int] = Query(default=None),
    fee_year: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.FeePayment).order_by(models.FeePayment.id.desc())

    if fee_month is not None:
        validate_fee_month_year(fee_month, fee_year or 2000)
        query = query.filter(models.FeePayment.fee_month == fee_month)

    if fee_year is not None:
        query = query.filter(models.FeePayment.fee_year == fee_year)

    fee_payments = query.all()

    return fee_payments


@router.get("/details", response_model=List[schemas.FeePaymentDetailResponse])
def get_fee_payment_details(
    fee_month: Optional[int] = Query(default=None),
    fee_year: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.FeePayment).order_by(models.FeePayment.id.desc())

    if fee_month is not None:
        validate_fee_month_year(fee_month, fee_year or 2000)
        query = query.filter(models.FeePayment.fee_month == fee_month)

    if fee_year is not None:
        query = query.filter(models.FeePayment.fee_year == fee_year)

    fee_payments = query.all()

    result = []

    for fee_payment in fee_payments:
        enrollment = fee_payment.enrollment

        result.append(
            {
                "id": fee_payment.id,
                "enrollment_id": fee_payment.enrollment_id,
                "student_name": enrollment.student.full_name if enrollment.student else None,
                "course_name": enrollment.course.name if enrollment.course else None,
                "batch_name": enrollment.batch.name if enrollment.batch else None,
                "fee_month": fee_payment.fee_month,
                "fee_year": fee_payment.fee_year,
                "amount_due": fee_payment.amount_due,
                "amount_paid": fee_payment.amount_paid,
                "status": fee_payment.status,
                "paid_at": fee_payment.paid_at,
                "notes": fee_payment.notes,
                "created_at": fee_payment.created_at,
            }
        )

    return result


@router.get("/monthly-students")
def get_monthly_student_fee_status(
    fee_month: int = Query(...),
    fee_year: int = Query(...),
    db: Session = Depends(get_db),
):
    validate_fee_month_year(fee_month, fee_year)

    enrollments_query = db.query(models.Enrollment).order_by(models.Enrollment.id.desc())

    if hasattr(models.Enrollment, "status"):
        enrollments_query = enrollments_query.filter(models.Enrollment.status == "active")

    enrollments = enrollments_query.all()

    result = []

    for enrollment in enrollments:
        fee_payment = (
            db.query(models.FeePayment)
            .filter(
                models.FeePayment.enrollment_id == enrollment.id,
                models.FeePayment.fee_month == fee_month,
                models.FeePayment.fee_year == fee_year,
            )
            .first()
        )

        course_fee = Decimal("0.00")

        if enrollment.course and enrollment.course.monthly_fee is not None:
            course_fee = enrollment.course.monthly_fee

        if fee_payment:
            fee_status = fee_payment.status
            amount_due = fee_payment.amount_due
            amount_paid = fee_payment.amount_paid
            payment_id = fee_payment.id
            paid_at = fee_payment.paid_at
            notes = fee_payment.notes
        else:
            fee_status = "pending"
            amount_due = course_fee
            amount_paid = Decimal("0.00")
            payment_id = None
            paid_at = None
            notes = None

        result.append(
            {
                "payment_id": payment_id,
                "enrollment_id": enrollment.id,
                "student_id": enrollment.student.id if enrollment.student else None,
                "student_name": enrollment.student.full_name if enrollment.student else None,
                "course_id": enrollment.course.id if enrollment.course else None,
                "course_name": enrollment.course.name if enrollment.course else None,
                "batch_id": enrollment.batch.id if enrollment.batch else None,
                "batch_name": enrollment.batch.name if enrollment.batch else None,
                "fee_month": fee_month,
                "fee_year": fee_year,
                "amount_due": amount_due,
                "amount_paid": amount_paid,
                "status": fee_status,
                "paid_at": paid_at,
                "notes": notes,
            }
        )

    return result


@router.get("/summary")
def get_fee_summary(
    fee_month: int = Query(...),
    fee_year: int = Query(...),
    db: Session = Depends(get_db),
):
    validate_fee_month_year(fee_month, fee_year)

    enrollments_query = db.query(models.Enrollment)

    if hasattr(models.Enrollment, "status"):
        enrollments_query = enrollments_query.filter(models.Enrollment.status == "active")

    enrollments = enrollments_query.all()

    total_due = Decimal("0.00")
    total_paid = Decimal("0.00")
    paid_students = 0
    pending_students = 0

    for enrollment in enrollments:
        course_fee = Decimal("0.00")

        if enrollment.course and enrollment.course.monthly_fee is not None:
            course_fee = enrollment.course.monthly_fee

        fee_payment = (
            db.query(models.FeePayment)
            .filter(
                models.FeePayment.enrollment_id == enrollment.id,
                models.FeePayment.fee_month == fee_month,
                models.FeePayment.fee_year == fee_year,
            )
            .first()
        )

        if fee_payment:
            total_due += fee_payment.amount_due or Decimal("0.00")
            total_paid += fee_payment.amount_paid or Decimal("0.00")

            if fee_payment.status == "paid":
                paid_students += 1
            else:
                pending_students += 1
        else:
            total_due += course_fee
            pending_students += 1

    pending_amount = total_due - total_paid

    return {
        "fee_month": fee_month,
        "fee_year": fee_year,
        "total_enrollments": len(enrollments),
        "total_due": total_due,
        "total_paid": total_paid,
        "pending_amount": pending_amount,
        "paid_students": paid_students,
        "pending_students": pending_students,
    }


@router.get("/{fee_payment_id}", response_model=schemas.FeePaymentResponse)
def get_fee_payment(
    fee_payment_id: int,
    db: Session = Depends(get_db),
):
    fee_payment = get_fee_payment_or_404(fee_payment_id, db)

    return fee_payment


@router.put("/{fee_payment_id}", response_model=schemas.FeePaymentResponse)
def update_fee_payment(
    fee_payment_id: int,
    updated_fee_payment: schemas.FeePaymentUpdate,
    db: Session = Depends(get_db),
):
    fee_payment = get_fee_payment_or_404(fee_payment_id, db)

    update_data = updated_fee_payment.model_dump(exclude_unset=True)

    if "fee_month" in update_data or "fee_year" in update_data:
        validate_fee_month_year(
            update_data.get("fee_month", fee_payment.fee_month),
            update_data.get("fee_year", fee_payment.fee_year),
        )

    if "status" in update_data:
        validate_fee_status(update_data["status"])

    for key, value in update_data.items():
        setattr(fee_payment, key, value)

    if update_data.get("status") == "paid":
        fee_payment.paid_at = datetime.now(timezone.utc)

    if update_data.get("status") == "pending":
        fee_payment.paid_at = None

    db.commit()
    db.refresh(fee_payment)

    return fee_payment


@router.delete("/{fee_payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fee_payment(
    fee_payment_id: int,
    db: Session = Depends(get_db),
):
    fee_payment = get_fee_payment_or_404(fee_payment_id, db)

    db.delete(fee_payment)
    db.commit()

    return None