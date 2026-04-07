import asyncio
from database import gem_collection

# Database එකට යවන්න ඕනේ මැණික් ගල් ලැයිස්තුව (පින්තූරත් එක්කම)
sample_gems = [
    {
        "seller_id": "seller_002",
        "name": "Royal Blue Sapphire",
        "gem_type": "Blue_Sapphire",
        "color": "Vivid Blue",
        "weight_carats": 2.5,
        "listing_type": "Direct_Sale",
        "base_price": 450000.00,
        "status": "Active",
        "image_url": "https://images.unsplash.com/photo-1615115206757-78326e031e50?q=80&w=500&auto=format&fit=crop"
    },
    {
        "seller_id": "seller_003",
        "name": "Ceylon Green Sapphire",
        "gem_type": "Green_Sapphire",
        "color": "Deep Green",
        "weight_carats": 1.8,
        "listing_type": "Direct_Sale",
        "base_price": 120000.00,
        "status": "Active",
        "image_url": "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?q=80&w=500&auto=format&fit=crop"
    },
    {
        "seller_id": "seller_004",
        "name": "Pigeon Blood Ruby",
        "gem_type": "Ruby",
        "color": "Red",
        "weight_carats": 1.1,
        "listing_type": "Direct_Sale",
        "base_price": 850000.00,
        "status": "Active",
        "image_url": "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=500&auto=format&fit=crop"
    },
    {
        "seller_id": "seller_001",
        "name": "Vibrant Pink Sapphire",
        "gem_type": "Pink_Sapphire",
        "color": "Pink",
        "weight_carats": 3.2,
        "listing_type": "Direct_Sale",
        "base_price": 310000.00,
        "status": "Active",
        "image_url": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=500&auto=format&fit=crop"
    },
    {
        "seller_id": "seller_002",
        "name": "Star Sapphire",
        "gem_type": "Blue_Sapphire",
        "color": "Light Blue",
        "weight_carats": 4.5,
        "listing_type": "Direct_Sale",
        "base_price": 500000.00,
        "status": "Active",
        "image_url": "https://images.unsplash.com/photo-1573408301145-b98c4af3322b?q=80&w=500&auto=format&fit=crop"
    },
    {
        "seller_id": "seller_005",
        "name": "Yellow Sapphire (Pushparaga)",
        "gem_type": "Yellow_Sapphire",
        "color": "Yellow",
        "weight_carats": 2.1,
        "listing_type": "Direct_Sale",
        "base_price": 280000.00,
        "status": "Active",
        "image_url": "https://images.unsplash.com/photo-1629236715160-522db38e5539?q=80&w=500&auto=format&fit=crop"
    }
]

async def seed_database():
    print("Clearing old data from database...")
    await gem_collection.delete_many({}) 
    
    print("Seeding database with new sample gemstones...")
    await gem_collection.insert_many(sample_gems)
    print("Successfully added new gemstones with images!")

# මුලින්ම Data ලෑස්ති කරගෙන, ඊට පස්සේ තමයි මේක Run කරන්නේ
if __name__ == "__main__":
    asyncio.run(seed_database())