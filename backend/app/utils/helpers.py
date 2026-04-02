from bson import ObjectId
from datetime import datetime, timezone

def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document _id to string id."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def get_utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def is_valid_object_id(id_str: str) -> bool:
    try:
        ObjectId(id_str)
        return True
    except Exception:
        return False
