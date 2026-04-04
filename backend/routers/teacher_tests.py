from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import AuthAccount, TeacherTest, TestResult
from routers.teacher_auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/teacher-tests", tags=["teacher-tests"])


@router.post("/create")
async def create_test(
    test_data: dict,
    current_user: AuthAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new test (teacher only)"""
    
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faqat o'qituvchilar test yaratishi mumkin"
        )
    
    try:
        new_test = TeacherTest(
            teacher_id=current_user.id,
            title=test_data.get("title", ""),
            description=test_data.get("description", ""),
            questions=test_data.get("questions", [])
        )
        db.add(new_test)
        db.commit()
        db.refresh(new_test)
        
        return {
            "success": True,
            "id": new_test.id,
            "title": new_test.title,
            "message": "Test muvaffaqiyatli yaratildi"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Test yaratishda xato: {str(e)}"
        )


@router.get("/my-tests")
async def get_my_tests(
    current_user: AuthAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tests created by current teacher"""
    
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faqat o'qituvchilar"
        )
    
    tests = db.query(TeacherTest).filter(
        TeacherTest.teacher_id == current_user.id
    ).order_by(TeacherTest.created_at.desc()).all()
    
    return [
        {
            "id": test.id,
            "title": test.title,
            "description": test.description,
            "question_count": len(test.questions) if test.questions else 0,
            "created_at": test.created_at.isoformat() if test.created_at else None
        }
        for test in tests
    ]


@router.get("/{test_id}")
async def get_test(
    test_id: int,
    current_user: AuthAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get test details"""
    
    test = db.query(TeacherTest).filter(TeacherTest.id == test_id).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test topilmadi"
        )
    
    return {
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "questions": test.questions,
        "created_at": test.created_at.isoformat() if test.created_at else None
    }


@router.delete("/delete/{test_id}")
async def delete_test(
    test_id: int,
    current_user: AuthAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete test (teacher only)"""
    
    test = db.query(TeacherTest).filter(TeacherTest.id == test_id).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test topilmadi"
        )
    
    if test.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Siz faqat o'z testlaringizni o'chirishingiz mumkin"
        )
    
    try:
        db.delete(test)
        db.commit()
        return {"success": True, "message": "Test muvaffaqiyatli o'chirildi"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"O'chirishda xato: {str(e)}"
        )


@router.post("/submit/{test_id}")
async def submit_test(
    test_id: int,
    answers: dict,
    current_user: AuthAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit test answers and calculate score"""
    
    test = db.query(TeacherTest).filter(TeacherTest.id == test_id).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test topilmadi"
        )
    
    # Calculate score
    score = 0
    if test.questions:
        for i, question in enumerate(test.questions):
            if str(i) in answers:
                if answers[str(i)] == question.get("correctIndex"):
                    score += 1
    
    # Save result
    result = TestResult(
        user_id=current_user.id,
        test_id=test.id,
        score=score,
        meta={"answers": answers}
    )
    db.add(result)
    db.commit()
    
    return {
        "success": True,
        "score": score,
        "total": len(test.questions) if test.questions else 0,
        "percentage": round((score / len(test.questions) * 100) if test.questions else 0)
    }
