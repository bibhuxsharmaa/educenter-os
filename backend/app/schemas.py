from datetime import datetime
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


class BatchResponse(BatchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True