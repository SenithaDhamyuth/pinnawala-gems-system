from __future__ import annotations

import math
from datetime import datetime
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.constants import (
    CATEGORY_VALUES,
    CUT_TYPE_VALUES,
    DEFAULT_LOW_STOCK_THRESHOLD,
    DEFAULT_STOCK_QUANTITY,
    MAX_INVENTORY_IMAGES,
    ORIGIN_VALUES,
    VALID_IMAGE_PREFIXES,
)


RoleType = Literal["admin", "seller"]
InventoryStatus = Literal["active", "sold", "archived", "unavailable", "in_auction"]
ListingType = Literal["direct_sale", "auction"]


def _validate_finite_number(value: float) -> float:
    if not math.isfinite(value):
        raise ValueError("Value must be a finite number.")
    return value


def _validate_choice(value: str | None, allowed_values: tuple[str, ...], label: str) -> str | None:
    if value is None:
        return None
    if value not in allowed_values:
        raise ValueError(f"{label} must be one of: {', '.join(allowed_values)}.")
    return value


def _normalize_image_list(images: list[str] | None) -> list[str] | None:
    if images is None:
        return None

    unique_images: list[str] = []
    for image in images:
        normalized_image = image.strip()
        if not normalized_image:
            continue
        if not normalized_image.startswith(VALID_IMAGE_PREFIXES):
            raise ValueError("Images must be data URLs or http/https URLs.")
        if normalized_image not in unique_images:
            unique_images.append(normalized_image)

    if len(unique_images) > MAX_INVENTORY_IMAGES:
        raise ValueError(f"You can upload up to {MAX_INVENTORY_IMAGES} images.")

    return unique_images


class InventoryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)

    gem_name: str = Field(..., min_length=2, max_length=120)
    gem_type: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., min_length=2, max_length=80)
    color: str = Field(..., min_length=2, max_length=80)
    carat: float = Field(..., gt=0)
    cut: str = Field(..., min_length=2, max_length=80)
    origin: str = Field(..., min_length=2, max_length=120)
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(default=DEFAULT_STOCK_QUANTITY, ge=0, le=100000)
    low_stock_threshold: int = Field(default=DEFAULT_LOW_STOCK_THRESHOLD, ge=0, le=100000)
    description: str = Field(..., min_length=10, max_length=2000)
    listing_type: ListingType = "direct_sale"
    images: list[str] = Field(default_factory=list, max_length=MAX_INVENTORY_IMAGES)
    status: InventoryStatus = "active"

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        return _validate_choice(value, CATEGORY_VALUES, "Category")

    @field_validator("cut")
    @classmethod
    def validate_cut(cls, value: str) -> str:
        return _validate_choice(value, CUT_TYPE_VALUES, "Cut")

    @field_validator("origin")
    @classmethod
    def validate_origin(cls, value: str) -> str:
        return _validate_choice(value, ORIGIN_VALUES, "Origin")

    @field_validator("carat", "price")
    @classmethod
    def validate_numeric_values(cls, value: float) -> float:
        return _validate_finite_number(value)

    @field_validator("images")
    @classmethod
    def validate_images(cls, value: list[str]) -> list[str]:
        return _normalize_image_list(value) or []

    @model_validator(mode="after")
    def validate_listing_state(self) -> Self:
        if self.status == "in_auction" and self.listing_type != "auction":
            raise ValueError("Listings marked In Auction must use the auction listing type.")
        return self


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    gem_name: str | None = Field(default=None, min_length=2, max_length=120)
    gem_type: str | None = Field(default=None, min_length=2, max_length=120)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    color: str | None = Field(default=None, min_length=2, max_length=80)
    carat: float | None = Field(default=None, gt=0)
    cut: str | None = Field(default=None, min_length=2, max_length=80)
    origin: str | None = Field(default=None, min_length=2, max_length=120)
    price: float | None = Field(default=None, gt=0)
    stock_quantity: int | None = Field(default=None, ge=0, le=100000)
    low_stock_threshold: int | None = Field(default=None, ge=0, le=100000)
    description: str | None = Field(default=None, min_length=10, max_length=2000)
    listing_type: ListingType | None = None
    images: list[str] | None = Field(default=None, max_length=MAX_INVENTORY_IMAGES)
    status: InventoryStatus | None = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str | None) -> str | None:
        return _validate_choice(value, CATEGORY_VALUES, "Category")

    @field_validator("cut")
    @classmethod
    def validate_cut(cls, value: str | None) -> str | None:
        return _validate_choice(value, CUT_TYPE_VALUES, "Cut")

    @field_validator("origin")
    @classmethod
    def validate_origin(cls, value: str | None) -> str | None:
        return _validate_choice(value, ORIGIN_VALUES, "Origin")

    @field_validator("carat", "price")
    @classmethod
    def validate_numeric_values(cls, value: float | None) -> float | None:
        if value is None:
            return None
        return _validate_finite_number(value)

    @field_validator("images")
    @classmethod
    def validate_images(cls, value: list[str] | None) -> list[str] | None:
        return _normalize_image_list(value)

    @model_validator(mode="after")
    def validate_listing_state(self) -> Self:
        if self.status == "in_auction" and self.listing_type not in (None, "auction"):
            raise ValueError("Listings marked In Auction must use the auction listing type.")
        return self


class InventoryStatusUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    status: InventoryStatus


class InventoryResponse(InventoryBase):
    id: str
    seller_id: str
    seller_name: str
    is_archived: bool = False
    is_low_stock: bool = False
    created_at: datetime
    updated_at: datetime


class InventoryListResponse(BaseModel):
    items: list[InventoryResponse]
    total: int


class LowStockSummary(BaseModel):
    items: list[InventoryResponse]
    total: int


class AdminDashboardStats(BaseModel):
    total_sellers: int
    total_inventory_items: int
    active_listings: int
    archived_listings: int
    sold_listings: int
    unavailable_listings: int
    in_auction_listings: int
    low_stock_items: int
