from typing import Literal
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------------- USER ----------------

class UserCreate(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["student", "mentor","admin"] = "student"


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    model_config = {"from_attributes": True}


# ---------------- AUTH ----------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------- SKILL ----------------

class SkillCreate(BaseModel):
    title: str = Field(min_length=2)
    description: str | None = None
    category: str | None = None


class SkillOut(BaseModel):
    id: int
    title: str
    description: str | None
    category: str | None
    mentor_id: int

    model_config = {"from_attributes": True}


# ---------------- BOOKING ----------------

class BookingCreate(BaseModel):
    skill_id: int
    mentor_id: int
    scheduled_at: datetime


class BookingOut(BaseModel):
    id: int
    skill_id: int
    student_id: int
    mentor_id: int
    scheduled_at: datetime
    status: str

    model_config = {"from_attributes": True}


# ---------------- REVIEW ----------------

class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewOut(BaseModel):
    id: int
    booking_id: int
    student_id: int
    rating: int
    comment: str | None

    model_config = {"from_attributes": True}
class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


class ChatResponse(BaseModel):
    response: str
class AIChatRequest(BaseModel):
    message: str = Field(min_length=1)
