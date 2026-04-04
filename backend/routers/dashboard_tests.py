from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import AuthAccount, TeacherTest
from dashboard_schemas import CreateTestRequest
from dashboard_security import require_role

router = APIRouter(prefix="/tests", tags=["dashboard-tests"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_test(
    payload: CreateTestRequest,
    teacher: AuthAccount = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    test = TeacherTest(
        teacher_id=teacher.id,
        title=payload.title,
        description=payload.description or "",
        questions=[q.model_dump() for q in payload.questions],
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return {
        "test": {
            "_id": str(test.id),
            "title": test.title,
            "description": test.description or "",
            "questions": test.questions,
            "createdAt": test.created_at,
        }
    }


@router.get("/")
def list_tests(
    teacher: AuthAccount = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    tests = (
        db.query(TeacherTest)
        .filter(TeacherTest.teacher_id == teacher.id)
        .order_by(TeacherTest.created_at.desc())
        .all()
    )
    return {
        "tests": [
            {
                "_id": str(t.id),
                "title": t.title,
                "description": t.description or "",
                "questions": t.questions,
                "createdAt": t.created_at,
            }
            for t in tests
        ]
    }


@router.delete("/{test_id}")
def delete_test(
    test_id: int,
    teacher: AuthAccount = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    test = db.query(TeacherTest).filter(TeacherTest.id == test_id, TeacherTest.teacher_id == teacher.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    db.delete(test)
    db.commit()
    return {"ok": True}

