"""
Seed script to populate government_records collection with sample data.
Run this once to initialize test data for seller verification.

Usage: python seed_government_records.py
"""

from core.database import db
from datetime import datetime

# Sample government records database
SAMPLE_RECORDS = [
    {
        "nic_number": "200012345678",
        "ngja_license": "NGJA-2023-12345",
        "full_name": "Kamal Silva",
        "shop_name": "Kamal's Gems",
        "is_valid": "true",
        "registered_date": "2023-01-15",
        "business_type": "gemstone_seller"
    },
    {
        "nic_number": "199856234509",
        "ngja_license": "NGJA-2023-54321",
        "full_name": "Ravi Seller",
        "shop_name": "Ravi's Precious Stones",
        "is_valid": "true",
        "registered_date": "2022-06-20",
        "business_type": "gemstone_seller"
    },
    {
        "nic_number": "200145678901",
        "ngja_license": "NGJA-2024-11111",
        "full_name": "Vidya Jayapala",
        "shop_name": "Vidya Gems & Jewels",
        "is_valid": "true",
        "registered_date": "2024-03-10",
        "business_type": "gemstone_seller"
    },
    {
        "nic_number": "199723456789",
        "ngja_license": "NGJA-2023-99999",
        "full_name": "Rose Seller",
        "shop_name": "Rose's Gem Collection",
        "is_valid": "true",
        "registered_date": "2023-11-05",
        "business_type": "gemstone_seller"
    },
    {
        "nic_number": "200267890123",
        "ngja_license": "NGJA-2024-88888",
        "full_name": "Kv Merchant",
        "shop_name": "KV's Gemstone House",
        "is_valid": "true",
        "registered_date": "2024-01-20",
        "business_type": "gemstone_seller"
    },
    {
        "nic_number": "200256789012",
        "ngja_license": "NGJA-2023-77777",
        "full_name": "Ganapa Silva",
        "shop_name": "Ganapa's Stones",
        "is_valid": "true",
        "registered_date": "2023-08-12",
        "business_type": "gemstone_seller"
    },
]

def seed_government_records():
    """Insert sample government records into the database."""
    
    collection = db["government_records"]
    
    # Check if data already exists
    existing_count = collection.count_documents({})
    if existing_count > 0:
        print(f"⚠️  Government records already exist ({existing_count} records). Skipping seed.")
        return
    
    # Insert sample records
    try:
        result = collection.insert_many(SAMPLE_RECORDS)
        print(f"✅ Successfully seeded {len(result.inserted_ids)} government records")
        print("\nSample NIC & NGJA combinations for testing:")
        for i, record in enumerate(SAMPLE_RECORDS, 1):
            print(f"   {i}. NIC: {record['nic_number']}, NGJA: {record['ngja_license']} ({record['full_name']})")
    except Exception as e:
        print(f"❌ Error seeding data: {str(e)}")

if __name__ == "__main__":
    print("🌱 Seeding government records...")
    seed_government_records()
    print("\n✅ Seed complete!")
