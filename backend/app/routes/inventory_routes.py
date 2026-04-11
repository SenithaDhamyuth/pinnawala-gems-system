from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from typing import Optional
import shutil, uuid, os
from app.schemas.inventory_schemas import InventoryCreate, InventoryUpdate, StatusUpdate
from app.middleware.auth_middleware import get_seller_user
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])
UPLOAD_DIR = "uploads/inventory"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_seller_user)):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WEBP images allowed")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    return {"url": f"/uploads/inventory/{filename}", "filename": filename}

@router.get("/my-items")
async def get_my_items(
    search: Optional[str] = Query(None), status: Optional[str] = Query(None),
    category: Optional[str] = Query(None), listing_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None), max_price: Optional[float] = Query(None),
    current_user: dict = Depends(get_seller_user),
):
    return await inventory_service.get_seller_items(
        seller_id=current_user["user_id"], search=search, status=status,
        category=category, listing_type=listing_type, min_price=min_price, max_price=max_price)

@router.post("")
async def create_item(data: InventoryCreate, current_user: dict = Depends(get_seller_user)):
    return await inventory_service.create_inventory_item(
        data=data.model_dump(), seller_id=current_user["user_id"], seller_name=current_user["name"])

@router.get("/{item_id}")
async def get_item(item_id: str, current_user: dict = Depends(get_seller_user)):
    item = await inventory_service.get_item_by_id(item_id)
    if item["seller_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return item

@router.put("/{item_id}")
async def update_item(item_id: str, data: InventoryUpdate, current_user: dict = Depends(get_seller_user)):
    return await inventory_service.update_inventory_item(
        item_id=item_id, seller_id=current_user["user_id"], data=data.model_dump(exclude_none=True))

@router.patch("/{item_id}/archive")
async def archive_item(item_id: str, current_user: dict = Depends(get_seller_user)):
    return await inventory_service.archive_item(item_id=item_id, seller_id=current_user["user_id"])

@router.patch("/{item_id}/status")
async def update_status(item_id: str, data: StatusUpdate, current_user: dict = Depends(get_seller_user)):
    return await inventory_service.update_status(
        item_id=item_id, seller_id=current_user["user_id"], new_status=data.status)

@router.delete("/{item_id}")
async def delete_item(item_id: str, current_user: dict = Depends(get_seller_user)):
    await inventory_service.delete_item(item_id=item_id, seller_id=current_user["user_id"])
    return {"message": "Item deleted successfully"}
