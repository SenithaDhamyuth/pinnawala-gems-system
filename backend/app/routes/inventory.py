from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status

from app.controllers import inventory_controller
from app.middleware.auth import verified_seller
from app.schemas.common import ActionResponse
from app.schemas.inventory import (
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


router = APIRouter(prefix="/api/inventory", tags=["Seller Inventory"])


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    payload: InventoryCreate,
    current_user: dict = Depends(verified_seller),
) -> dict:
    return await inventory_controller.create_item(payload.model_dump(mode="json"), current_user)


@router.get("/my-items", response_model=InventoryListResponse)
async def list_my_items(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    color: str | None = Query(default=None),
    status_filter: InventoryStatus | None = Query(default=None, alias="status"),
    listing_type: ListingType | None = Query(default=None),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    current_user: dict = Depends(verified_seller),
) -> dict:
    validate_price_range(min_price, max_price)
    return await inventory_controller.list_items(
        current_user,
        search=search,
        category=category,
        color=color,
        status_filter=status_filter,
        listing_type=listing_type,
        min_price=min_price,
        max_price=max_price,
    )


@router.get("/low-stock", response_model=LowStockSummary)
async def list_low_stock_items(current_user: dict = Depends(verified_seller)) -> dict:
    return await inventory_controller.get_low_stock_items(current_user)


@router.get("/{item_id}", response_model=InventoryResponse)
async def get_inventory_item(
    item_id: str,
    current_user: dict = Depends(verified_seller),
) -> dict:
    return await inventory_controller.get_item(item_id, current_user)


@router.put("/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: str,
    payload: InventoryUpdate,
    current_user: dict = Depends(verified_seller),
) -> dict:
    return await inventory_controller.update_item(
        item_id,
        payload.model_dump(mode="json", exclude_unset=True),
        current_user,
    )


@router.patch("/{item_id}/archive", response_model=InventoryResponse)
async def archive_inventory_item(
    item_id: str,
    current_user: dict = Depends(verified_seller),
) -> dict:
    return await inventory_controller.archive_item(item_id, current_user)


@router.patch("/{item_id}/status", response_model=InventoryResponse)
async def update_inventory_status(
    item_id: str,
    payload: InventoryStatusUpdate,
    current_user: dict = Depends(verified_seller),
) -> dict:
    return await inventory_controller.update_item_status(item_id, payload.status, current_user)


@router.delete("/{item_id}", response_model=ActionResponse)
async def delete_inventory_item(
    item_id: str,
    current_user: dict = Depends(verified_seller),
) -> dict:
    return await inventory_controller.delete_item(item_id, current_user)
