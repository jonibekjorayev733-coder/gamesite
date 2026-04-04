from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import CustomTest, Teacher
from pydantic import BaseModel
from routers.teacher_auth import get_current_teacher

router = APIRouter(prefix="/custom-tests", tags=["custom-tests"])


class CustomTestCreate(BaseModel):
    game_slug: str
    question: str
    options: List[str]  # 4 ta variant
    correct_index: int  # 0-3
    explanation: str = ""
    difficulty: str = "medium"


class CustomTestResponse(BaseModel):
    id: int
    game_slug: str
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    difficulty: str
    created_at: str

    class Config:
        from_attributes = True


@router.post("/create", response_model=CustomTestResponse)
def create_custom_test(
    test_data: CustomTestCreate,
    token: str,
    db: Session = Depends(get_db)
):
    """O'qituvchi test qo'shishi"""
    
    # Teacher ma'lumotlarini olish
    teacher = get_current_teacher(token, db)
    
    # Validate options
    if len(test_data.options) != 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exactly 4 options required"
        )
    
    if not (0 <= test_data.correct_index < 4):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="correct_index must be 0-3"
        )
    
    # Create test
    custom_test = CustomTest(
        teacher_id=teacher.id,
        game_slug=test_data.game_slug,
        question=test_data.question,
        options=test_data.options,
        correct_index=test_data.correct_index,
        explanation=test_data.explanation,
        difficulty=test_data.difficulty
    )
    
    db.add(custom_test)
    db.commit()
    db.refresh(custom_test)
    
    return CustomTestResponse.from_orm(custom_test)


@router.get("/my-tests/{game_slug}", response_model=List[CustomTestResponse])
def get_my_tests(
    game_slug: str,
    token: str,
    db: Session = Depends(get_db)
):
    """O'qituvchining o'yiniga qo'shilgan testlarini olish"""
    
    teacher = get_current_teacher(token, db)
    
    tests = db.query(CustomTest).filter(
        (CustomTest.teacher_id == teacher.id) &
        (CustomTest.game_slug == game_slug)
    ).order_by(CustomTest.created_at.desc()).all()
    
    return [CustomTestResponse.from_orm(t) for t in tests]


@router.get("/game/{game_slug}", response_model=List[CustomTestResponse])
def get_game_tests(
    game_slug: str,
    db: Session = Depends(get_db)
):
    """O'yinning barcha custom testlarini olish (frontend uchun)"""
    
    tests = db.query(CustomTest).filter(
        CustomTest.game_slug == game_slug
    ).order_by(CustomTest.created_at.desc()).all()
    
    return [CustomTestResponse.from_orm(t) for t in tests]


@router.delete("/{test_id}")
def delete_test(
    test_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    """O'qituvchi testni o'chirishi"""
    
    teacher = get_current_teacher(token, db)
    
    test = db.query(CustomTest).filter(CustomTest.id == test_id).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    if test.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other teacher's test"
        )
    
    db.delete(test)
    db.commit()
    
    return {"message": "Test deleted successfully"}
