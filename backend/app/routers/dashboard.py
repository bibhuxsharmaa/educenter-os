from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(
    fee_month: Optional[int] = Query(default=None),
    fee_year: Optional[int] = Query(default=None),
    attendance_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
):
    today = date.today()

    selected_fee_month = fee_month or today.month
    selected_fee_year = fee_year or today.year
    selected_attendance_date = attendance_date or today

    total_students = db.query(models.Student).count()
    total_courses = db.query(models.Course).count()
    total_batches = db.query(models.Batch).count()
    total_enrollments = db.query(models.Enrollment).count()

    active_students = (
        db.query(models.Student)
        .filter(models.Student.status == "active")
        .count()
    )

    active_courses = (
        db.query(models.Course)
        .filter(models.Course.status == "active")
        .count()
    )

    active_batches = (
        db.query(models.Batch)
        .filter(models.Batch.status == "active")
        .count()
    )

    active_enrollments_query = db.query(models.Enrollment)

    if hasattr(models.Enrollment, "status"):
        active_enrollments_query = active_enrollments_query.filter(
            models.Enrollment.status == "active"
        )

    active_enrollments = active_enrollments_query.all()

    total_active_enrollments = len(active_enrollments)

    present_students = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.attendance_date == selected_attendance_date,
            models.Attendance.status == "present",
        )
        .count()
    )

    absent_students = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.attendance_date == selected_attendance_date,
            models.Attendance.status == "absent",
        )
        .count()
    )

    marked_students = present_students + absent_students
    unmarked_students = total_active_enrollments - marked_students

    if unmarked_students < 0:
        unmarked_students = 0

    total_due = Decimal("0.00")
    total_paid = Decimal("0.00")

    for enrollment in active_enrollments:
        default_monthly_fee = enrollment.monthly_fee or Decimal("0.00")

        fee_payment = (
            db.query(models.FeePayment)
            .filter(
                models.FeePayment.enrollment_id == enrollment.id,
                models.FeePayment.fee_month == selected_fee_month,
                models.FeePayment.fee_year == selected_fee_year,
            )
            .first()
        )

        if fee_payment:
            total_due += fee_payment.amount_due or Decimal("0.00")
            total_paid += fee_payment.amount_paid or Decimal("0.00")
        else:
            total_due += default_monthly_fee

    pending_amount = total_due - total_paid

    if pending_amount < 0:
        pending_amount = Decimal("0.00")

    return {
        "students": {
            "total": total_students,
            "active": active_students,
        },
        "courses": {
            "total": total_courses,
            "active": active_courses,
        },
        "batches": {
            "total": total_batches,
            "active": active_batches,
        },
        "enrollments": {
            "total": total_enrollments,
            "active": total_active_enrollments,
        },
        "attendance": {
            "date": selected_attendance_date,
            "present": present_students,
            "absent": absent_students,
            "unmarked": unmarked_students,
        },
        "fees": {
            "month": selected_fee_month,
            "year": selected_fee_year,
            "total_due": float(total_due),
            "total_paid": float(total_paid),
            "pending_amount": float(pending_amount),
        },
        "messages": {
            "sent": 0,
        },
    }