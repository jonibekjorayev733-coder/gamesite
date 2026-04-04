"""
Simple script to create a test user in SQLite database
"""
import os
import sys

# Set SQLite database explicitly
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Base, Teacher
from auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    # Delete all existing teachers
    db.query(Teacher).delete()
    db.commit()
    print("Existing teachers deleted")

    # Create admin teacher
    admin_teacher = Teacher(
        email="admin@example.com",
        username="admin",
        password_hash=get_password_hash("admin123"),
        full_name="Admin Teacher"
    )
    db.add(admin_teacher)
    db.commit()
    print("✅ Created teacher: admin@example.com / admin123")
    
    # Create test teacher
    test_teacher = Teacher(
        email="test@example.com",
        username="test",
        password_hash=get_password_hash("test123"),
        full_name="Test Teacher"
    )
    db.add(test_teacher)
    db.commit()
    print("✅ Created teacher: test@example.com / test123")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
