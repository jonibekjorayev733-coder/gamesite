from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Section, Test, User
from schemas import TestCreate, TestResponse
from auth import get_current_user

router = APIRouter()

TESTS_PER_SECTION_LIMIT = 20


@router.get("/", response_model=List[TestResponse])
def get_tests(db: Session = Depends(get_db)):
    """Get all tests"""
    tests = db.query(Test).all()
    return tests


@router.post("/", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
def add_test(
    test: TestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    section = db.query(Section).filter(Section.id == test.section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    existing_count = db.query(Test).filter(Test.section_id == test.section_id).count()
    if existing_count >= TESTS_PER_SECTION_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"Section limit reached: maximum {TESTS_PER_SECTION_LIMIT} tests per section",
        )

    new_test = Test(
        section_id=test.section_id,
        question=test.question,
        options=test.options,
        correct_index=test.correct_index,
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test
