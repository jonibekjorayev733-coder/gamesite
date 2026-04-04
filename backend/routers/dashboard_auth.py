from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import AuthAccount
from dashboard_schemas import (
    AccountOut,
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    TokenTeacherResponse,
    TokenUserResponse,
)
from dashboard_security import (
    create_access_token,
    hash_password,
    require_role,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["dashboard-auth"])


def _account_out(account: AuthAccount) -> AccountOut:
    return AccountOut(
        id=account.id,
        email=account.email,
        fullName=account.full_name,
        role=account.role,
    )


def _normalize_email(email: str) -> str:
    value = (email or "").strip().lower()
    if "@" not in value or "." not in value.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Valid email is required")
    return value


@router.post("/register", response_model=TokenUserResponse)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    existing = db.query(AuthAccount).filter(AuthAccount.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")

    account = AuthAccount(
        email=email,
        password_hash=hash_password(payload.password),
        role="user",
        full_name=payload.fullName or "",
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    token = create_access_token({"sub": str(account.id), "role": account.role})
    return TokenUserResponse(accessToken=token, user=_account_out(account))


@router.post("/login", response_model=TokenUserResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    account = db.query(AuthAccount).filter(AuthAccount.email == email).first()
    if not account or account.role != "user":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, account.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(account.id), "role": account.role})
    return TokenUserResponse(accessToken=token, user=_account_out(account))


@router.post("/teacher/register", response_model=TokenTeacherResponse)
def register_teacher(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    existing = db.query(AuthAccount).filter(AuthAccount.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")

    account = AuthAccount(
        email=email,
        password_hash=hash_password(payload.password),
        role="teacher",
        full_name=payload.fullName or "",
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    token = create_access_token({"sub": str(account.id), "role": account.role})
    return TokenTeacherResponse(accessToken=token, teacher=_account_out(account))


@router.post("/teacher/login", response_model=TokenTeacherResponse)
def login_teacher(payload: LoginRequest, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    account = db.query(AuthAccount).filter(AuthAccount.email == email).first()
    if not account or account.role != "teacher":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, account.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(account.id), "role": account.role})
    return TokenTeacherResponse(accessToken=token, teacher=_account_out(account))


@router.get("/teacher/me")
def teacher_me(account: AuthAccount = Depends(require_role("teacher"))):
    return {"teacher": _account_out(account)}


@router.post("/teacher/change-password")
def teacher_change_password(
    payload: ChangePasswordRequest,
    account: AuthAccount = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.currentPassword, account.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")

    account.password_hash = hash_password(payload.newPassword)
    db.add(account)
    db.commit()
    return {"ok": True}

