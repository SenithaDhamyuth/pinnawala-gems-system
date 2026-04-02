from __future__ import annotations

from bson import ObjectId
from fastapi import HTTPException, status


def parse_object_id(value: str, field_name: str = "id") -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} supplied.",
        )
    return ObjectId(value)


def serialize_document(document: dict | None) -> dict | None:
    if document is None:
        return None

    serialized = {**document, "id": str(document["_id"])}
    serialized.pop("_id", None)
    return serialized


def serialize_documents(documents: list[dict]) -> list[dict]:
    return [serialize_document(document) for document in documents if document is not None]
