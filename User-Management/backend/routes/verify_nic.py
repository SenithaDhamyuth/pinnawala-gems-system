import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from core.database import db
from core.nic_validator import validate_nic_text
from core.ocr_service import extract_text_from_file

router = APIRouter(tags=["NIC Verification"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024
UPLOAD_DIR = Path("backend") / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _get_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


async def _save_upload(file: UploadFile) -> Path:
    ext = _get_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PNG, JPG, JPEG, and PDF files are accepted.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="Uploaded file exceeds the 5MB size limit.")

    upload_path = UPLOAD_DIR / f"nic_upload_{uuid4().hex}{ext}"
    with open(upload_path, "wb") as out_file:
        out_file.write(contents)

    return upload_path


@router.post("/verify-nic")
async def verify_nic(file: UploadFile = File(...), seller_email: str = Form(None)):
    upload_path = await _save_upload(file)
    try:
        extracted_text = extract_text_from_file(str(upload_path))
        result = validate_nic_text(extracted_text)

        verification_record = {
            "seller_email": seller_email,
            "file_name": file.filename,
            "is_valid": result["is_valid"],
            "nic_number": result["nic_number"],
            "raw_text": result["raw_text"],
        }

        db["nic_verifications"].insert_one(verification_record)

        if not result["is_valid"]:
            message = "No NIC number detected. Please upload a clear image of your NIC."
        else:
            message = "NIC verified successfully."

        return JSONResponse(
            status_code=200,
            content={
                "valid": result["is_valid"],
                "message": message,
                "nic": result["nic_number"],
                "extracted_text": result["raw_text"],  # For debugging
            },
        )
    finally:
        try:
            upload_path.unlink()
        except OSError:
            pass
