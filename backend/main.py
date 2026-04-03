from sqlalchemy import text
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # Import models to register them with SQLAlchemy
from routers import auth, games, sections, tests, game_tests, teacher_auth, custom_tests, teacher_tests_api
from routers import dashboard_auth, dashboard_tests, dashboard_results, user_games

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vite Project API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["auth"])
app.include_router(teacher_auth.router, prefix="/api/auth", tags=["teacher-auth"])
app.include_router(dashboard_auth.router, tags=["dashboard-auth-v2"])
app.include_router(games.router, prefix="/games", tags=["games"])
app.include_router(sections.router, prefix="/sections", tags=["sections"])
app.include_router(tests.router, prefix="/legacy/tests", tags=["tests-legacy"])
app.include_router(tests.router, prefix="/api", tags=["tests-api"])
app.include_router(teacher_tests_api.router, prefix="/api", tags=["teacher-tests-api"])
app.include_router(dashboard_tests.router, tags=["dashboard-tests-v2"])
app.include_router(dashboard_results.router, tags=["dashboard-results-v2"])
app.include_router(game_tests.router, tags=["game-tests"])
app.include_router(custom_tests.router, tags=["custom-tests"])
app.include_router(user_games.router, tags=["user-games"])


@app.get("/")
def root():
    return {"message": "Interaktiv-ta'lim API", "version": "1.0"}


@app.get("/api/tests")
def get_api_tests():
    """Get all tests for API - compatibility endpoint"""
    from database import SessionLocal
    from models import Test
    db = SessionLocal()
    try:
        tests = db.query(Test).all()
        return {"tests": [{"_id": str(t.id), "title": t.question[:50]} for t in tests]}
    finally:
        db.close()


@app.get("/api/tests-by-game/{game_slug}")
def get_tests_by_game(game_slug: str):
    """Get all tests for a specific game"""
    from database import SessionLocal
    from models import Test, Game
    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.slug == game_slug).first()
        if not game:
            return {"error": "Game not found", "tests": []}
        
        tests = db.query(Test).filter(Test.game_key == game_slug).all()
        return {
            "game": {"id": game.id, "name": game.name, "slug": game.slug},
            "tests": [
                {
                    "id": t.id,
                    "question": t.question,
                    "options": t.options,
                    "correct_index": t.correct_index,
                    "explanation": t.explanation,
                    "difficulty": t.difficulty
                }
                for t in tests
            ]
        }
    finally:
        db.close()


@app.get("/api/all-games-with-tests")
def get_all_games_with_tests():
    """Get all games with their tests - for teacher panel"""
    try:
        from database import SessionLocal
        from models import Game, Test
        db = SessionLocal()
        try:
            games = db.query(Game).all()
            result = []
            
            for game in games:
                try:
                    tests = db.query(Test).filter(Test.game_key == game.slug).all()
                    result.append({
                        "id": game.id,
                        "name": game.name,
                        "slug": game.slug,
                        "test_count": len(tests),
                        "tests": [
                            {
                                "id": t.id,
                                "question": t.question[:100] if t.question else "",
                                "options": t.options if t.options else [],
                                "difficulty": t.difficulty if hasattr(t, 'difficulty') and t.difficulty else "easy"
                            }
                            for t in tests
                        ]
                    })
                except Exception as e:
                    import sys
                    print(f"Error loading tests for game {game.slug}: {e}", file=sys.stderr)
            
            return {"games": result, "status": "ok"}
        finally:
            db.close()
    except Exception as e:
        import sys, traceback
        print(f"Error in get_all_games_with_tests: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {"games": [], "error": str(e), "status": "error"}


@app.get("/api/results/top-users")
def get_top_users():
    """Get top users by score - for teacher panel"""
    from database import SessionLocal
    from models import UserGame
    from sqlalchemy import func
    
    db = SessionLocal()
    try:
        # Get top 10 users by total score
        top_users = db.query(
            UserGame.user_id,
            UserGame.username,
            func.sum(UserGame.score).label("total_score"),
            func.count(UserGame.id).label("games_played")
        ).group_by(UserGame.user_id, UserGame.username).order_by(
            func.sum(UserGame.score).desc()
        ).limit(10).all()
        
        return {
            "top_users": [
                {
                    "user_id": str(u.user_id) if u.user_id else "unknown",
                    "username": u.username if u.username else "Anonymous",
                    "total_score": u.total_score or 0,
                    "games_played": u.games_played or 0
                }
                for u in top_users
            ]
        }
    except Exception as e:
        print(f"Error in get_top_users: {e}")
        return {"top_users": [], "error": str(e)}
    finally:
        db.close()


@app.post("/api/ai/generate-tests/{game_slug}")
def generate_ai_tests(game_slug: str, count: int = 5):
    """Generate test questions using AI for a specific game"""
    try:
        from ai_generator import generate_tests_for_game
        
        result = generate_tests_for_game(game_slug, count=count)
        
        if result and result.get("questions"):
            return result
        else:
            return {"questions": [], "error": "AI test yaratishda xato"}
    except Exception as e:
        print(f"Error generating AI tests: {e}")
        import traceback
        traceback.print_exc()
        return {"questions": [], "error": f"Xato: {str(e)}"}


@app.get("/health")
def health():
    """Frontend backend holatini tekshirish uchun"""
    try:
        from database import engine
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "ok", "database": "disconnected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
