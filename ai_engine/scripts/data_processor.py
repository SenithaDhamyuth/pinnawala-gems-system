import os
import shutil
import random
from PIL import Image, ImageOps
from sklearn.model_selection import train_test_split
from tqdm import tqdm

SOURCE_DIR = "ai_engine/dataset/my_uploads"
OUTPUT_DIR = "ai_engine/dataset/processed"
IMG_SIZE = (224, 224)
TARGET_COUNT = 300

def process_dataset():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    
    os.makedirs(os.path.join(OUTPUT_DIR, "train"), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, "test"), exist_ok=True)

    if not os.path.exists(SOURCE_DIR):
        print(f"Error: {SOURCE_DIR} not found.")
        return

    gem_classes = [d for d in os.listdir(SOURCE_DIR) if os.path.isdir(os.path.join(SOURCE_DIR, d))]
    
    print(f"Found {len(gem_classes)} classes. Processing...")

    for gem_name in gem_classes:
        class_dir = os.path.join(SOURCE_DIR, gem_name)
        images = [f for f in os.listdir(class_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        processed_images = []

        for img_file in tqdm(images, desc=gem_name):
            try:
                img_path = os.path.join(class_dir, img_file)
                img = Image.open(img_path).convert('RGB')
                img = img.resize(IMG_SIZE, Image.LANCZOS)
                processed_images.append(img)
            except Exception as e:
                pass

        original_count = len(processed_images)
        if original_count < TARGET_COUNT and original_count > 0:
            while len(processed_images) < TARGET_COUNT:
                img = random.choice(processed_images[:original_count])
                aug_type = random.choice(['flip', 'rotate', 'mirror'])
                if aug_type == 'flip':
                    new_img = ImageOps.flip(img)
                elif aug_type == 'mirror':
                    new_img = ImageOps.mirror(img)
                else:
                    new_img = img.rotate(random.choice([90, 180, 270]))
                
                processed_images.append(new_img)

        if len(processed_images) > 0:
            train_imgs, test_imgs = train_test_split(processed_images, test_size=0.2, random_state=42)
            save_images(train_imgs, gem_name, "train")
            save_images(test_imgs, gem_name, "test")

def save_images(image_list, gem_name, split_type):
    save_path = os.path.join(OUTPUT_DIR, split_type, gem_name)
    os.makedirs(save_path, exist_ok=True)
    
    for i, img in enumerate(image_list):
        filename = f"{gem_name}_{split_type}_{i+1:03d}.jpg"
        img.save(os.path.join(save_path, filename), quality=90)

if __name__ == "__main__":
    process_dataset()
    print("Processing Complete.")