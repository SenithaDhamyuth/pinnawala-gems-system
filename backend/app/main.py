from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.database.mongodb import init_indexes
from app.middleware.error_handlers import register_exception_handlers
from app.routes import admin, auth, inventory
from app.services.seed_service import ensure_demo_seed_data, normalize_inventory_records
from routes import router as legacy_marketplace_router


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.api_title,
        version=settings.api_version,
        description=settings.api_description,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins or ["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(auth.router)
    app.include_router(inventory.router)
    app.include_router(admin.router)
    app.include_router(legacy_marketplace_router, prefix="/api")

    @app.on_event("startup")
    async def startup_tasks() -> None:
        await init_indexes()
        if settings.seed_demo_data_on_startup:
            await ensure_demo_seed_data()
        await normalize_inventory_records()

    @app.get("/")
    async def root() -> dict:
        return {
            "message": "Pinnawala Gems Inventory API is running.",
            "module": "inventory-management",
        }

    return app
