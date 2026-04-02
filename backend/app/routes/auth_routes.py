from fastapi import APIRouter, Depends
from app.schemas.auth_schemas import LoginRequest
from app.services.auth_service import authenticate_user, generate_token
from app.middleware.auth_middleware import get_current_user
from fastapi import HTTPException

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return generate_token(user)

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user.get("user_id"),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "is_verified_seller": current_user.get("is_verified_seller", False),
    }
