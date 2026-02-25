import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGO_URL is not set in the .env file")

client = AsyncIOMotorClient(MONGO_URL)

database = client.pinnawala_gems

gem_collection = database.get_collection("gemstones")

print("MongoDB Connected Successfully!")

# (database.py එකේ අගට මේක දාන්න)
offer_collection = database.get_collection("offers")