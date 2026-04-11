from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


class Settings:
    api_title = "Pinnawala Gems Inventory API"
    api_version = "1.0.0"
    api_description = (
        "Standalone inventory management module for the Pinnawala Gems "
        "marketplace with demo Admin and Seller access."
    )
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    mongo_db_name = os.getenv("MONGO_DB_NAME", "pinnawala_gems")
    jwt_secret = os.getenv("JWT_SECRET", "gem-inventory-demo-secret")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))
    seed_demo_data_on_startup = os.getenv("SEED_DEMO_DATA_ON_STARTUP", "true").lower() == "true"
    demo_admin_name = os.getenv("DEMO_ADMIN_NAME", "System Admin")
    demo_admin_email = os.getenv("DEMO_ADMIN_EMAIL", "admin@gmail.com").lower()
    demo_admin_password = os.getenv("DEMO_ADMIN_PASSWORD", "admin123")
    demo_seller_name = os.getenv("DEMO_SELLER_NAME", "Nadeesha Seller")
    demo_seller_email = os.getenv("DEMO_SELLER_EMAIL", "seller@gmail.com").lower()
    demo_seller_password = os.getenv("DEMO_SELLER_PASSWORD", "seller123")

    @property
    def cors_origins(self) -> list[str]:
        raw_origins = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    @property
    def demo_users(self) -> list[dict]:
        return [
            {
                "name": self.demo_admin_name,
                "email": self.demo_admin_email,
                "password": self.demo_admin_password,
                "role": "admin",
                "is_verified_seller": False,
            },
            {
                "name": self.demo_seller_name,
                "email": self.demo_seller_email,
                "password": self.demo_seller_password,
                "role": "seller",
                "is_verified_seller": True,
            },
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
