from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=True, index=True)
    full_name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now)


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(64), nullable=False)  # SHA256 hash (64 hex chars)
    full_name = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    custom_tests = relationship("CustomTest", back_populates="teacher")


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )  # wheel, tug_of_war, word_search, country, champion, quiz, millionaire, memory, math, word

    sections = relationship("Section", back_populates="game", order_by="Section.order")


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    name = Column(String(200), nullable=False)
    order = Column(Integer, default=0, nullable=False)

    game = relationship("Game", back_populates="sections")
    tests = relationship("Test", back_populates="section", order_by="Test.id")


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True)
    game_key = Column(String(50), nullable=True, index=True)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # JSON array of 4 strings
    correct_index = Column(Integer, nullable=False)  # 0-3
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(20), default="medium")

    section = relationship("Section", back_populates="tests")


class CustomTest(Base):
    __tablename__ = "custom_tests"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    game_slug = Column(String(50), nullable=False, index=True)
    question = Column(Text, nullable=False)  # Title for new format
    options = Column(JSON, nullable=True)  # JSON array of 4 strings (optional)
    correct_index = Column(Integer, nullable=True)  # 0-3 (optional)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(20), default="medium")
    test_data = Column(JSON, nullable=True)  # Full test structure: {title, description, questions[]}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    teacher = relationship("Teacher", back_populates="custom_tests")


# -------------------------------------------------------------------
# Dashboard auth + tests + results (FastAPI + SQLAlchemy + JWT)
# -------------------------------------------------------------------
class AuthAccount(Base):
    __tablename__ = "auth_accounts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user", index=True)  # user | teacher
    full_name = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    teacher_tests = relationship("TeacherTest", back_populates="teacher", foreign_keys="TeacherTest.teacher_id")
    user_results = relationship("TestResult", back_populates="user", foreign_keys="TestResult.user_id")


class TeacherTest(Base):
    __tablename__ = "teacher_tests"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("auth_accounts.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    questions = Column(JSON, nullable=False)  # [{text, options[4], correctIndex, explanation}]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    teacher = relationship("AuthAccount", back_populates="teacher_tests", foreign_keys=[teacher_id])
    results = relationship("TestResult", back_populates="test", foreign_keys="TestResult.test_id")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("auth_accounts.id"), nullable=False, index=True)
    test_id = Column(Integer, ForeignKey("teacher_tests.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False, default=0)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("AuthAccount", back_populates="user_results", foreign_keys=[user_id])
    test = relationship("TeacherTest", back_populates="results", foreign_keys=[test_id])


class UserGame(Base):
    """Track user game sessions and scores"""
    __tablename__ = "user_games"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    username = Column(String(100), nullable=True, index=True)  # Username for easy lookup
    game_slug = Column(String(50), nullable=False, index=True)  # e.g., "wheel", "tug_of_war"
    email = Column(String(100), nullable=True)  # Store email for easy lookup
    score = Column(Integer, default=0)
    mode = Column(String(20), default="single")  # "single" or "team"
    team1_score = Column(Integer, default=0)
    team2_score = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    game_data = Column(JSON, nullable=True)  # Store game metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")

