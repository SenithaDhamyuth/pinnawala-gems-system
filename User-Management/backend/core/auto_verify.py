from core.database import db
from datetime import datetime

def verify_government_license(ngja_license: str):
    """Check the NGJA license against government_records and return verification status."""

    ngja_license = ngja_license.strip() if isinstance(ngja_license, str) else str(ngja_license)
    print(f"🔍 Checking NGJA license: {ngja_license}")

    gov_record = db["government_records"].find_one({
        "ngja_license": ngja_license,
        "is_valid": {"$in": [True, "true", "True"]}
    })

    if gov_record:
        print(f"✅ Government record found for NGJA license: {ngja_license}")
        return {
            "is_verified": True,
            "message": "You're verified Seller",
            "verified_at": datetime.utcnow(),
            "gov_record": gov_record,
        }

    print(f"❌ Government record not found for NGJA license: {ngja_license}")
    return {
        "is_verified": False,
        "message": "You're not verified seller. Please register with the government to become verified.",
    }