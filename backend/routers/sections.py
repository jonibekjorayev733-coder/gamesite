from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Section, Test, User
from schemas import SectionCreate, SectionResponse, TestResponse
from auth import get_current_user

router = APIRouter()


@router.get("/{section_id}/tests", response_model=list[TestResponse])
def get_section_tests(
    section_id: int,
    limit: int = Query(default=20, le=20, ge=1),
    db: Session = Depends(get_db),
):
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    tests = db.query(Test).filter(Test.section_id == section_id).limit(limit).all()
    return tests


@router.post("/", response_model=SectionResponse, status_code=201)
def add_section(
    section: SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_section = Section(
        game_id=section.game_id,
        name=section.name,
        order=section.order,
    )
    db.add(new_section)
    db.commit()
    db.refresh(new_section)
    return new_section
