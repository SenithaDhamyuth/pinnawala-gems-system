from __future__ import annotations

import re
from datetime import datetime, timezone

from fastapi import HTTPException, status
from pymongo import DESCENDING, ReturnDocument

from app.database.mongodb import inventory_collection
from app.models.constants import DEFAULT_LOW_STOCK_THRESHOLD, DEFAULT_STOCK_QUANTITY
from app.services.log_service import log_inventory_action
from app.utils.mongo import parse_object_id, serialize_document


SEARCHABLE_FIELDS = ("gem_name", "gem_type", "category", "color", "origin", "description")
LOW_STOCK_EXCLUDED_STATUSES = {"archived", "sold"}


def _normalize_text(value: str) -> str:
    return value.strip()


def _normalize_images(images: list[str] | None) -> list[str]:
    if not images:
        return []
    return [image.strip() for image in images if image and image.strip()]


def normalize_inventory_payload(payload: dict) -> dict:
    normalized = {**payload}
    text_fields = ("gem_name", "gem_type", "category", "color", "cut", "origin", "description")

    for field in text_fields:
        if field in normalized and normalized[field] is not None:
            normalized[field] = _normalize_text(normalized[field])

    if "images" in normalized:
        normalized["images"] = _normalize_images(normalized["images"])

    if "status" in normalized and normalized["status"] is not None:
        normalized["is_archived"] = normalized["status"] == "archived"

    return normalized


def get_stock_quantity(document: dict) -> int:
    value = document.get("stock_quantity", DEFAULT_STOCK_QUANTITY)
    try:
        return max(int(value), 0)
    except (TypeError, ValueError):
        return DEFAULT_STOCK_QUANTITY


def get_low_stock_threshold(document: dict) -> int:
    value = document.get("low_stock_threshold", DEFAULT_LOW_STOCK_THRESHOLD)
    try:
        return max(int(value), 0)
    except (TypeError, ValueError):
        return DEFAULT_LOW_STOCK_THRESHOLD


def is_low_stock_document(document: dict) -> bool:
    if document.get("is_archived") or document.get("status") in LOW_STOCK_EXCLUDED_STATUSES:
        return False

    return get_stock_quantity(document) <= get_low_stock_threshold(document)


def serialize_inventory_document(document: dict | None) -> dict | None:
    serialized = serialize_document(document)
    if serialized is None:
        return None

    serialized["stock_quantity"] = get_stock_quantity(serialized)
    serialized["low_stock_threshold"] = get_low_stock_threshold(serialized)
    serialized["is_low_stock"] = is_low_stock_document(serialized)
    return serialized


async def _fetch_inventory_documents(query: dict) -> list[dict]:
    items = []
    cursor = inventory_collection.find(query).sort("created_at", DESCENDING)
    async for document in cursor:
        serialized = serialize_inventory_document(document)
        if serialized is not None:
            items.append(serialized)
    return items


def validate_inventory_state(listing_type: str | None, status_value: str | None) -> None:
    if status_value == "in_auction" and listing_type != "auction":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Listings marked In Auction must use the auction listing type.",
        )


def validate_price_range(min_price: float | None, max_price: float | None) -> None:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Minimum price cannot be greater than maximum price.",
        )


def build_inventory_query(
    *,
    search: str | None = None,
    category: str | None = None,
    color: str | None = None,
    status_filter: str | None = None,
    listing_type: str | None = None,
    seller_name: str | None = None,
    seller_id: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    owner_id: str | None = None,
) -> dict:
    query: dict = {}
    validate_price_range(min_price, max_price)

    if owner_id:
        query["seller_id"] = owner_id
    normalized_category = category.strip() if category else None
    normalized_color = color.strip() if color else None
    normalized_seller_name = seller_name.strip() if seller_name else None
    normalized_seller_id = seller_id.strip() if seller_id else None
    normalized_search = search.strip() if search else None

    if normalized_category:
        query["category"] = {"$regex": re.escape(normalized_category), "$options": "i"}
    if normalized_color:
        query["color"] = {"$regex": re.escape(normalized_color), "$options": "i"}
    if status_filter:
        query["status"] = status_filter
    if listing_type:
        query["listing_type"] = listing_type
    if normalized_seller_name:
        query["seller_name"] = {"$regex": re.escape(normalized_seller_name), "$options": "i"}
    if normalized_seller_id:
        query["seller_id"] = normalized_seller_id

    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price

    if normalized_search:
        regex = {"$regex": re.escape(normalized_search), "$options": "i"}
        query["$or"] = [{field: regex} for field in SEARCHABLE_FIELDS]
        if owner_id is None:
            query["$or"].extend([{"seller_name": regex}, {"seller_id": regex}])

    return query


async def _get_owned_inventory_document(item_id: str, seller_id: str) -> dict:
    document = await inventory_collection.find_one(
        {"_id": parse_object_id(item_id, "inventory id"), "seller_id": seller_id}
    )
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found for this seller.",
        )
    return document


