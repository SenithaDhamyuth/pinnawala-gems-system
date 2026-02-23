import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import ast


MODEL_PATH = "ai_engine/gem_model.h5"
LABELS_PATH = "ai_engine/labels.txt"
TEST_DIR = "ai_engine/dataset/processed/test"
IMG_SIZE = (224, 224)

def evaluate_my_ai():
   
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(LABELS_PATH, "r") as f:
        class_names = ast.literal_eval(f.read())

    
    test_datagen = ImageDataGenerator(rescale=1./255)
    test_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMG_SIZE,
        batch_size=32,
        class_mode='categorical',
        shuffle=False  
    )

   
    print("📊 Evaluating Model... (Please wait)")
    Y_pred = model.predict(test_generator)
    y_pred = np.argmax(Y_pred, axis=1)

   
    print("\n--- Classification Report ---")
    print(classification_report(test_generator.classes, y_pred, target_names=class_names))

   
    cm = confusion_matrix(test_generator.classes, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Gem Identification - Confusion Matrix')
    plt.ylabel('Actual Gem Type')
    plt.xlabel('Predicted Gem Type')
    
    
    plt.savefig('ai_engine/evaluation_results.png')
    print("\n✅ Confusion Matrix saved as 'ai_engine/evaluation_results.png'")
    plt.show()

if __name__ == "__main__":
    evaluate_my_ai()