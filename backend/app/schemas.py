from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, EmailStr


class StudentBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    status: str = "active"


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    status: Optional[str] = None


class StudentResponse(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None
    monthly_fee: Decimal = Decimal("0.00")
    duration_months: Optional[int] = None
    status: str = "active"


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    monthly_fee: Optional[Decimal] = None
    duration_months: Optional[int] = None
    status: Optional[str] = None


class CourseResponse(CourseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BatchBase(BaseModel):
    name: str
    course_id: int
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    days: Optional[str] = None
    status: str = "active"


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    name: Optional[str] = None
    course_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    days: Optional[str] = None
    status: Optional[str] = None


class BatchResponse(BatchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    batch_id: int
    monthly_fee: Decimal = Decimal("0.00")
    status: str = "active"


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    monthly_fee: Optional[Decimal] = None
    status: Optional[str] = None


class EnrollmentResponse(EnrollmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentDetailResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    course_id: int
    course_name: str
    batch_id: int
    batch_name: str
    monthly_fee: Decimal
    status: str
    created_at: datetime


class AttendanceBase(BaseModel):
    enrollment_id: int
    attendance_date: date
    status: str
    notes: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceDetailResponse(BaseModel):
    id: int
    enrollment_id: int
    attendance_date: date
    status: str
    notes: Optional[str] = None
    student_name: str
    course_name: str
    batch_name: str
    created_at: datetime


class FeePaymentBase(BaseModel):
    enrollment_id: int
    fee_month: int
    fee_year: int
    amount_due: Decimal = Decimal("0.00")
    amount_paid: Decimal = Decimal("0.00")
    status: str = "pending"
    notes: Optional[str] = None


class FeePaymentCreate(FeePaymentBase):
    pass


class FeePaymentUpdate(BaseModel):
    amount_due: Optional[Decimal] = None
    amount_paid: Optional[Decimal] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class FeePaymentResponse(FeePaymentBase):
    id: int
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FeePaymentDetailResponse(BaseModel):
    id: int
    enrollment_id: int
    student_name: str
    course_name: str
    batch_name: str
    fee_month: int
    fee_year: int
    amount_due: Decimal
    amount_paid: Decimal
    status: str
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime