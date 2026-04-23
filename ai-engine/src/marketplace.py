from fastapi import APIRouter, Body, HTTPException, Depends
from models.marketplace import GemstoneModel, OfferModel
from core.database import gem_collection, offer_collection
from core.jwt_handler import get_current_user
from bson import ObjectId

router = APIRouter()

@router.post("/gemstones/")
async def create_gemstone(gem: GemstoneModel, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["seller", "admin"]:
        raise HTTPException(status_code=403, detail="Only sellers can create listings")
    gem_dict = gem.model_dump()
    gem_dict["seller_id"] = current_user.get("email")
    new_gem = gem_collection.insert_one(gem_dict)
    return {"message": "Gemstone added successfully", "id": str(new_gem.inserted_id)}

@router.get("/gemstones/")
async def list_gemstones():
    gemstones = []
    cursor = gem_collection.find().limit(100)
    for document in cursor:
        document["_id"] = str(document["_id"])
        gemstones.append(document)
    return gemstones

@router.put("/gemstones/{gem_id}")
async def update_gemstone(gem_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(gem_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Gem ID")
        
    gem = gem_collection.find_one({"_id": obj_id})
    if not gem:
        raise HTTPException(status_code=404, detail="Gemstone not found")
    
    if current_user.get("role") != "admin" and gem.get("seller_id") != current_user.get("email"):
        raise HTTPException(status_code=403, detail="You can only update your own listings")
    
    payload.pop("seller_id", None)
    payload.pop("_id", None)
    
    gem_collection.update_one({"_id": obj_id}, {"$set": payload})
    return {"message": "Gemstone updated successfully"}

@router.delete("/gemstones/{gem_id}")
async def delete_gemstone(gem_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(gem_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Gem ID")
        
    gem = gem_collection.find_one({"_id": obj_id})
    if not gem:
        raise HTTPException(status_code=404, detail="Gemstone not found")
    
    if current_user.get("role") != "admin" and gem.get("seller_id") != current_user.get("email"):
        raise HTTPException(status_code=403, detail="You can only delete your own listings")
    
    gem_collection.delete_one({"_id": obj_id})
    return {"message": "Gemstone deleted successfully"}

@router.post("/offers/")
async def create_offer(offer: OfferModel = Body(...), current_user: dict = Depends(get_current_user)):
    offer_dict = offer.model_dump()
    offer_dict["buyer_id"] = current_user.get("email")
    new_offer = offer_collection.insert_one(offer_dict)
    return {"message": "Offer submitted successfully", "offer_id": str(new_offer.inserted_id)}
