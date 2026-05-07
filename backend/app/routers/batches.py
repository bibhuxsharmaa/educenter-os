from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/batches",
    tags=["Batches"],
)


@router.post("/", response_model=schemas.BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == batch.course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    new_batch = models.Batch(**batch.model_dump())

    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)

    return new_batch


@router.get("/", response_model=List[schemas.BatchResponse])
def get_batches(db: Session = Depends(get_db)):
    batches = db.query(models.Batch).order_by(models.Batch.id.desc()).all()
    return batches


@router.get("/{batch_id}", response_model=schemas.BatchResponse)
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found",
        )

    return batch


@router.put("/{batch_id}", response_model=schemas.BatchResponse)
def update_batch(
    batch_id: int,
    updated_batch: schemas.BatchUpdate,
    db: Session = Depends(get_db),
):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found",
        )

    update_data = updated_batch.model_dump(exclude_unset=True)

    if "course_id" in update_data:
        course = db.query(models.Course).filter(models.Course.id == update_data["course_id"]).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

    for key, value in update_data.items():
        setattr(batch, key, value)

    db.commit()
    db.refresh(batch)

    return batch


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found",
        )

    db.delete(batch)
    db.commit()

    return None