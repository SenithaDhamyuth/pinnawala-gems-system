from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "pinnawala_secret_key_2026"
ALGORITHM  = "HS256"

security = HTTPBearer()

def create_token(email: str, role: str):
    data = {
        "email": email,
        "role":  role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    payload = decode_token(token)
    return payload