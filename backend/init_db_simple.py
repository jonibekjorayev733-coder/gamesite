#!/usr/bin/env python3
"""Test Neon database connection and initialize"""

import os
import sys
from datetime import datetime

# Set the database URL before importing
os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_t2xOIW7iejqA@ep-cold-unit-a1oxzhvi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

from database import SessionLocal, engine
import models
from auth import get_password_hash

def init():
    """Initialize database"""
    try:
        print("🔄 Testing database connection...")
        with engine.connect() as conn:
            result = conn.execute(__import__("sqlalchemy").text("SELECT 1"))
            print("✅ Database connection successful!")
        
        print("🔄 Creating tables...")
        models.Base.metadata.create_all(bind=engine)
        print("✅ Tables created/verified")
        
        db = SessionLocal()
        try:
            # Delete existing users
            db.query(models.User).delete()
            db.commit()
            print("✅ Cleared existing users")
            
            # Create test users
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
            print("\n✅ Database initialized successfully!")
            print("📊 Test users created and ready to use")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    init()
