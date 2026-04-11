from __future__ import annotations

from datetime import datetime, timezone

from app.config.settings import get_settings
from app.database.mongodb import inventory_collection, users_collection
from app.models.constants import (
    DEFAULT_LOW_STOCK_THRESHOLD,
    DEFAULT_STOCK_QUANTITY,
    LISTING_TYPE_VALUES,
)
from app.utils.mongo import serialize_document
from app.utils.security import hash_password


settings = get_settings()


def _normalize_cut(value: str) -> str:
    normalized = value.strip().lower()
    cut_aliases = {
        "oval mixed cut": "oval",
        "oval cut": "oval",
        "cushion cut": "cushion",
        "emerald cut": "emerald",
    }
    return cut_aliases.get(normalized, normalized)


def _normalize_origin(value: str) -> str:
    normalized = value.strip()
    origin_aliases = {
        "Ratnapura, Sri Lanka": "Ratnapura",
        "Elahera, Sri Lanka": "Elahera",
    }
    return origin_aliases.get(normalized, normalized)


DEMO_INVENTORY = [
    {
        "gem_name": "Royal Ceylon Blue Sapphire",
        "gem_type": "Blue Sapphire",
        "category": "Sapphire",
        "color": "Royal Blue",
        "carat": 3.25,
        "cut": "oval",
        "origin": "Ratnapura",
        "price": 4850.0,
        "description": "Certified vivid blue sapphire with strong transparency and premium luster.",
        "listing_type": "direct_sale",
        "stock_quantity": 2,
        "low_stock_threshold": 3,
        "images": [
            "https://images.unsplash.com/photo-1617038220319-bc0cb3f24d43?auto=format&fit=crop&w=900&q=80"
        ],
        "status": "active",
    },
    {
        "gem_name": "Sunrise Padparadscha",
        "gem_type": "Padparadscha Sapphire",
        "category": "Sapphire",
        "color": "Pink Orange",
        "carat": 2.4,
        "cut": "cushion",
        "origin": "Elahera",
        "price": 3920.0,
        "description": "Balanced peach tone gemstone prepared for private collector sale.",
        "listing_type": "auction",
        "stock_quantity": 6,
        "low_stock_threshold": 3,
        "images": [
            "https://images.unsplash.com/photo-1611329534420-6b17f4d8ec8d?auto=format&fit=crop&w=900&q=80"
        ],
        "status": "in_auction",
    },
    {
        "gem_name": "Velvet Ruby Parcel Stone",
        "gem_type": "Ruby",
        "category": "Ruby",
        "color": "Pigeon Blood Red",
        "carat": 1.8,
        "cut": "emerald",
        "origin": "Mogok, Myanmar",
        "price": 5280.0,
        "description": "High saturation ruby parcel listing retained for direct premium buyers.",
        "listing_type": "direct_sale",
        "stock_quantity": 0,
        "low_stock_threshold": 2,
        "images": [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80"
        ],
        "status": "sold",
    },
]


async def _upsert_demo_user(user_data: dict) -> dict:
    timestamp = datetime.now(timezone.utc)
    existing_user = await users_collection.find_one({"email": user_data["email"]})
    payload = {
        "name": user_data["name"],
        "email": user_data["email"].lower(),
        "password": hash_password(user_data["password"]),
        "role": user_data["role"],
        "is_verified_seller": user_data["is_verified_seller"],
        "updated_at": timestamp,
    }

    if existing_user:
        await users_collection.update_one({"_id": existing_user["_id"]}, {"$set": payload})
    else:
        payload["created_at"] = timestamp
        await users_collection.insert_one(payload)

    refreshed_user = await users_collection.find_one({"email": user_data["email"].lower()})
    return serialize_document(refreshed_user)


