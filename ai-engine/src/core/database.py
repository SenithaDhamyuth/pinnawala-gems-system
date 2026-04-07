import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# Get MONGO_URI from environment variable
mongo_uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/PinnawalaGems")

client = MongoClient(mongo_uri)
# The database name will be taken from the URI automatically if we use client.get_default_database()
# Or we can just use the name explicitly, but python driver allows:
db = client.get_database("PinnawalaGems") if "PinnawalaGems" not in mongo_uri else client.get_default_database()

users_collection = db["users"]
gem_collection = db["gemstones"]
offer_collection = db["offers"]