from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=True)
    parent_name = Column(String(150), nullable=True)
    parent_phone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    address = Column(Text, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    enrollments = relationship("Enrollment", back_populates="student")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    monthly_fee = Column(Numeric(10, 2), nullable=False, default=0)
    duration_months = Column(Integer, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    batches = relationship("Batch", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    start_time = Column(String(20), nullable=True)
    end_time = Column(String(20), nullable=True)
    days = Column(String(100), nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="batches")
    enrollments = relationship("Enrollment", back_populates="batch")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    monthly_fee = Column(Numeric(10, 2), nullable=False, default=0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    batch = relationship("Batch", back_populates="enrollments")
    attendance_records = relationship("Attendance", back_populates="enrollment")
    fee_payments = relationship("FeePayment", back_populates="enrollment")


class Attendance(Base):
    __tablename__ = "attendance"

    __table_args__ = (
        UniqueConstraint(
            "enrollment_id",
            "attendance_date",
            name="unique_enrollment_attendance_date",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), nullable=False)
    attendance_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    enrollment = relationship("Enrollment", back_populates="attendance_records")


class FeePayment(Base):
    __tablename__ = "fee_payments"

    __table_args__ = (
        UniqueConstraint(
            "enrollment_id",
            "fee_month",
            "fee_year",
            name="unique_enrollment_fee_month_year",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), nullable=False)
    fee_month = Column(Integer, nullable=False)
    fee_year = Column(Integer, nullable=False)
    amount_due = Column(Numeric(10, 2), nullable=False, default=0)
    amount_paid = Column(Numeric(10, 2), nullable=False, default=0)
    status = Column(String(20), default="pending")
    paid_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    enrollment = relationship("Enrollment", back_populates="fee_payments")