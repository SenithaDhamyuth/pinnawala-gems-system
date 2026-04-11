from datetime import datetime, timezone

DEMO_USERS = [
    {
        "user_id": "demo_admin_001",
        "name": "Admin User",
        "email": "admin@gmail.com",
        "password": "admin123",
        "role": "admin",
        "is_verified_seller": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "user_id": "demo_seller_001",
        "name": "Demo Seller",
        "email": "seller@gmail.com",
        "password": "seller123",
        "role": "seller",
        "is_verified_seller": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
]
