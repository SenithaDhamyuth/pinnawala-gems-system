from __future__ import annotations

from app.services.inventory_service import (
    archive_seller_inventory_item,
    create_inventory_item,
    delete_seller_inventory_item,
    get_seller_inventory_item,
    get_seller_low_stock_items,
    list_seller_inventory,
    update_seller_inventory_item,
    update_seller_inventory_status,
)


async def create_item(payload: dict, seller: dict) -> dict:
    return await create_inventory_item(payload, seller)


async def list_items(seller: dict, **filters: dict) -> dict:
    return await list_seller_inventory(seller=seller, **filters)


async def get_item(item_id: str, seller: dict) -> dict:
    return await get_seller_inventory_item(item_id, seller)


async def update_item(item_id: str, payload: dict, seller: dict) -> dict:
    return await update_seller_inventory_item(item_id, payload, seller)


async def archive_item(item_id: str, seller: dict) -> dict:
    return await archive_seller_inventory_item(item_id, seller)


async def update_item_status(item_id: str, status_value: str, seller: dict) -> dict:
    return await update_seller_inventory_status(item_id, status_value, seller)


async def delete_item(item_id: str, seller: dict) -> dict:
    return await delete_seller_inventory_item(item_id, seller)


async def get_low_stock_items(seller: dict) -> dict:
    return await get_seller_low_stock_items(seller)
