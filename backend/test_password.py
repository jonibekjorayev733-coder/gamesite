import sys
sys.path.insert(0, '.')
from auth import get_password_hash, verify_password
from database import SessionLocal
from models import User

# Test password hashing
password = "admin123"
hashed = get_password_hash(password)
print(f"Password: {password}")
print(f"Hashed: {hashed}")
print(f"Verify: {verify_password(password, hashed)}")

# Check if user exists in DB
db = SessionLocal()
user = db.query(User).filter(User.username == "admin").first()
if user:
    print(f"\nUser found: {user.username}")
    print(f"User hash: {user.password_hash}")
    print(f"Verify against DB hash: {verify_password(password, user.password_hash)}")
else:
    print("\nNo user found")
db.close()
