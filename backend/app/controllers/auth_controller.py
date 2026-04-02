from __future__ import annotations

from app.services.auth_service import login_user
from app.services.user_service import to_public_user


async def login(email: str, password: str) -> dict:
    return await login_user(email, password)


def get_authenticated_profile(current_user: dict) -> dict:
    return to_public_user(current_user)
