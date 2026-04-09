"""
replace_government_records.py
Run this file from your backend folder:
    python replace_government_records.py
"""

from pymongo import MongoClient
from openpyxl import load_workbook
from datetime import datetime
import os

# ── SETTINGS ──────────────────────────────────────────────
MONGO_URI   = "mongodb://localhost:27017"
DB_NAME     = "pinnawala_gems"
COLLECTION  = "government_records"
EXCEL_FILE  = "ACTIVE-DEALER-LICENSE-LIST2026__2_.xlsx"
# ──────────────────────────────────────────────────────────

def main():

    # Check Excel file exists
    if not os.path.exists(EXCEL_FILE):
        print(f"ERROR: Excel file not found: {EXCEL_FILE}")
        print(f"Make sure the Excel file is in the same folder as this script!")
        return

    # Connect to MongoDB
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    col = db[COLLECTION]
    print(f"Connected! Current records in {COLLECTION}: {col.count_documents({})}")

    # Load Excel
    print(f"\nReading Excel file: {EXCEL_FILE}")
    wb = load_workbook(EXCEL_FILE, read_only=True)
    ws = wb.active
    all_rows = list(ws.iter_rows(values_only=True))

    # Row 0 = title, Row 1 = headers, Row 2+ = data
    data_rows = all_rows[2:]
    print(f"Found {len(data_rows)} records in Excel")

    # Build documents
    documents = []
    for row in data_rows:
        if not row or not row[6]:
            continue

        no, brc, name, city, district, expired_date, license_number = row

        doc = {
            "ngja_license" : str(license_number).strip(),
            "full_name"    : str(name).strip() if name else "",
            "city"         : str(city).strip() if city else "",
            "district"     : str(district).strip() if district else "",
            "brc"          : str(brc).strip() if brc else "",
            "expired_date" : str(expired_date).strip() if expired_date else "",
            "is_valid"     : True,
            "imported_at"  : datetime.utcnow()
        }
        documents.append(doc)

    print(f"Prepared {len(documents)} documents to insert")

    # Confirm before deleting
    print(f"\n⚠️  This will DELETE all existing records and add {len(documents)} new ones.")
    confirm = input("Type YES to continue: ").strip()

    if confirm != "YES":
        print("Cancelled. Nothing was changed.")
        return

    # Delete old records
    deleted = col.delete_many({})
    print(f"✅ Deleted {deleted.deleted_count} old records")

    # Insert new records in batches
    batch_size = 500
    total = 0
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        col.insert_many(batch)
        total += len(batch)
        print(f"   Inserted {total}/{len(documents)} records...")

    # Create index for faster search
    col.create_index("ngja_license")
    print(f"\n✅ Done! {total} dealer records imported into '{COLLECTION}'")

    # Show sample
    print("\n--- Sample record in MongoDB ---")
    sample = col.find_one()
    if sample:
        print(f"  ngja_license : {sample['ngja_license']}")
        print(f"  full_name    : {sample['full_name']}")
        print(f"  district     : {sample['district']}")
        print(f"  is_valid     : {sample['is_valid']}")

    print("\n✅ Verification will now work!")
    print("   Seller enters license number -> system checks MongoDB -> shows verified or not")

if __name__ == "__main__":
    main()
