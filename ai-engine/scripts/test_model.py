import tensorflow as tf
import numpy as np
import os
import ast


MODEL_PATH = "ai_engine/gem_model.h5"
LABELS_PATH = "ai_engine/labels.txt"
TEST_IMAGE_PATH = "test_gem.jpg"  

def test_prediction():
   
    if not os.path.exists(MODEL_PATH):
        print("⚠️ Model file not found!")
        return

    print("🔄 Loading Model & Labels...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    with open(LABELS_PATH, "r") as f:
        class_names = ast.literal_eval(f.read())


    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"⚠️ Image '{TEST_IMAGE_PATH}' not found! Please add an image.")
        return

    img = tf.keras.utils.load_img(TEST_IMAGE_PATH, target_size=(224, 224))
    img_array = tf.keras.utils.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) # Create a batch
    img_array = img_array / 255.0 # Rescale (0-1)

    
    print("💎 Analyzing Image...")
    predictions = model.predict(img_array)
    score = tf.nn.softmax(predictions[0])

    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = 100 * np.max(predictions[0])

    print("\n" + "="*30)
    print(f"🎯 Result: {predicted_class}")
    print(f"📊 Confidence: {confidence:.2f}%")
    print("="*30 + "\n")

if __name__ == "__main__":
    test_prediction()