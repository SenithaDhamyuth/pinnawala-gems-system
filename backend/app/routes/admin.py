from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.controllers import admin_controller
from app.middleware.auth import admin_user
from app.schemas.common import ActionResponse
from app.schemas.inventory import (
    AdminDashboardStats,
    InventoryCreate,
    InventoryStatus,
    InventoryListResponse,
    LowStockSummary,
    InventoryResponse,
    InventoryStatusUpdate,
    InventoryUpdate,
    ListingType,
)
from app.services.inventory_service import validate_price_range


router = APIRouter(prefix="/api/admin", tags=["Admin Monitoring"])


@router.get("/dashboard/stats", response_model=AdminDashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(admin_user)) -> dict:
    return await admin_controller.get_dashboard_summary()


@router.get("/dashboard/low-stock", response_model=LowStockSummary)
async def get_low_stock_items(current_user: dict = Depends(admin_user)) -> dict:
    return await admin_controller.get_low_stock_summary()


@router.post("/inventory", response_model=InventoryResponse)
async def create_inventory_item(
    payload: InventoryCreate,
    current_user: dict = Depends(admin_user),
) -> dict:
    return await admin_controller.create_inventory_item(payload.model_dump(mode="json"), current_user)


@router.get("/inventory", response_model=InventoryListResponse)
async def list_inventory(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    color: str | None = Query(default=None),
    status_filter: InventoryStatus | None = Query(default=None, alias="status"),
    listing_type: ListingType | None = Query(default=None),
    seller_name: str | None = Query(default=None),
    seller_id: str | None = Query(default=None),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    current_user: dict = Depends(admin_user),
) -> dict:
    validate_price_range(min_price, max_price)
    return await admin_controller.list_inventory(
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


@router.get("/inventory/{item_id}", response_model=InventoryResponse)
async def get_inventory_item(
    item_id: str,
    current_user: dict = Depends(admin_user),
) -> dict:
    return await admin_controller.get_inventory_item(item_id)


@router.put("/inventory/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: str,
    payload: InventoryUpdate,
    current_user: dict = Depends(admin_user),
) -> dict:
    return await admin_controller.update_inventory_item(
        item_id,
        payload.model_dump(mode="json", exclude_unset=True),
        current_user,
    )


@router.patch("/inventory/{item_id}/archive", response_model=InventoryResponse)
async def archive_inventory_item(
    item_id: str,
    current_user: dict = Depends(admin_user),
) -> dict:
    return await admin_controller.archive_inventory_item(item_id, current_user)


@router.patch("/inventory/{item_id}/status", response_model=InventoryResponse)
async def update_inventory_status(
    item_id: str,
    payload: InventoryStatusUpdate,
    current_user: dict = Depends(admin_user),
) -> dict:
    return await admin_controller.update_inventory_status(item_id, payload.status, current_user)


@router.delete("/inventory/{item_id}", response_model=ActionResponse)
async def delete_inventory_item(
    item_id: str,
    current_user: dict = Depends(admin_user),
) -> dict:
    return await admin_controller.delete_inventory_item(item_id, current_user)
