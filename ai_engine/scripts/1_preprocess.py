import os
import shutil
from PIL import Image
from tqdm import tqdm

SOURCE_DIR = "ai_engine/dataset/my_uploads"
INTERMEDIATE_DIR = "ai_engine/dataset/preprocessed"
IMG_SIZE = (224, 224)

def preprocess_images():
    # පරණ preprocessed ෆෝල්ඩර් එක මකා දමා අලුතින් සෑදීම
    if os.path.exists(INTERMEDIATE_DIR):
        shutil.rmtree(INTERMEDIATE_DIR)
    os.makedirs(INTERMEDIATE_DIR, exist_ok=True)

    if not os.path.exists(SOURCE_DIR):
        print(f"Error: {SOURCE_DIR} not found.")
        return

    gem_classes = [d for d in os.listdir(SOURCE_DIR) if os.path.isdir(os.path.join(SOURCE_DIR, d))]
    print(f"Found {len(gem_classes)} classes for Pre-processing...")

    for gem_name in gem_classes:
        class_dir = os.path.join(SOURCE_DIR, gem_name)
        save_dir = os.path.join(INTERMEDIATE_DIR, gem_name)
        os.makedirs(save_dir, exist_ok=True)
        
        images = [f for f in os.listdir(class_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        for img_file in tqdm(images, desc=f"Resizing {gem_name}"):
            try:
                img_path = os.path.join(class_dir, img_file)
                img = Image.open(img_path).convert('RGB')
                img = img.resize(IMG_SIZE, Image.LANCZOS)
                
                # Resized image එක සේව් කිරීම
                save_path = os.path.join(save_dir, img_file)
                img.save(save_path, quality=100)
            except Exception as e:
                print(f"Error processing {img_file}: {e}")

if __name__ == "__main__":
    preprocess_images()
    print("Pre-processing Complete! Images are ready for Augmentation.")