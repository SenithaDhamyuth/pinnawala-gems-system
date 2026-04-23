from pydantic import BaseModel, Field
from typing import Optional

# මේක තමයි මැණික් ගලක අච්චුව (Schema validation)
class GemstoneModel(BaseModel):
    seller_id: str = Field(..., description="Linked to verified seller account")
    name: str = Field(..., min_length=3, max_length=100, description="Title of the gemstone")
    gem_type: str = Field(..., description="Gem Type Classification (e.g., Blue Sapphire)")
    color: str = Field(..., description="Color Classification")
    weight_carats: float = Field(..., gt=0, description="Physical Specifications: Carats. Must be greater than 0")
    listing_type: str = Field(default="Direct_Sale", description="Direct_Sale (Marketplace) or Auction")
    base_price: float = Field(..., gt=0, description="Base Price (Direct Sale)")
    status: str = Field(default="Pending_Approval", description="Pending_Approval, Active, In_Auction, Sold, Archived")

class OfferModel(BaseModel):
    gem_id: str = Field(..., description="ID of the gemstone being negotiated")
    buyer_id: str = Field(default="buyer_123")
    offer_amount: float = Field(..., gt=0)
    status: str = Field(default="Pending")

    class Config:
        json_schema_extra = {
            "example": {
                "seller_id": "65abc123def4567890abcdef",
                "name": "Royal Blue Sapphire",
                "gem_type": "Sapphire",
                "color": "Blue",
                "weight_carats": 2.5,
                "listing_type": "Direct_Sale",
                "base_price": 4500.00,
                "status": "Active"
            }
        }
        
        
        image_url: Optional[str] = Field(default="https://via.placeholder.com/250?text=No+Image", description="URL of the gem image")