from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from passlib.context import CryptContext
from core.database import users_collection
from core.jwt_handler import create_token
from models.user import UserRegister, UserLogin
import shutil, os

router = APIRouter()
pwd    = CryptContext(schemes=["bcrypt"])

@router.post("/register")
def register(user: UserRegister):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered!")
    new_user = {
        "full_name":  user.full_name,
        "email":      user.email,
        "password":   pwd.hash(user.password),
        "phone":      user.phone,
        "role":       user.role,
        "kyc_status": "not_required" if user.role == "buyer" else "pending",
        "is_active":  True,
        "is_banned":  False,
    }
    users_collection.insert_one(new_user)
    return {"message": "Account created successfully!"}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not pwd.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Wrong email or password!")
    if db_user.get("is_banned"):
        raise HTTPException(status_code=403, detail="Your account has been banned.")
    token = create_token(db_user["email"], db_user["role"])
    return {
        "token": token,
        "role":  db_user["role"],
        "name":  db_user["full_name"],
    }

@router.post("/seller/upload-kyc")
async def upload_kyc(
    email:        str        = Form(...),
    nic_number:   str        = Form(...),
    shop_name:    str        = Form(...),
    nic_front:    UploadFile = File(...),
    ngja_license: UploadFile = File(...),
):
    folder = f"kyc_uploads/{email.replace('@','_')}"
    os.makedirs(folder, exist_ok=True)
    for uploaded_file in [nic_front, ngja_license]:
        save_path = f"{folder}/{uploaded_file.filename}"
        with open(save_path, "wb") as f:
            shutil.copyfileobj(uploaded_file.file, f)
    users_collection.update_one(
        {"email": email},
        {"$set": {
            "nic_number":  nic_number,
            "shop_name":   shop_name,
            "kyc_status":  "under_review",
        }}
    )
    return {"message": "KYC submitted! Admin will review in 48 hours."}

@router.get("/admin/pending-kyc")
def get_pending_kyc():
    sellers = list(users_collection.find(
        {"role": "seller", "kyc_status": "under_review"},
        {"_id": 0, "password": 0}
    ))
    return sellers

@router.put("/admin/kyc/{email}/{action}")
def update_kyc_status(email: str, action: str):
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be approve or reject")
    new_status = "approved" if action == "approve" else "rejected"
    users_collection.update_one({"email": email}, {"$set": {"kyc_status": new_status}})
    return {"message": f"KYC {new_status} for {email}"}

@router.put("/admin/ban/{email}")
def ban_user(email: str):
    users_collection.update_one({"email": email}, {"$set": {"is_banned": True}})
    return {"message": f"User {email} has been banned."}

@router.get("/admin/users")
def get_all_users():
    users = list(users_collection.find({}, {"_id": 0, "password": 0}))
    return users