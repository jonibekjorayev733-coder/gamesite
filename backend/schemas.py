from pydantic import BaseModel, Field
from typing import List


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str


class UserBase(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class GameBase(BaseModel):
    name: str
    slug: str


class GameResponse(GameBase):
    id: int

    class Config:
        from_attributes = True


class SectionBase(BaseModel):
    name: str
    order: int = 0


class SectionCreate(SectionBase):
    game_id: int


class SectionResponse(SectionBase):
    id: int
    game_id: int

    class Config:
        from_attributes = True


class TestBase(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_index: int = Field(..., ge=0, le=3)


class TestCreate(TestBase):
    section_id: int


class TestResponse(TestBase):
    id: int
    section_id: int

    class Config:
        from_attributes = True


# V5 Game Tests (Consolidated)
class GameQuestionCreate(BaseModel):
    prompt: str
    options: List[dict]  # List of {"text": "..."}
    correct_index: int
    explanation: str = "Correct"
    difficulty: str = "medium"

class GameTestSetCreate(BaseModel):
    game_key: str
    title: str
    questions: List[GameQuestionCreate]

class GameQuestionOut(BaseModel):
    id: int
    prompt: str
    options: List[dict]
    correct_index: int
    explanation: str
    difficulty: str
