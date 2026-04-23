from fastapi import APIRouter, Body, HTTPException
# මෙන්න මෙතන තමයි වැරදිලා තිබුණේ - OfferModel එකත් import කරන්න ඕනේ
from models import GemstoneModel, OfferModel 
from database import gem_collection, offer_collection
from bson import ObjectId

# Router එකක් හදාගන්නවා Endpoints ටික Group කරන්න
router = APIRouter()

# 1. CREATE: අලුත් මැණික් ගලක් ඇතුළත් කිරීම
@router.post("/gemstones/", response_description="Add new gemstone")
async def create_gemstone(gem: GemstoneModel = Body(...)):
    gem_dict = gem.model_dump() 
    new_gem = await gem_collection.insert_one(gem_dict)
    return {"message": "Gemstone added successfully", "id": str(new_gem.inserted_id)}

# 2. READ: මැණික් ගල් ඔක්කොම ලැයිස්තුගත කිරීම
@router.get("/gemstones/", response_description="List all gemstones")
async def list_gemstones():
    gemstones = []
    cursor = gem_collection.find().limit(100)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        gemstones.append(document)
    return gemstones

# 3. CREATE: අලුත් Offer එකක් සේව් කිරීම (Smart Negotiation Engine)
@router.post("/offers/", response_description="Submit a new price offer")
async def create_offer(offer: OfferModel = Body(...)):
    offer_dict = offer.model_dump()
    # database.py එකෙන් එන offer_collection එකට සේව් කරනවා
    new_offer = await offer_collection.insert_one(offer_dict)
    
    return {
        "message": "Offer submitted successfully", 
        "offer_id": str(new_offer.inserted_id)
    }