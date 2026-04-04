import sys
sys.path.insert(0, '.')
from database import SessionLocal
from models import User
from auth import verify_password, create_access_token
from schemas import LoginRequest, Token

# Simulate the login endpoint
def test_login(username: str, password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        print(f"User found: {user}")
        
        if user:
            print(f"Verifying password...")
            is_valid = verify_password(password, user.password_hash)
            print(f"Password valid: {is_valid}")
            
            if is_valid:
                access_token = create_access_token(data={"sub": user.username})
                print(f"Token created: {access_token}")
                return Token(access_token=access_token)
            else:
                print("Password invalid")
        else:
            print("User not found")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

# Test
print("Testing login...")
result = test_login("admin", "admin123")
print(f"Result: {result}")
