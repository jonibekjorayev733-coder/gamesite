from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginRequest, RegisterRequest, Token
from auth import verify_password, create_access_token, get_password_hash

router = APIRouter()


@router.post("/register", response_model=Token)
def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email and full name"""
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == register_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Generate username from email (remove domain)
    username = register_data.email.split("@")[0]
    
    # Check if generated username exists, append number if needed
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        counter = 1
        while db.query(User).filter(User.username == f"{username}{counter}").first():
            counter += 1
        username = f"{username}{counter}"
    
    # Create new user
    new_user = User(
        username=username,
        email=register_data.email,
        full_name=register_data.full_name,
        password_hash=get_password_hash(register_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Return token
    access_token = create_access_token(data={"sub": new_user.username})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login with username or email"""
    # Try to find user by username first, then by email
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user:
        user = db.query(User).filter(User.email == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token)