async def _seed_inventory_for_seller(seller: dict, reset_inventory: bool = False) -> int:
    if reset_inventory:
        await inventory_collection.delete_many({"seller_id": seller["id"]})

    existing_count = await inventory_collection.count_documents({"seller_id": seller["id"]})
    if existing_count > 0:
        return existing_count

    timestamp = datetime.now(timezone.utc)
    demo_records = []
    for record in DEMO_INVENTORY:
        is_archived = record["status"] == "archived"
        demo_records.append(
            {
                **record,
                "seller_id": seller["id"],
                "seller_name": seller["name"],
                "is_archived": is_archived,
                "created_at": timestamp,
                "updated_at": timestamp,
            }
        )

    if demo_records:
        await inventory_collection.insert_many(demo_records)

    return len(demo_records)


async def normalize_inventory_records() -> dict:
    timestamp = datetime.now(timezone.utc)
    allowed_listing_types = list(LISTING_TYPE_VALUES)

    invalid_listing_type_result = await inventory_collection.update_many(
        {"listing_type": {"$nin": allowed_listing_types}},
        {"$set": {"listing_type": "direct_sale", "updated_at": timestamp}},
    )
    auction_listing_result = await inventory_collection.update_many(
        {"status": "in_auction", "listing_type": {"$ne": "auction"}},
        {"$set": {"listing_type": "auction", "updated_at": timestamp}},
    )
    archived_flag_result = await inventory_collection.update_many(
        {"status": "archived", "is_archived": {"$ne": True}},
        {"$set": {"is_archived": True, "updated_at": timestamp}},
    )
    active_flag_result = await inventory_collection.update_many(
        {"status": {"$ne": "archived"}, "is_archived": {"$ne": False}},
        {"$set": {"is_archived": False, "updated_at": timestamp}},
    )
    default_stock_result = await inventory_collection.update_many(
        {"stock_quantity": {"$exists": False}},
        {"$set": {"stock_quantity": DEFAULT_STOCK_QUANTITY, "updated_at": timestamp}},
    )
    default_low_stock_threshold_result = await inventory_collection.update_many(
        {"low_stock_threshold": {"$exists": False}},
        {"$set": {"low_stock_threshold": DEFAULT_LOW_STOCK_THRESHOLD, "updated_at": timestamp}},
    )

    cut_updates = 0
    origin_updates = 0
    async for document in inventory_collection.find({}, {"_id": 1, "cut": 1, "origin": 1}):
        updates = {}
        current_cut = document.get("cut")
        current_origin = document.get("origin")

        if isinstance(current_cut, str):
            normalized_cut = _normalize_cut(current_cut)
            if normalized_cut != current_cut:
                updates["cut"] = normalized_cut
                cut_updates += 1

        if isinstance(current_origin, str):
            normalized_origin = _normalize_origin(current_origin)
            if normalized_origin != current_origin:
                updates["origin"] = normalized_origin
                origin_updates += 1

        if updates:
            updates["updated_at"] = timestamp
            await inventory_collection.update_one({"_id": document["_id"]}, {"$set": updates})

    return {
        "invalid_listing_types_fixed": invalid_listing_type_result.modified_count,
        "auction_listings_fixed": auction_listing_result.modified_count,
        "archived_flags_fixed": archived_flag_result.modified_count,
        "active_flags_fixed": active_flag_result.modified_count,
        "default_stock_quantity_fixed": default_stock_result.modified_count,
        "default_low_stock_threshold_fixed": default_low_stock_threshold_result.modified_count,
        "cut_values_fixed": cut_updates,
        "origin_values_fixed": origin_updates,
    }


async def ensure_demo_seed_data(reset_inventory: bool = False) -> dict:
    seeded_users = {}
    for user in settings.demo_users:
        seeded_user = await _upsert_demo_user(user)
        seeded_users[seeded_user["role"]] = seeded_user

    seller = seeded_users["seller"]
    seeded_inventory_count = await _seed_inventory_for_seller(seller, reset_inventory=reset_inventory)

    return {
        "users": seeded_users,
        "seeded_inventory_count": seeded_inventory_count,
    }
