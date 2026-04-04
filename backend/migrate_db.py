"""
Users jadvalini to'g'rilash: password_hash ustunini qo'shadi yoki jadvalni qayta yaratadi.
Ishga tushirish: cd backend && python migrate_db.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT password_hash FROM users LIMIT 1"))
            conn.commit()
            print("Users jadvali to'g'ri - password_hash mavjud.")
        except Exception:
            conn.rollback()
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
                conn.commit()
                print("Users jadvaliga password_hash ustuni qo'shildi.")
            except Exception as e2:
                conn.rollback()
                print(f"Xato: {e2}")
                print("Users jadvalini qayta yarating: DROP TABLE IF EXISTS users;")
                print("Keyin: python -c \"from database import Base, engine; from models import User; Base.metadata.create_all(bind=engine)\"")

if __name__ == "__main__":
    migrate()
