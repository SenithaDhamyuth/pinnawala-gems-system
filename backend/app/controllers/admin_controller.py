from __future__ import annotations

from app.services.admin_service import (
    archive_inventory_item_as_admin,
    create_inventory_item_as_admin,
    delete_inventory_item_as_admin,
    get_admin_low_stock_items,
    get_dashboard_stats,
    get_inventory_item_for_admin,
    list_all_inventory,
    update_inventory_item_as_admin,
    update_inventory_status_as_admin,
)


async def list_inventory(**filters: dict) -> dict:
    return await list_all_inventory(**filters)


async def get_inventory_item(item_id: str) -> dict:
    return await get_inventory_item_for_admin(item_id)


async def create_inventory_item(payload: dict, admin: dict) -> dict:
    return await create_inventory_item_as_admin(payload, admin)


async def update_inventory_item(item_id: str, payload: dict, admin: dict) -> dict:
    return await update_inventory_item_as_admin(item_id, payload, admin)


async def archive_inventory_item(item_id: str, admin: dict) -> dict:
    return await archive_inventory_item_as_admin(item_id, admin)


async def update_inventory_status(item_id: str, status_value: str, admin: dict) -> dict:
    return await update_inventory_status_as_admin(item_id, status_value, admin)


async def delete_inventory_item(item_id: str, admin: dict) -> dict:
    return await delete_inventory_item_as_admin(item_id, admin)


async def get_dashboard_summary() -> dict:
    return await get_dashboard_stats()


async def get_low_stock_summary() -> dict:
    return await get_admin_low_stock_items()
