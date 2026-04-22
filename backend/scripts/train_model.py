import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
import os

print("--- 🚀 Starting Advanced Model Training ---")

# Paths
TRAIN_DIR = 'ai_engine/dataset/processed/train'
TEST_DIR = 'ai_engine/dataset/processed/test'
MODEL_SAVE_PATH = 'ai_engine/gem_model.h5'
LABEL_SAVE_PATH = 'ai_engine/labels.txt'

# 1. Classes ගාණ හොයාගැනීම
classes_list = sorted(os.listdir(TRAIN_DIR))
num_classes = len(classes_list)
print(f"📁 Detected {num_classes} classes: {classes_list}")

# 2. Data Generators 
train_datagen = ImageDataGenerator(rescale=1./255)
test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR, target_size=(224, 224), batch_size=32, class_mode='categorical')

test_generator = test_datagen.flow_from_directory(
    TEST_DIR, target_size=(224, 224), batch_size=32, class_mode='categorical', shuffle=False)

# 3. Model Architecture (MobileNetV2)
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)  # Overfitting නවත්තන්න 50% ක් drop කරනවා
predictions = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

# 4. Phase 1: Feature Extraction (මුලින් අපේ කෑල්ල විතරක් ට්‍රේන් කරනවා)
print("\n--- Phase 1: Training Custom Head ---")
for layer in base_model.layers:
    layer.trainable = False # Base model එක ලොක් කරනවා

model.compile(optimizer=Adam(learning_rate=0.001), 
              loss='categorical_crossentropy', 
              metrics=['accuracy'])

# Callbacks හදමු
checkpoint = ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)
early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-6, verbose=1)

callbacks_list = [checkpoint, early_stop, reduce_lr]

# Phase 1 Training
history1 = model.fit(
    train_generator,
    validation_data=test_generator,
    epochs=10,
    callbacks=callbacks_list
)

# 5. Phase 2: Fine-Tuning (ප්‍රොෆෙෂනල් වැඩේ පටන් ගන්නේ මෙතනින්)
print("\n--- Phase 2: Fine-Tuning MobileNetV2 ---")
# Base model එකේ අන්තිම ලේයර්ස් 20 විතර අන්ලොක් කරනවා
for layer in base_model.layers[-20:]:
    layer.trainable = True

# ගොඩක් අඩු Learning rate එකකින් ආයේ compile කරනවා (කලින් ඉගෙනගත්ත ඒවා අමතක නොවෙන්න)
model.compile(optimizer=Adam(learning_rate=1e-5), 
              loss='categorical_crossentropy', 
              metrics=['accuracy'])

# Phase 2 Training (තවත් epochs 10ක්)
history2 = model.fit(
    train_generator,
    validation_data=test_generator,
    epochs=10,
    callbacks=callbacks_list
)

# 6. Labels සේව් කිරීම
with open(LABEL_SAVE_PATH, 'w') as f:
    for item in classes_list:
        f.write("%s\n" % item)

print(f"\n✅ Training Completed Perfectly!")
print(f"📦 Best Model saved to: {MODEL_SAVE_PATH}")
print(f"🏷️ Labels saved to: {LABEL_SAVE_PATH}")