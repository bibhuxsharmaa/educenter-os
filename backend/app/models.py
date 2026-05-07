from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
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