import hashlib
from database import SessionLocal
from models import Teacher

def hash_password(password: str) -> str:
    """SHA256 bilan password hash qilish"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

db = SessionLocal()

# Update teacher1
teacher1_hash = hash_password("password123")
teacher1 = db.query(Teacher).filter(Teacher.email == "teacher@example.com").first()
if teacher1:
    teacher1.password_hash = teacher1_hash
    db.commit()
    print(f"✓ teacher@example.com hash updated: {teacher1_hash}")

# Update admin
admin_hash = hash_password("admin123")
admin = db.query(Teacher).filter(Teacher.email == "admin@teacher.com").first()
if admin:
    admin.password_hash = admin_hash
    db.commit()
    print(f"✓ admin@teacher.com hash updated: {admin_hash}")

# Verify
print("\nVerify:")
teachers = db.query(Teacher).all()
for t in teachers:
    print(f"  {t.email}: {t.password_hash}")

db.close()
