from pydantic import BaseModel, EmailStr
from typing import List

class UserRegister(BaseModel):
    full_name: str
    email:     EmailStr
    password:  str
    phone:     str
    role:      str

class UserLogin(BaseModel):
    email:    EmailStr
    password: str