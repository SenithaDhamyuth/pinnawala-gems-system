from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "pinnawala_secret_key_2026"
ALGORITHM  = "HS256"

def create_token(email: str, role: str):
    data = {
        "email": email,
        "role":  role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])