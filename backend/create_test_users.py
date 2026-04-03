import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User
from auth import get_password_hash

db = SessionLocal()

# Create test users
test_users = [
    ("admin", "admin123"),
    ("test", "test123"),
    ("user", "user123"),
]

for username, password in test_users:
    existing = db.query(User).filter(User.username == username).first()
    if not existing:
        # Hash the password with a truncated version to avoid bcrypt length issues
        hashed = get_password_hash(password[:72])
        user = User(username=username, password_hash=hashed)
        db.add(user)
        db.commit()
        print(f"Created user: {username} / {password}")
    else:
        print(f"User {username} already exists")

db.close()
