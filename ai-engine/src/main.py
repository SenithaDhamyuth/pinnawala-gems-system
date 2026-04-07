from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from auth import router as auth_router
from marketplace import router as marketplace_router

app = FastAPI(title="Pinnawala Gems AI, Auth & Marketplace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Marketplace Routes
app.include_router(marketplace_router, prefix="/api", tags=["Marketplace"])

# AI Model Paths - updated for new structure
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'gem_model.h5')
LABEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'labels.txt')

model = None
class_names = []

@app.on_event("startup")
async def load_model():
    global model, class_names
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ AI Model Loaded Successfully!")
        else:
            print(f"❌ Warning: AI Model not found at {MODEL_PATH} (AI Prediction endpoint won't work)")

        if os.path.exists(LABEL_PATH):
            with open(LABEL_PATH, 'r') as f:
                class_names = [line.strip() for line in f.readlines()]
            print(f"✅ Labels Loaded: {class_names}")
        else:
            print("❌ Warning: Labels not found!")
    except Exception as e:
        print(f"❌ Failed to load AI model: {e}")

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224)) 
    img_array = np.array(img) / 255.0 
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.post("/api/predict-gem")
async def predict_gem(file: UploadFile = File(...)):
    if model is None:
        return {"error": "AI Model is not loaded on the server."}
    try:
        contents = await file.read()
        processed_image = preprocess_image(contents)

        predictions = model.predict(processed_image)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx]) * 100

        if confidence < 90.0:
            return {
                "gem_type": "Unrecognized Gem",
                "confidence": round(confidence, 1),
                "description": "AI Confidence score is too low. Please get a better, clearer picture of the gemstone and try again."
            }

        gem_type = class_names[predicted_class_idx] if class_names else "Unknown"

        if gem_type == "Not_a_Gem":
            desc = "This does not appear to be a recognized gemstone. Please upload a clear image of a gem."
        else:
            desc = f"Identified as {gem_type.replace('_', ' ')}. Recommended for further physical inspection to verify market value."

        return {
            "gem_type": gem_type.replace('_', ' '),
            "confidence": round(confidence, 1),
            "description": desc
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "Welcome to Pinnawala Gems AI & Auth API. Server is Running!"}
