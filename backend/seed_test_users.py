#!/usr/bin/env python3
"""Seed database with test users and sample tests"""

import sys
import os

from sqlalchemy.orm import Session
from datetime import datetime

from database import SessionLocal, engine
import models
from auth import get_password_hash

# Create tables
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Clear existing users
    db.query(models.User).delete()
    db.commit()
    
    # Test users with email and full_name
    test_users = [
        {
            "username": "admin",
            "email": "admin@example.com",
            "full_name": "Admin User",
            "password": "admin123"
        },
        {
            "username": "test",
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "test123"
        },
        {
            "username": "user",
            "email": "user@example.com",
            "full_name": "Regular User",
            "password": "user123"
        }
    ]
    
    for user_data in test_users:
        user = models.User(
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            password_hash=get_password_hash(user_data["password"]),
            created_at=datetime.now()
        )
        db.add(user)
        print(f"Created user: {user_data['username']} / {user_data['email']}")
    
    db.commit()
    print("\n✅ Test users created successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
