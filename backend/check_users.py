from database import SessionLocal
from models import User

db = SessionLocal()
users = db.query(User).all()
print(f"Total users: {len(users)}")
for u in users:
    print(f"ID: {u.id}, Username: {u.username}, Password Hash: {u.password_hash[:30] if u.password_hash else 'None'}...")
db.close()
