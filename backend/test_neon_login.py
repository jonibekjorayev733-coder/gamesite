#!/usr/bin/env python3
"""Test login with Neon database"""

import os
import requests

# Set environment
os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_t2xOIW7iejqA@ep-cold-unit-a1oxzhvi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

from database import SessionLocal
import models

print("🔄 Checking database for test users...\n")

db = SessionLocal()
try:
    users = db.query(models.User).all()
    
    if not users:
        print("❌ No users found in database")
    else:
        print(f"✅ Found {len(users)} users in Neon database:\n")
        for user in users:
            print(f"  📧 Email: {user.email}")
            print(f"     Username: {user.username}")
            print(f"     Full Name: {user.full_name}")
            print(f"     Created: {user.created_at}\n")
    
    # Test login API
    print("\n🔄 Testing login API...")
    response = requests.post(
        "http://localhost:8000/login",
        json={"username": "admin@example.com", "password": "admin123"},
        timeout=5
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful!")
        print(f"   Access Token: {data['access_token'][:50]}...")
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
