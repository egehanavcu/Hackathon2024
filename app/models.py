import uuid
from sqlalchemy import Table, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

student_class_association = Table(
    "student_class_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("class_id", Integer, ForeignKey("classes.id"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    is_teacher = Column(Boolean, default=False)
    socket_key = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    
    student_tasks = relationship("StudentTask", back_populates="user")
    classes = relationship("Class", secondary=student_class_association, back_populates="students")


class StudentTask(Base):
    __tablename__ = "student_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    code = Column(String, default="")
    code_summary = Column(String, default="")
    completion_percentage = Column(Integer, default=0)

    user = relationship("User", back_populates="student_tasks")
    class_ref = relationship("Class", back_populates="student_tasks")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_name = Column(String, index=True)
    university_name = Column(String, index=True)
    invite_code = Column(String, unique=True, index=True)
    task_description = Column(String, default="")
    task_language = Column(String, default="")

    students = relationship("User", secondary=student_class_association, back_populates="classes")
    teacher = relationship("User", back_populates="classes_taught")
    student_tasks = relationship("StudentTask", back_populates="class_ref")

User.classes_taught = relationship("Class", back_populates="teacher")