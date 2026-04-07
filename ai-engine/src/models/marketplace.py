from pydantic import BaseModel, Field
from typing import Optional

class GemstoneModel(BaseModel):
    seller_id: str = Field(default="", description="Automatically linked to verified seller account")
    name: str = Field(..., min_length=3, max_length=100)
    gem_type: str = Field(...)
    color: str = Field(...)
    weight_carats: float = Field(..., gt=0)
    listing_type: str = Field(default="Direct_Sale")
    base_price: float = Field(..., gt=0)
    status: str = Field(default="Active")
    image_url: Optional[str] = Field(default="https://via.placeholder.com/250?text=No+Image")

class OfferModel(BaseModel):
    gem_id: str = Field(...)
    buyer_id: str = Field(default="buyer")
    offer_amount: float = Field(..., gt=0)
    status: str = Field(default="Pending")
