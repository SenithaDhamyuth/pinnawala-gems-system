from __future__ import annotations

from fastapi import HTTPException, status

from app.services.user_service import get_user_by_email, to_public_user
from app.utils.security import create_access_token, verify_password


async def login_user(email: str, password: str) -> dict:
    user = await get_user_by_email(email)
    if user is None or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user["role"] == "seller" and not user.get("is_verified_seller"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified sellers can access inventory management.",
        )

    return {
        "access_token": create_access_token(user["id"], user["role"]),
        "token_type": "bearer",
        "user": to_public_user(user),
    }
