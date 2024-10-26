from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_teacher = Column(Boolean, default=False)
    
    student_tasks = relationship("StudentTask", back_populates="user")


class StudentTask(Base):
    __tablename__ = "student_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String, default="")
    code_summary = Column(String, default="")
    completion_percentage = Column(Integer, default=0)

    user = relationship("User", back_populates="student_tasks")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, index=True)
    university_name = Column(String, index=True)
    invite_code = Column(String, unique=True, index=True)
    task_description = Column(String, default="")
    task_language = Column(String, default="")