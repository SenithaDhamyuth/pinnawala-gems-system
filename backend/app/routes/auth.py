from __future__ import annotations

from fastapi import APIRouter, Depends

from app.controllers import auth_controller
from app.middleware.auth import get_current_user
from app.schemas.auth import AuthResponse, LoginRequest
from app.schemas.user import UserPublic


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> dict:
    return await auth_controller.login(payload.email, payload.password)


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: dict = Depends(get_current_user)) -> dict:
    return auth_controller.get_authenticated_profile(current_user)
