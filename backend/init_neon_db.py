#!/usr/bin/env python3
"""Initialize Neon PostgreSQL database with schema and seed data"""

from database import SessionLocal, engine
import models
from auth import get_password_hash
from datetime import datetime
import sys

def init_db():
    """Create all tables"""
    print("🔄 Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Tables created")

def seed_test_users():
    """Seed database with test users"""
    db = SessionLocal()
    try:
        # Clear existing users
        db.query(models.User).delete()
        db.commit()
        
        # Test users with email and full_name
        test_users = [
            {"username": "admin", "email": "admin@example.com", "full_name": "Admin User", "password": "admin123"},
            {"username": "test", "email": "test@example.com", "full_name": "Test User", "password": "test123"},
            {"username": "user", "email": "user@example.com", "full_name": "Regular User", "password": "user123"}
        ]
        
        print("\n🔄 Seeding test users...")
        for user_data in test_users:
            user = models.User(
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                password_hash=get_password_hash(user_data["password"]),
                created_at=datetime.now()
            )
            db.add(user)
            print(f"  ✅ {user_data['username']} ({user_data['email']})")
        
        db.commit()
        print("\n✅ Test users seeded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error seeding users: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    try:
        init_db()
        success = seed_test_users()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
