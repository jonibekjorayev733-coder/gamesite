import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Use PostgreSQL (Neon) or in-memory SQLite for Render
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    None
)

# Agar DATABASE_URL bo'lmasa in-memory SQLite ishlatamiz (Render uchun)
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///:memory:"
    print("Using in-memory SQLite database")
else:
    print(f"Using DATABASE_URL: {DATABASE_URL[:50]}...")

# Create engine based on database type
try:
    if "postgresql" in DATABASE_URL:
        from sqlalchemy.pool import NullPool
        engine = create_engine(
            DATABASE_URL,
            poolclass=NullPool,  # Neon pooler'dan foydalanish uchun
            connect_args={
                "connect_timeout": 5,
            }
        )
    else:
        engine = create_engine(
            DATABASE_URL, 
            connect_args={"check_same_thread": False}
        )
except Exception as e:
    print(f"Database engine error: {e}")
    # Fallback to in-memory SQLite
    print("Falling back to in-memory SQLite")
    DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()



def get_db():
    """Dependency for FastAPI to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
