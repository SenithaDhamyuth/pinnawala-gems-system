import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

# --- Settings ---
DATA_DIR = "ai_engine/dataset/processed"
TRAIN_DIR = os.path.join(DATA_DIR, "train")
TEST_DIR = os.path.join(DATA_DIR, "test")
MODEL_SAVE_PATH = "ai_engine/gem_model.h5"
LABEL_SAVE_PATH = "ai_engine/labels.txt"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10 

def train_gem_model():
    # 1. Setup Data Generators
    print("Loading Images...")
    
    train_datagen = ImageDataGenerator(rescale=1./255)
    test_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    validation_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    num_classes = len(train_generator.class_indices)
    class_names = list(train_generator.class_indices.keys())
    print(f"Classes found: {class_names}")

    # 2. Build Model (MobileNetV2)
    print("Building Model...")
    
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=IMG_SIZE + (3,))
    base_model.trainable = False 

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    # 3. Compile Model
    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    # 4. Train Model
    print(f"Starting Training for {EPOCHS} Epochs...")
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=validation_generator
    )

    # 5. Save Model & Labels
    print("Saving Model...")
    model.save(MODEL_SAVE_PATH)
    
    with open(LABEL_SAVE_PATH, "w") as f:
        f.write(str(class_names))

    print(f"Model saved at: {MODEL_SAVE_PATH}")
    print(f"Labels saved at: {LABEL_SAVE_PATH}")

if __name__ == "__main__":
    train_gem_model()