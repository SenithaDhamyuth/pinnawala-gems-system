from pydantic import BaseModel, Field
from typing import Optional, List

class InventoryCreate(BaseModel):
    gem_name: str = Field(..., min_length=1, max_length=100)
    gem_type: str
    category: str
    color: str
    carat: float = Field(..., gt=0)
    cut: Optional[str] = None
    origin: Optional[str] = None
    price: float = Field(..., gt=0)
    description: Optional[str] = None
    listing_type: str = "direct_sale"
    images: Optional[List[str]] = []
    status: str = "active"

class InventoryUpdate(BaseModel):
    gem_name: Optional[str] = None
    gem_type: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    carat: Optional[float] = None
    cut: Optional[str] = None
    origin: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    listing_type: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
