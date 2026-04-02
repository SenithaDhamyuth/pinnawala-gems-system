from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


RoleType = Literal["admin", "seller"]


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: RoleType
    is_verified_seller: bool
    created_at: datetime
    updated_at: datetime
