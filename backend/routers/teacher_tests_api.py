"""Teacher Tests API endpoints - for the teacher panel UI"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import CustomTest, Teacher
from pydantic import BaseModel
from routers.teacher_auth import get_current_teacher
from fastapi import Header

router = APIRouter(prefix="/tests", tags=["teacher-tests-api"])


class QuestionInput(BaseModel):
    text: str
    options: list
    correctIndex: int
    explanation: Optional[str] = ""


class TestCreateRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    questions: List[QuestionInput]
    game_slug: Optional[str] = None  # Optional for backward compatibility


class TestResponse(BaseModel):
    _id: str
    title: str
    description: Optional[str]
    questions: list
    createdAt: str
    game_slug: Optional[str]

    class Config:
        from_attributes = True


@router.post("")
def create_test(
    request: TestCreateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new test"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        teacher = get_current_teacher(token, db)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Validate input
    if not request.title or not request.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title is required"
        )
    
    if not request.questions or len(request.questions) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one question is required"
        )
    
    # Validate questions
    for i, q in enumerate(request.questions):
        if not q.text or not q.text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question {i+1}: text is required"
            )
        
        if not q.options or len(q.options) != 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question {i+1}: exactly 4 options required"
            )
        
        if not all(opt and str(opt).strip() for opt in q.options):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question {i+1}: all options must be filled"
            )
        
        if not (0 <= q.correctIndex < 4):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question {i+1}: correctIndex must be 0-3"
            )
    
    # Determine game slug - use provided or default to "general"
    game_slug = request.game_slug or "general"
    
    # Create test document
    test_doc = CustomTest(
        teacher_id=teacher.id,
        game_slug=game_slug,
        question=request.title,  # Store title in question field for compatibility
        options=None,  # Not used for custom tests
        correct_index=0,  # Not used for custom tests
        explanation=request.description or "",
        difficulty="mixed",
        # Store full test data as JSON
        test_data={
            "title": request.title,
            "description": request.description or "",
            "questions": [
                {
                    "text": q.text,
                    "options": q.options,
                    "correctIndex": q.correctIndex,
                    "explanation": q.explanation or ""
                }
                for q in request.questions
            ]
        }
    )
    
    db.add(test_doc)
    db.commit()
    db.refresh(test_doc)
    
    return {
        "_id": str(test_doc.id),
        "title": request.title,
        "description": request.description,
        "questions": [
            {
                "text": q.text,
                "options": q.options,
                "correctIndex": q.correctIndex,
                "explanation": q.explanation or ""
            }
            for q in request.questions
        ],
        "createdAt": test_doc.created_at.isoformat() if hasattr(test_doc, 'created_at') and test_doc.created_at else "",
        "game_slug": game_slug
    }


@router.get("")
def get_tests(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get all tests for the current teacher"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        teacher = get_current_teacher(token, db)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    tests = db.query(CustomTest).filter(
        CustomTest.teacher_id == teacher.id
    ).order_by(CustomTest.created_at.desc()).all()
    
    result = []
    for t in tests:
        # Try to extract test data from test_data field
        test_info = getattr(t, 'test_data', None) or {}
        result.append({
            "_id": str(t.id),
            "title": test_info.get("title", t.question),
            "description": test_info.get("description", t.explanation),
            "questions": test_info.get("questions", []),
            "createdAt": t.created_at.isoformat() if hasattr(t, 'created_at') and t.created_at else "",
            "game_slug": t.game_slug
        })
    
    return {"tests": result}


@router.delete("/{test_id}")
def delete_test(
    test_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a test"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        teacher = get_current_teacher(token, db)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    try:
        test_id_int = int(test_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid test ID"
        )
    
    test = db.query(CustomTest).filter(CustomTest.id == test_id_int).first()
    
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


@router.put("/{test_id}")
def update_test(
    test_id: str,
    request: TestCreateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Update a test"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        teacher = get_current_teacher(token, db)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    try:
        test_id_int = int(test_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid test ID"
        )
    
    test = db.query(CustomTest).filter(CustomTest.id == test_id_int).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    if test.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit other teacher's test"
        )
    
    # Update test data
    test.question = request.title
    test.explanation = request.description or ""
    test.test_data = {
        "title": request.title,
        "description": request.description or "",
        "questions": [
            {
                "text": q.text,
                "options": q.options,
                "correctIndex": q.correctIndex,
                "explanation": q.explanation or ""
            }
            for q in request.questions
        ]
    }
    
    db.commit()
    db.refresh(test)
    
    return {
        "_id": str(test.id),
        "title": request.title,
        "description": request.description,
        "questions": [
            {
                "text": q.text,
                "options": q.options,
                "correctIndex": q.correctIndex,
                "explanation": q.explanation or ""
            }
            for q in request.questions
        ],
        "createdAt": test.created_at.isoformat() if hasattr(test, 'created_at') and test.created_at else "",
        "game_slug": getattr(test, 'game_slug', 'general')
    }
