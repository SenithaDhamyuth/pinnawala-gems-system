from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

# 1. FastAPI App එක මුලින්ම Initialize කරනවා (NameError එක එන්නේ නැති වෙන්න)
app = FastAPI()

# 2. React Frontend එකට Backend එකත් එක්ක කතා කරන්න අවසර දීම (CORS) [cite: 78, 146]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. අපේ AI Model එක සහ Labels තියෙන තැන් (Paths) 
MODEL_PATH = '../ai_engine/gem_model.h5'
LABEL_PATH = '../ai_engine/labels.txt'

model = None
class_names = []

# 4. Server එක startup වෙද්දීම Model එක Load කරගැනීම 
@app.on_event("startup")
async def load_model():
    global model, class_names
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ AI Model Loaded Successfully!")
        else:
            print(f"❌ Error: Model not found at {MODEL_PATH}")

        if os.path.exists(LABEL_PATH):
            with open(LABEL_PATH, 'r') as f:
                class_names = [line.strip() for line in f.readlines()]
            print(f"✅ Labels Loaded: {class_names}")
        else:
            print("❌ Error: Labels not found!")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")

# 5. Image Pre-processing (MobileNetV2 වලට ගැලපෙන සයිස් එකට සකස් කිරීම) 
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224)) 
    img_array = np.array(img) / 255.0 
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# 6. Prediction Endpoint (90% Confidence Threshold එක සමඟ) [cite: 63, 215]
@app.post("/api/predict-gem")
async def predict_gem(file: UploadFile = File(...)):
    if model is None:
        return {"error": "AI Model is not loaded on the server."}

    try:
        contents = await file.read()
        processed_image = preprocess_image(contents)

        # AI Prediction ලබා ගැනීම
        predictions = model.predict(processed_image)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx]) * 100

        # Confidence එක 90% ට වඩා අඩු නම් "Unrecognized" විදියට සලකනවා [cite: 215]
        if confidence < 90.0:
            return {
                "gem_type": "Unrecognized Gem",
                "confidence": round(confidence, 1),
                "description": "AI Confidence score is too low. Please get a better, clearer picture of the gemstone and try again."
            }

        # 90% හෝ ඊට වැඩි නම් පමණක් අදාළ නම ලබා දීම
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