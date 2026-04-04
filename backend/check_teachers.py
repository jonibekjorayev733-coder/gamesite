#!/usr/bin/env python
from database import SessionLocal, engine, Base
from models import Teacher
import sys

# Create tables
Base.metadata.create_all(bind=engine)

# Check teachers
db = SessionLocal()
try:
    teachers = db.query(Teacher).all()
    print(f"Total teachers: {len(teachers)}")
    print("\nTeachers in database:")
    for t in teachers:
        print(f"  - ID: {t.id}, Username: {t.username}, Email: {t.email}, Full Name: {t.full_name}")
    
    # Also print SQL query for reference
    print("\n\nSQL Query to run on your database:")
    print("SELECT id, username, email, full_name, is_active FROM teachers;")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
