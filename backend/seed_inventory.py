from __future__ import annotations

import asyncio

from app.database.mongodb import init_indexes
from app.services.seed_service import ensure_demo_seed_data


async def seed_inventory_module() -> None:
    await init_indexes()
    result = await ensure_demo_seed_data(reset_inventory=True)
    seller = result["users"]["seller"]
    print(
        "Seeded demo inventory data for",
        seller["email"],
        f"with {result['seeded_inventory_count']} inventory records.",
    )


if __name__ == "__main__":
    asyncio.run(seed_inventory_module())
