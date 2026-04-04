from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
import hashlib
import hmac
from database import SessionLocal
from models import Teacher
from pydantic import BaseModel

router = APIRouter(prefix="/teacher", tags=["teacher-auth"])
security = HTTPBearer()

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


# Test endpoint to verify router is working
@router.get("/health")
def teacher_health():
    """Check if teacher router is accessible"""
    return {"status": "teacher router is active"}


class TeacherRegister(BaseModel):
    email: str
    password: str
    full_name: str


class TeacherLogin(BaseModel):
    email: str
    password: str


class TeacherResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    teacher: TeacherResponse


def hash_password(password: str) -> str:
    """SHA256 bilan password hash qilish"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def verify_password(password: str, hashed_password: str) -> bool:
    """Password taqqoslash"""
    try:
        return hash_password(password) == hashed_password
    except Exception as e:
        print(f"Password verification error: {e}")
        return False


def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_teacher(token: str, db: Session) -> Teacher:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        teacher_id: int = payload.get("sub")
        if teacher_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.post("/register", response_model=TokenResponse)
def register(data: TeacherRegister):
    """O'qituvchi ro'yxatdan o'tish"""
    db = SessionLocal()
    try:
        # Check if teacher already exists
        existing = db.query(Teacher).filter(
            Teacher.email == data.email
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Create new teacher
        hashed_password = hash_password(data.password)
        teacher = Teacher(
            username=data.email,
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name
        )
        
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
        
        # Create token
        access_token = create_access_token(data={"sub": teacher.id})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            teacher=TeacherResponse(
                id=teacher.id,
                username=teacher.username,
                email=teacher.email,
                full_name=teacher.full_name,
                is_active=teacher.is_active
            )
        )
    finally:
        db.close()


@router.post("/login", response_model=TokenResponse)
def login(data: TeacherLogin):
    """O'qituvchi login"""
    db = SessionLocal()
    try:
        teacher = db.query(Teacher).filter(Teacher.email == data.email).first()
        
        if not teacher or not verify_password(data.password, teacher.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not teacher.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Teacher account is disabled"
            )
        
        # Create token
        access_token = create_access_token(data={"sub": teacher.id})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            teacher=TeacherResponse(
                id=teacher.id,
                username=teacher.username,
                email=teacher.email,
                full_name=teacher.full_name,
                is_active=teacher.is_active
            )
        )
    finally:
        db.close()


@router.get("/me", response_model=TeacherResponse)
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Joriy o'qituvchi ma'lumotlarini olish"""
    db = SessionLocal()
    try:
        token = credentials.credentials
        teacher = get_current_teacher(token, db)
        return TeacherResponse.from_orm(teacher)
    finally:
        db.close()
