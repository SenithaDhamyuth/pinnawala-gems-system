from __future__ import annotations

import io
from pathlib import Path

from fastapi import File, HTTPException, UploadFile, status

from app.main import create_app

try:
    import numpy as np
    from PIL import Image
except ImportError:
    np = None
    Image = None

try:
    import tensorflow as tf
except ImportError:
    tf = None


app = create_app()

MODEL_PATH = Path(__file__).resolve().parent.parent / "ai_engine" / "gem_model.h5"
LABEL_PATH = Path(__file__).resolve().parent.parent / "ai_engine" / "labels.txt"
model = None
class_names: list[str] = []


@app.on_event("startup")
async def load_ai_model() -> None:
    global model, class_names

    if tf is None or np is None or Image is None:
        print("AI dependencies are not installed. Inventory APIs remain available.")
        return

    try:
        if MODEL_PATH.exists():
            model = tf.keras.models.load_model(MODEL_PATH)
            print("AI model loaded successfully.")
        else:
            print(f"AI model not found at {MODEL_PATH}.")

        if LABEL_PATH.exists():
            class_names = [line.strip() for line in LABEL_PATH.read_text().splitlines() if line.strip()]
            print(f"Loaded AI labels: {class_names}")
        else:
            print(f"AI labels not found at {LABEL_PATH}.")
    except Exception as exc:
        model = None
        print(f"Failed to load AI model: {exc}")


def preprocess_image(image_bytes: bytes):
    if Image is None or np is None:
        raise RuntimeError("Image processing dependencies are not available.")

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array


@app.post("/api/predict-gem")
async def predict_gem(file: UploadFile = File(...)) -> dict:
    if tf is None or np is None or Image is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI prediction dependencies are not installed on this server.",
        )

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI model is not currently loaded.",
        )

    contents = await file.read()
    processed_image = preprocess_image(contents)
    predictions = model.predict(processed_image)
    predicted_class_idx = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_class_idx]) * 100

    if confidence < 90.0:
        return {
            "gem_type": "Unrecognized Gem",
            "confidence": round(confidence, 1),
            "description": (
                "AI confidence is too low. Please upload a clearer gemstone image and try again."
            ),
        }

    gem_type = class_names[predicted_class_idx] if class_names else "Unknown"
    if gem_type == "Not_a_Gem":
        description = "This image does not appear to contain a recognized gemstone."
    else:
        description = (
            f"Identified as {gem_type.replace('_', ' ')}. "
            "Use this result as an assisting hint only."
        )

    return {
        "gem_type": gem_type.replace("_", " "),
        "confidence": round(confidence, 1),
        "description": description,
    }
