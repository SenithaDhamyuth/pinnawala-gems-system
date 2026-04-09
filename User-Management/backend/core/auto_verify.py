import re
from core.database import db
from datetime import datetime

def normalize_identifier(value: str):
    if value is None:
        return ""
    return re.sub(r"\s+", "", str(value)).upper()


def verify_government_license(ngja_license: str, brc_number: str):
    """Check the NGJA license and BRC number against government_records and return verification status."""

    ngja_license = normalize_identifier(ngja_license)
    brc_number = normalize_identifier(brc_number)
    print(f"🔍 Checking NGJA license: {ngja_license} and BRC: {brc_number}")

    if not ngja_license or not brc_number:
        print("❌ Missing NGJA license or BRC number for government verification.")
        return {
            "is_verified": False,
            "message": "You're not verified seller. Please register with the government to become a verified seller.",
        }

    license_regex = rf"^\s*{re.escape(ngja_license)}\s*$"
    brc_regex = rf"^\s*{re.escape(brc_number)}\s*$"

    gov_record = db["government_records"].find_one({
        "ngja_license": {"$regex": license_regex, "$options": "i"},
        "brc": {"$regex": brc_regex, "$options": "i"},
        "is_valid": {"$in": [True, "true", "True"]}
    })

    if gov_record:
        print(f"✅ Government record found for NGJA license and BRC: {ngja_license}, {brc_number}")
        return {
            "is_verified": True,
            "message": "You're verified seller",
            "verified_at": datetime.utcnow(),
            "gov_record": gov_record,
        }

    print(f"❌ Government record not found for NGJA license and BRC: {ngja_license}, {brc_number}")
    return {
        "is_verified": False,
        "message": "You're not verified seller. Please register with the government to become a verified seller.",
    }