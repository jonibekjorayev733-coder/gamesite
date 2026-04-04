from database import SessionLocal
from models import Teacher
from auth import verify_password, get_password_hash

db = SessionLocal()

# Get teacher
teacher = db.query(Teacher).filter(Teacher.email == 'admin@example.com').first()
print(f"Teacher found: {teacher}")
print(f"Email: {teacher.email if teacher else 'N/A'}")
print(f"Password hash: {teacher.password_hash if teacher else 'N/A'}")

if teacher:
    # Test password verification
    test_pass = "admin123"
    result = verify_password(test_pass, teacher.password_hash)
    print(f"\nPassword verification:")
    print(f"  Test password: {test_pass}")
    print(f"  Stored hash: {teacher.password_hash}")
    print(f"  Result: {result}")
    
    # Also test creating a new hash
    print(f"\nTesting hash creation:")
    new_hash = get_password_hash("admin123")
    print(f"  New hash: {new_hash}")
    print(f"  Verify new: {verify_password('admin123', new_hash)}")
