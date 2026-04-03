from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import UserGame, User

router = APIRouter(prefix="/api/user-games", tags=["user-games"])


class UserGameCreate(BaseModel):
    username: str
    email: Optional[str] = None
    game_slug: str
    score: int = 0
    mode: str = "single"  # "single" or "team"
    team1_score: Optional[int] = None
    team2_score: Optional[int] = None
    questions_answered: int = 0
    correct_answers: int = 0


class UserGameResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    game_slug: str
    score: int
    mode: str
    team1_score: Optional[int]
    team2_score: Optional[int]
    questions_answered: int
    correct_answers: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/save", response_model=UserGameResponse)
def save_game_result(game_data: UserGameCreate, db: Session = Depends(get_db)):
    """Save game result for a user"""
    # Find or create user by username
    user = db.query(User).filter(User.username == game_data.username).first()
    
    if not user:
        # Create a new user if doesn't exist
        user = User(
            username=game_data.username,
            password_hash=""  # Anonymous user
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create game record
    user_game = UserGame(
        user_id=user.id,
        game_slug=game_data.game_slug,
        email=game_data.email,
        score=game_data.score,
        mode=game_data.mode,
        team1_score=game_data.team1_score,
        team2_score=game_data.team2_score,
        questions_answered=game_data.questions_answered,
        correct_answers=game_data.correct_answers,
    )
    
    db.add(user_game)
    db.commit()
    db.refresh(user_game)
    
    return {
        "id": user_game.id,
        "username": user.username,
        "email": user_game.email,
        "game_slug": user_game.game_slug,
        "score": user_game.score,
        "mode": user_game.mode,
        "team1_score": user_game.team1_score,
        "team2_score": user_game.team2_score,
        "questions_answered": user_game.questions_answered,
        "correct_answers": user_game.correct_answers,
        "created_at": user_game.created_at,
    }


@router.get("/user/{username}", response_model=List[UserGameResponse])
def get_user_games(username: str, db: Session = Depends(get_db)):
    """Get all game records for a user"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    games = db.query(UserGame).filter(UserGame.user_id == user.id).all()
    
    return [
        {
            "id": g.id,
            "username": user.username,
            "email": g.email,
            "game_slug": g.game_slug,
            "score": g.score,
            "mode": g.mode,
            "team1_score": g.team1_score,
            "team2_score": g.team2_score,
            "questions_answered": g.questions_answered,
            "correct_answers": g.correct_answers,
            "created_at": g.created_at,
        }
        for g in games
    ]


@router.get("/game/{game_slug}", response_model=List[UserGameResponse])
def get_game_leaderboard(game_slug: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get top scores for a specific game"""
    games = db.query(UserGame).filter(
        UserGame.game_slug == game_slug
    ).order_by(
        UserGame.score.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": g.id,
            "username": g.user.username if g.user else "Anonymous",
            "email": g.email,
            "game_slug": g.game_slug,
            "score": g.score,
            "mode": g.mode,
            "team1_score": g.team1_score,
            "team2_score": g.team2_score,
            "questions_answered": g.questions_answered,
            "correct_answers": g.correct_answers,
            "created_at": g.created_at,
        }
        for g in games
    ]
