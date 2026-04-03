#!/usr/bin/env python3
"""Add username column to user_games table"""

from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Add username column if it doesn't exist
        conn.execute(text('ALTER TABLE user_games ADD COLUMN IF NOT EXISTS username VARCHAR(100)'))
        conn.commit()
        print("✓ Added username column to user_games table")
except Exception as e:
    print(f"Error: {e}")
finally:
    engine.dispose()
