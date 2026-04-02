from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING

from app.config.settings import get_settings


settings = get_settings()
client = AsyncIOMotorClient(settings.mongo_url)
database = client[settings.mongo_db_name]

users_collection = database.get_collection("users")
inventory_collection = database.get_collection("inventory")
activity_logs_collection = database.get_collection("activity_logs")

# Legacy collections kept for the existing marketplace flows.
gem_collection = database.get_collection("gemstones")
offer_collection = database.get_collection("offers")


def get_database() -> AsyncIOMotorDatabase:
    return database


async def init_indexes() -> None:
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index([("role", ASCENDING), ("is_verified_seller", ASCENDING)])

    await inventory_collection.create_index("seller_id")
    await inventory_collection.create_index("seller_name")
    await inventory_collection.create_index("gem_name")
    await inventory_collection.create_index("category")
    await inventory_collection.create_index("status")
    await inventory_collection.create_index("listing_type")
    await inventory_collection.create_index("price")
    await inventory_collection.create_index("stock_quantity")
    await inventory_collection.create_index([("seller_id", ASCENDING), ("created_at", ASCENDING)])
    await inventory_collection.create_index([("status", ASCENDING), ("is_archived", ASCENDING)])

    await activity_logs_collection.create_index([("inventory_id", ASCENDING), ("created_at", ASCENDING)])
