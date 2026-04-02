from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from pymongo import DESCENDING, ReturnDocument

from app.database.mongodb import inventory_collection
from app.services.inventory_service import (
    build_inventory_query,
    get_low_stock_items_for_query,
    get_low_stock_threshold,
    get_stock_quantity,
    normalize_inventory_payload,
    serialize_inventory_document,
    validate_inventory_state,
)
from app.services.log_service import log_inventory_action
from app.services.user_service import count_verified_sellers
from app.utils.mongo import parse_object_id


async def list_all_inventory(
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
) -> dict:
    query = build_inventory_query(
        search=search,
        category=category,
        color=color,
        status_filter=status_filter,
        listing_type=listing_type,
        seller_name=seller_name,
        seller_id=seller_id,
        min_price=min_price,
        max_price=max_price,
    )

    items = []
    cursor = inventory_collection.find(query).sort("created_at", DESCENDING)
    async for document in cursor:
        serialized = serialize_inventory_document(document)
        if serialized is not None:
            items.append(serialized)

    return {"items": items, "total": len(items)}


async def get_inventory_item_for_admin(item_id: str) -> dict:
    document = await inventory_collection.find_one({"_id": parse_object_id(item_id, "inventory id")})
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found.",
        )
    return serialize_inventory_document(document)


async def create_inventory_item_as_admin(payload: dict, admin: dict) -> dict:
    timestamp = datetime.now(timezone.utc)
    document = normalize_inventory_payload(payload)
    validate_inventory_state(document.get("listing_type"), document.get("status"))
    document.update(
        {
            "seller_id": admin["id"],
            "seller_name": admin["name"],
            "stock_quantity": get_stock_quantity(document),
            "low_stock_threshold": get_low_stock_threshold(document),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
    )

    result = await inventory_collection.insert_one(document)
    created_document = await inventory_collection.find_one({"_id": result.inserted_id})

    await log_inventory_action(
        actor_id=admin["id"],
        actor_role=admin["role"],
        action="inventory_created_by_admin",
        inventory_id=str(result.inserted_id),
        details={"gem_name": document["gem_name"]},
    )

    return serialize_inventory_document(created_document)


async def update_inventory_item_as_admin(item_id: str, payload: dict, admin: dict) -> dict:
    update_data = {key: value for key, value in payload.items() if value is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided for update.",
        )

    inventory_id = parse_object_id(item_id, "inventory id")
    existing_document = await inventory_collection.find_one({"_id": inventory_id})
    if existing_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found.",
        )

    normalized_update = normalize_inventory_payload(update_data)
    validate_inventory_state(
        normalized_update.get("listing_type", existing_document.get("listing_type")),
        normalized_update.get("status", existing_document.get("status")),
    )
    normalized_update["updated_at"] = datetime.now(timezone.utc)

    updated_document = await inventory_collection.find_one_and_update(
        {"_id": inventory_id},
        {"$set": normalized_update},
        return_document=ReturnDocument.AFTER,
    )

    await log_inventory_action(
        actor_id=admin["id"],
        actor_role=admin["role"],
        action="inventory_updated_by_admin",
        inventory_id=item_id,
        details={"fields": list(normalized_update.keys())},
    )

    return serialize_inventory_document(updated_document)


async def archive_inventory_item_as_admin(item_id: str, admin: dict) -> dict:
    inventory_id = parse_object_id(item_id, "inventory id")
    existing_document = await inventory_collection.find_one({"_id": inventory_id})
    if existing_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found.",
        )

    next_is_archived = not existing_document.get("is_archived", False)
    next_status = "archived" if next_is_archived else "active"

    updated_document = await inventory_collection.find_one_and_update(
        {"_id": inventory_id},
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
            detail="Inventory item was not found.",
        )

    await log_inventory_action(
        actor_id=admin["id"],
        actor_role=admin["role"],
        action="inventory_unarchived_by_admin" if not next_is_archived else "inventory_archived_by_admin",
        inventory_id=item_id,
        details={"status": next_status},
    )

    return serialize_inventory_document(updated_document)


async def update_inventory_status_as_admin(item_id: str, status_value: str, admin: dict) -> dict:
    inventory_id = parse_object_id(item_id, "inventory id")
    existing_document = await inventory_collection.find_one({"_id": inventory_id})
    if existing_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found.",
        )

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
        {"_id": inventory_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if updated_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found.",
        )

    await log_inventory_action(
        actor_id=admin["id"],
        actor_role=admin["role"],
        action="inventory_status_updated_by_admin",
        inventory_id=item_id,
        details={"status": status_value},
    )

    return serialize_inventory_document(updated_document)


async def delete_inventory_item_as_admin(item_id: str, admin: dict) -> dict:
    inventory_id = parse_object_id(item_id, "inventory id")
    existing_document = await inventory_collection.find_one({"_id": inventory_id})
    if existing_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item was not found.",
        )

    await inventory_collection.delete_one({"_id": inventory_id})

    await log_inventory_action(
        actor_id=admin["id"],
        actor_role=admin["role"],
        action="inventory_deleted_by_admin",
        inventory_id=item_id,
        details={"gem_name": existing_document["gem_name"]},
    )

    return {"message": "Inventory record removed successfully."}


async def get_dashboard_stats() -> dict:
    low_stock_summary = await get_low_stock_items_for_query()
    return {
        "total_sellers": await count_verified_sellers(),
        "total_inventory_items": await inventory_collection.count_documents({}),
        "active_listings": await inventory_collection.count_documents(
            {"status": "active", "is_archived": False}
        ),
        "archived_listings": await inventory_collection.count_documents({"is_archived": True}),
        "sold_listings": await inventory_collection.count_documents({"status": "sold"}),
        "unavailable_listings": await inventory_collection.count_documents({"status": "unavailable"}),
        "in_auction_listings": await inventory_collection.count_documents({"status": "in_auction"}),
        "low_stock_items": low_stock_summary["total"],
    }


async def get_admin_low_stock_items() -> dict:
    return await get_low_stock_items_for_query()
