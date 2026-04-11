from __future__ import annotations

from app.database.mongodb import users_collection
from app.utils.mongo import parse_object_id, serialize_document


def to_public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "is_verified_seller": user.get("is_verified_seller", False),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"],
    }


async def get_user_by_email(email: str) -> dict | None:
    document = await users_collection.find_one({"email": email.lower()})
    return serialize_document(document)


async def get_user_by_id(user_id: str) -> dict | None:
    document = await users_collection.find_one({"_id": parse_object_id(user_id, "user id")})
    return serialize_document(document)


async def count_verified_sellers() -> int:
    return await users_collection.count_documents(
        {"role": "seller", "is_verified_seller": True}
    )
