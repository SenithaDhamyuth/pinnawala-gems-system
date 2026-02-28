from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["pinnawala_gems"]

users_collection = db["users"]