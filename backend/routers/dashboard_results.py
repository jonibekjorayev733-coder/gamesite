from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from database import get_db
from models import AuthAccount, TeacherTest, TestResult
from dashboard_schemas import ResultSubmitRequest
from dashboard_security import require_role

router = APIRouter(prefix="/results", tags=["dashboard-results"])


@router.post("/submit")
def submit_result(
    payload: ResultSubmitRequest,
    user: AuthAccount = Depends(require_role("user")),
    db: Session = Depends(get_db),
):
    result = TestResult(
        user_id=user.id,
        test_id=payload.testId,
        score=payload.score,
        meta=payload.meta or {},
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return {"resultId": result.id}


@router.get("/top-users")
def top_users(
    teacher: AuthAccount = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            AuthAccount.id.label("user_id"),
            AuthAccount.email.label("email"),
            AuthAccount.full_name.label("full_name"),
            func.sum(TestResult.score).label("total_score"),
            func.count(TestResult.id).label("attempts"),
        )
        .join(TestResult, TestResult.user_id == AuthAccount.id)
        .join(TeacherTest, TeacherTest.id == TestResult.test_id)
        .filter(TeacherTest.teacher_id == teacher.id)
        .group_by(AuthAccount.id, AuthAccount.email, AuthAccount.full_name)
        .order_by(desc("total_score"))
        .all()
    )

    return {
        "topUsers": [
            {
                "userId": str(r.user_id),
                "totalScore": int(r.total_score or 0),
                "attempts": int(r.attempts or 0),
                "email": r.email,
                "fullName": r.full_name or "",
            }
            for r in rows
        ]
    }


@router.get("/")
def list_results(
    testId: int | None = None,
    userId: int | None = None,
    teacher: AuthAccount = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    query = (
        db.query(TestResult, TeacherTest, AuthAccount)
        .join(TeacherTest, TeacherTest.id == TestResult.test_id)
        .join(AuthAccount, AuthAccount.id == TestResult.user_id)
        .filter(TeacherTest.teacher_id == teacher.id)
    )

    if testId is not None:
        query = query.filter(TestResult.test_id == testId)
    if userId is not None:
        query = query.filter(TestResult.user_id == userId)

    rows = query.order_by(TestResult.created_at.desc()).all()

    return {
        "results": [
            {
                "id": str(result.id),
                "score": result.score,
                "createdAt": result.created_at,
                "test": {"id": str(test.id), "title": test.title},
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "fullName": user.full_name or "",
                },
            }
            for result, test, user in rows
        ]
    }