async def create_inventory_item(payload: dict, seller: dict) -> dict:
    timestamp = datetime.now(timezone.utc)
    document = normalize_inventory_payload(payload)
    validate_inventory_state(document.get("listing_type"), document.get("status"))
    document.update(
        {
            "seller_id": seller["id"],
            "seller_name": seller["name"],
            "stock_quantity": get_stock_quantity(document),
            "low_stock_threshold": get_low_stock_threshold(document),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
    )

    result = await inventory_collection.insert_one(document)
    created_document = await inventory_collection.find_one({"_id": result.inserted_id})

    await log_inventory_action(
        actor_id=seller["id"],
        actor_role=seller["role"],
        action="inventory_created",
        inventory_id=str(result.inserted_id),
        details={"gem_name": document["gem_name"]},
    )

    return serialize_inventory_document(created_document)


async def list_seller_inventory(
    *,
    seller: dict,
    search: str | None = None,
    category: str | None = None,
    color: str | None = None,
    status_filter: str | None = None,
    listing_type: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> dict:
    query = build_inventory_query(
        search=search,
        category=category,
        color=color,
        status_filter=status_filter,
        listing_type=listing_type,
        min_price=min_price,
        max_price=max_price,
        owner_id=seller["id"],
    )

    items = await _fetch_inventory_documents(query)
    return {"items": items, "total": len(items)}


async def get_seller_inventory_item(item_id: str, seller: dict) -> dict:
    document = await _get_owned_inventory_document(item_id, seller["id"])
    return serialize_inventory_document(document)


async def update_seller_inventory_item(item_id: str, payload: dict, seller: dict) -> dict:
    existing_document = await _get_owned_inventory_document(item_id, seller["id"])

    update_data = {key: value for key, value in payload.items() if value is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided for update.",
        )

    update_data = normalize_inventory_payload(update_data)
    validate_inventory_state(
        update_data.get("listing_type", existing_document.get("listing_type")),
        update_data.get("status", existing_document.get("status")),
    )

    update_data["updated_at"] = datetime.now(timezone.utc)

    updated_document = await inventory_collection.find_one_and_update(
        {"_id": parse_object_id(item_id, "inventory id"), "seller_id": seller["id"]},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    await log_inventory_action(
        actor_id=seller["id"],
        actor_role=seller["role"],
        action="inventory_updated",
        inventory_id=item_id,
        details={"fields": list(update_data.keys())},
    )

    return serialize_inventory_document(updated_document)


async def archive_seller_inventory_item(item_id: str, seller: dict) -> dict:
    existing_document = await _get_owned_inventory_document(item_id, seller["id"])
    next_is_archived = not existing_document.get("is_archived", False)
    next_status = "archived" if next_is_archived else "active"

    updated_document = await inventory_collection.find_one_and_update(
        {"_id": parse_object_id(item_id, "inventory id"), "seller_id": seller["id"]},
        {
            "$set": {
                "status": next_status,
                "is_archived": next_is_archived,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        return_document=ReturnDocument.AFTER,
    )

    if updated_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found for this seller.",
        )

    await log_inventory_action(
        actor_id=seller["id"],
        actor_role=seller["role"],
        action="inventory_unarchived" if not next_is_archived else "inventory_archived",
        inventory_id=item_id,
        details={"status": next_status},
    )

    return serialize_inventory_document(updated_document)


async def update_seller_inventory_status(item_id: str, status_value: str, seller: dict) -> dict:
    existing_document = await _get_owned_inventory_document(item_id, seller["id"])
    update_data = {
        "status": status_value,
        "is_archived": status_value == "archived",
        "updated_at": datetime.now(timezone.utc),
    }
    if status_value == "in_auction" and existing_document.get("listing_type") != "auction":
        update_data["listing_type"] = "auction"

    validate_inventory_state(
        update_data.get("listing_type", existing_document.get("listing_type")),
        status_value,
    )

    updated_document = await inventory_collection.find_one_and_update(
        {"_id": parse_object_id(item_id, "inventory id"), "seller_id": seller["id"]},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if updated_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found for this seller.",
        )

    await log_inventory_action(
        actor_id=seller["id"],
        actor_role=seller["role"],
        action="inventory_status_updated",
        inventory_id=item_id,
        details={"status": status_value},
    )

    return serialize_inventory_document(updated_document)


async def delete_seller_inventory_item(item_id: str, seller: dict) -> dict:
    existing_document = await _get_owned_inventory_document(item_id, seller["id"])
    await inventory_collection.delete_one({"_id": existing_document["_id"]})

    await log_inventory_action(
        actor_id=seller["id"],
        actor_role=seller["role"],
        action="inventory_deleted",
        inventory_id=item_id,
        details={"gem_name": existing_document["gem_name"]},
    )

    return {"message": "Inventory item deleted successfully."}


async def get_seller_low_stock_items(seller: dict) -> dict:
    items = await _fetch_inventory_documents({"seller_id": seller["id"]})
    low_stock_items = [item for item in items if item["is_low_stock"]]
    return {"items": low_stock_items, "total": len(low_stock_items)}


async def get_low_stock_items_for_query(query: dict | None = None) -> dict:
    items = await _fetch_inventory_documents(query or {})
    low_stock_items = [item for item in items if item["is_low_stock"]]
    return {"items": low_stock_items, "total": len(low_stock_items)}
