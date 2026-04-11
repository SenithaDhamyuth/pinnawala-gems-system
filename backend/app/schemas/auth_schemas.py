from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    is_verified_seller: bool
