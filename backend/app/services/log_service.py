from __future__ import annotations

from datetime import datetime, timezone

from app.database.mongodb import activity_logs_collection


async def log_inventory_action(
    *,
    actor_id: str,
    actor_role: str,
    action: str,
    inventory_id: str | None = None,
    details: dict | None = None,
) -> None:
    try:
        await activity_logs_collection.insert_one(
            {
                "actor_id": actor_id,
                "actor_role": actor_role,
                "action": action,
                "inventory_id": inventory_id,
                "details": details or {},
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception:
        # Logging should never block the main user flow.
        return
