from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    is_teacher: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ClassBase(BaseModel):
    class_name: str
    university_name: str

class JoinClassRequest(BaseModel):
    invite_code: str

class TaskUpdate(BaseModel):
    task_description: str
    task_language: str

class CodeExecutionRequest(BaseModel):
    code: str