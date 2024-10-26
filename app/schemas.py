from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    is_teacher: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str