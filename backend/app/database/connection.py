from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import MONGO_URI, DATABASE_NAME

client = None
db = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    print("✅ Connected to MongoDB (Inventory Module)")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("❌ Disconnected from MongoDB")

def get_db():
    if db is None:
        raise Exception("Database not connected")
    return db

def get_inventory_col():
    if db is None:
        raise Exception("Database not connected")
    return db.get_collection("gemstones")

def get_users_col():
    if db is None:
        raise Exception("Database not connected")
    return db.get_collection("users")
