from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import random

from database import get_db
from models import Test, Game
from schemas import GameTestSetCreate, GameQuestionOut, GameQuestionCreate

router = APIRouter(prefix="/api/game-tests", tags=["game-tests"])

@router.get("/{game_slug}/questions")
def get_game_questions(game_slug: str, count: int = Query(8, ge=1, le=50), db: Session = Depends(get_db)):
    """Fetch questions for a specific game (e.g., baraban) and return in required format."""
    # Query tests for the specific game slug
    db_tests = db.query(Test).filter(Test.game_key == game_slug).all()
    
    if not db_tests:
        raise HTTPException(status_code=404, detail=f"Savollari topilmadi: {game_slug}")
    
    # Select random questions up to count
    selected_tests = random.sample(db_tests, min(count, len(db_tests)))
    
    # Map to the format expected by BarabanGameV2
    questions = []
    for t in selected_tests:
        questions.append({
            "id": t.id,
            "prompt": t.question,
            "options": [{"text": opt} for opt in t.options],
            "correct_index": t.correct_index,
            "explanation": t.explanation or "To'g'ri javob",
            "difficulty": t.difficulty or "medium"
        })
    
    return {"questions": questions}

@router.get("/merged/{game_slug}")
def get_merged_tests(game_slug: str, db: Session = Depends(get_db)):
    """Fetch database tests for a specific game and return in V5 format."""
    # We use game_slug as game_key in the tests table
    db_tests = db.query(Test).filter(Test.game_key == game_slug).all()
    
    # Map to V5 format (prompt, options with text objects)
    results = []
    for t in db_tests:
        results.append({
            "id": t.id,
            "prompt": t.question,
            "options": [{"text": opt} for opt in t.options],
            "correct_index": t.correct_index,
            "explanation": t.explanation or "To'g'ri javob",
            "difficulty": t.difficulty or "medium"
        })
    
    return results

@router.post("/sets")
def create_game_test_set(payload: GameTestSetCreate, db: Session = Depends(get_db)):
    """Handle the V5 'sets' payload from TestManager."""
    new_ids = []
    for q in payload.questions:
        # Map V5 question to the 'tests' table row
        new_test = Test(
            game_key=payload.game_key,
            question=q.prompt,
            options=[opt["text"] for opt in q.options],
            correct_index=q.correct_index,
            explanation=q.explanation,
            difficulty=q.difficulty
        )
        db.add(new_test)
        db.commit()
        db.refresh(new_test)
        new_ids.append(new_test.id)
    
    return {"status": "ok", "test_ids": new_ids}
