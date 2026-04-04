from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Game, Section, Test
from schemas import GameResponse, SectionResponse, TestResponse

router = APIRouter()


@router.get("", response_model=list[GameResponse])
def list_games(db: Session = Depends(get_db)):
    games = db.query(Game).order_by(Game.id).all()
    return games


@router.get("/{slug}/sections", response_model=list[SectionResponse])
def get_game_sections(slug: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.slug == slug).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game.sections


@router.get("/{slug}/tests", response_model=list[TestResponse])
def get_game_tests(slug: str, db: Session = Depends(get_db)):
    """All tests for game (for playing)."""
    game = db.query(Game).filter(Game.slug == slug).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    tests = db.query(Test).join(Section).filter(Section.game_id == game.id).all()
    return tests
