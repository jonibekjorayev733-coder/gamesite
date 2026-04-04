"""Seed test teacher accounts"""

import os
import sys
import hashlib

# Force SQLite for seeding
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from database import SessionLocal
from models import Teacher

def hash_password(password: str) -> str:
    """Simple SHA256 hash for seeding"""
    return hashlib.sha256(password.encode()).hexdigest()

def seed_teachers():
    db = SessionLocal()
    try:
        # Clear existing teachers for fresh start
        db.query(Teacher).delete()
        db.commit()
        print("✓ Cleared existing teachers")
        
        # Create test teachers
        teachers_data = [
            {
                "username": "teacher1",
                "email": "teacher1@example.com",
                "password": "password123",
                "full_name": "Teacher One"
            },
            {
                "username": "teacher2",
                "email": "teacher2@example.com",
                "password": "password123",
                "full_name": "Teacher Two"
            },
            {
                "username": "admin",
                "email": "admin@example.com",
                "password": "admin123",
                "full_name": "Admin Teacher"
            }
        ]
        
        for teacher_info in teachers_data:
            teacher = Teacher(
                username=teacher_info["username"],
                email=teacher_info["email"],
                password_hash=hash_password(teacher_info["password"]),
                full_name=teacher_info["full_name"]
            )
            db.add(teacher)
            print(f"✓ Created teacher: {teacher_info['email']}")
        
        db.commit()
        print("\n✅ Teachers seeded successfully!")
        print("\nTest credentials:")
        for t in teachers_data:
            print(f"  Username: {t['username']}")
            print(f"  Email: {t['email']}")
            print(f"  Password: {t['password']}")
            print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_teachers()
