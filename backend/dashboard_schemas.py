from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


RoleType = Literal["user", "teacher"]


class AccountOut(BaseModel):
    id: int
    email: str
    fullName: Optional[str] = None
    role: RoleType

    class Config:
        from_attributes = True


class TokenUserResponse(BaseModel):
    accessToken: str
    user: AccountOut


class TokenTeacherResponse(BaseModel):
    accessToken: str
    teacher: AccountOut


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    fullName: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(..., min_length=6)


class TestQuestionIn(BaseModel):
    text: str = Field(..., min_length=1)
    options: List[str] = Field(..., min_length=4, max_length=4)
    correctIndex: int = Field(..., ge=0, le=3)
    explanation: Optional[str] = ""


class CreateTestRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = ""
    questions: List[TestQuestionIn] = Field(..., min_length=1)


class TeacherTestOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    questions: list
    createdAt: datetime


class ResultSubmitRequest(BaseModel):
    testId: int
    score: int = Field(..., ge=0)
    meta: Optional[dict] = {}

