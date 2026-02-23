from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import ast


app = FastAPI()


origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


print("🔄 Loading AI Model...")
MODEL_PATH = "ai_engine/gem_model.h5"
LABELS_PATH = "ai_engine/labels.txt"

model = tf.keras.models.load_model(MODEL_PATH)

with open(LABELS_PATH, "r") as f:
    class_names = ast.literal_eval(f.read())

print("✅ Model Loaded Successfully!")



@app.get("/")
def read_root():
    return {"message": "Gem Prediction API is Running! 💎"}

@app.post("/predict")
async def predict_gem(file: UploadFile = File(...)):
    
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    
    
    image = image.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(image)
    img_array = tf.expand_dims(img_array, 0) 
    img_array = img_array / 255.0 

   
    predictions = model.predict(img_array)
    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0])) * 100

    return {
        "gem_type": predicted_class,
        "confidence": round(confidence, 2)
    }