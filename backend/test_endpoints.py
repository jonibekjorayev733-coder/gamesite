#!/usr/bin/env python3
"""Test the API endpoints"""

import sys
sys.path.insert(0, "c:\\react Jonibek\\new04\\gamesite\\backend")

from database import SessionLocal
from models import Game, Test, UserGame
from sqlalchemy import func

# Test 1: Check games
print("=" * 50)
print("TEST 1: Checking games...")
db = SessionLocal()
try:
    games = db.query(Game).all()
    print(f"✓ Found {len(games)} games:")
    for game in games:
        tests = db.query(Test).filter(Test.game_key == game.slug).all()
        print(f"  - {game.name} ({game.slug}): {len(tests)} tests")
        
        # Show first test
        if tests:
            t = tests[0]
            print(f"    First test: {t.question[:50]}...")
            print(f"    Difficulty: {t.difficulty if hasattr(t, 'difficulty') else 'N/A'}")
            print(f"    Options type: {type(t.options)}, value: {t.options}")
finally:
    db.close()

# Test 2: Check UserGame structure
print("\n" + "=" * 50)
print("TEST 2: Checking UserGame...")
db = SessionLocal()
try:
    users = db.query(UserGame).all()
    print(f"✓ Found {len(users)} user games")
    
    # Try aggregation query
    top_users = db.query(
        UserGame.user_id,
        UserGame.username,
        func.sum(UserGame.score).label("total_score"),
        func.count(UserGame.id).label("games_played")
    ).group_by(UserGame.user_id, UserGame.username).limit(3).all()
    
    print(f"✓ Top users query works: {len(top_users)} results")
finally:
    db.close()

print("\n✅ All tests passed!")
