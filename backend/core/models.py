from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import relationship  # pyright: ignore[reportMissingImports]
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(100))
    avatar = Column(String(255))
    qq = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

    tasks = relationship("Task", back_populates="publisher", cascade="all, delete-orphan")
    task_acceptances = relationship("TaskAcceptance", back_populates="user", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String(20), default="personal")  # personal/team
    priority = Column(Integer, default=2)
    max_accept_count = Column(Integer, default=1)
    deadline = Column(DateTime)
    tags = Column(String(255))
    status = Column(String(20), default="available")
    publisher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    publisher = relationship("User", back_populates="tasks")
    acceptances = relationship("TaskAcceptance", back_populates="task", cascade="all, delete-orphan")


class TaskAcceptance(Base):
    __tablename__ = "task_acceptances"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(20), default="inProgress")
    accepted_at = Column(DateTime, server_default=func.now())

    task = relationship("Task", back_populates="acceptances")
    user = relationship("User", back_populates="task_acceptances")