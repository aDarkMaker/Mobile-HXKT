from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field  # pyright: ignore[reportMissingImports]


# ---------- 用户 ----------
class UserBase(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    nickname: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserProfile(UserBase):
    avatar: Optional[str] = None
    qq: Optional[str] = None

    class Config:
        from_attributes = True


class UserPublic(UserProfile):
    id: int
    created_at: datetime


class UserProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    qq: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


# ---------- Token ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: str


# ---------- 任务 ----------
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    type: str = Field("personal", pattern="^(personal|team)$")
    priority: int = Field(2, ge=1, le=4)
    max_accept_count: int = Field(1, ge=1, le=100)
    deadline: Optional[datetime] = None
    tags: List[str] = []


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[int] = Field(None, ge=1, le=4)
    max_accept_count: Optional[int] = Field(None, ge=1, le=100)
    deadline: Optional[datetime] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = Field(None, pattern="^(available|inProgress|completed)$")


class TaskResponse(TaskBase):
    id: int
    publisher_id: int
    publisher_name: str
    status: str
    accepted_count: int
    created_at: datetime
    is_accepted: bool = False

    class Config:
        from_attributes = True


class TaskAcceptanceResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    status: str
    accepted_at: datetime

    class Config:
        from_attributes = True

