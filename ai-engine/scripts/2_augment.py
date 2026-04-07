import os
import shutil
import random
from PIL import Image, ImageOps, ImageEnhance
from sklearn.model_selection import train_test_split
from tqdm import tqdm

INTERMEDIATE_DIR = "ai_engine/dataset/preprocessed"
OUTPUT_DIR = "ai_engine/dataset/processed"
IMG_SIZE = (224, 224)
TARGET_COUNT = 500 # Images 500 දක්වා වැඩි කරනවා

def apply_augmentation(img):
    """විවිධ Augmentation ක්‍රම අහඹු ලෙස (Randomly) තෝරා ගැනීම"""
    aug_type = random.choice(['flip', 'mirror', 'rotate', 'zoom', 'brightness'])
    
    if aug_type == 'flip':
        return ImageOps.flip(img)
        
    elif aug_type == 'mirror':
        return ImageOps.mirror(img)
        
    elif aug_type == 'rotate':
        # -45 ත් 45 ත් අතර ඕනෑම කෝණයකට හැරවීම
        angle = random.uniform(-45, 45)
        return img.rotate(angle, resample=Image.BICUBIC)
        
    elif aug_type == 'brightness':
        # ආලෝකය අඩු වැඩි කිරීම (0.7 to 1.3)
        enhancer = ImageEnhance.Brightness(img)
        return enhancer.enhance(random.uniform(0.7, 1.3))
        
    elif aug_type == 'zoom':
        # Zoom කිරීම: පින්තූරයෙන් 50% ක කොටසක් කපා (Crop) නැවත 224x224 ට Resize කිරීම
        width, height = img.size
        crop_ratio = random.uniform(0.5, 0.7) # 50% - 70% අතර කොටසක් ගන්නවා
        new_w, new_h = int(width * crop_ratio), int(height * crop_ratio)
        
        # Random තැනකින් Crop කිරීම
        left = random.randint(0, width - new_w)
        top = random.randint(0, height - new_h)
        
        cropped_img = img.crop((left, top, left + new_w, top + new_h))
        return cropped_img.resize(IMG_SIZE, Image.LANCZOS) # ආයේ ලොකු කරනවා

def augment_and_split():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    
    os.makedirs(os.path.join(OUTPUT_DIR, "train"), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, "test"), exist_ok=True)

    if not os.path.exists(INTERMEDIATE_DIR):
        print(f"Error: {INTERMEDIATE_DIR} not found. Run 1_preprocess.py first.")
        return

    gem_classes = [d for d in os.listdir(INTERMEDIATE_DIR) if os.path.isdir(os.path.join(INTERMEDIATE_DIR, d))]
    print(f"Found {len(gem_classes)} classes. Starting Augmentation up to {TARGET_COUNT} images...")

    for gem_name in gem_classes:
        class_dir = os.path.join(INTERMEDIATE_DIR, gem_name)
        images = [f for f in os.listdir(class_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        processed_images = []
        
        # මුලින්ම තියෙන pre-processed ෆොටෝ ටික ලිස්ට් එකට දාගන්නවා
        for img_file in images:
            img_path = os.path.join(class_dir, img_file)
            img = Image.open(img_path).convert('RGB')
            processed_images.append(img)

        original_count = len(processed_images)
        
        # Images 500 වෙනකම් Augment කරනවා
        if 0 < original_count < TARGET_COUNT:
            with tqdm(total=TARGET_COUNT - original_count, desc=f"Augmenting {gem_name}") as pbar:
                while len(processed_images) < TARGET_COUNT:
                    # තියෙන ෆොටෝ එකක් අරන් ඒකට Augmentation එකක් දානවා
                    base_img = random.choice(processed_images[:original_count])
                    new_img = apply_augmentation(base_img)
                    processed_images.append(new_img)
                    pbar.update(1)
        
        # ෆොටෝ 500 ට වඩා වැඩියෙන් තිබ්බොත් හරියටම 500ක් විතරක් තෝරගන්නවා (Class Balance එකට)
        if len(processed_images) > TARGET_COUNT:
            processed_images = random.sample(processed_images, TARGET_COUNT)

        # Train (80%) සහ Test (20%) විදියට කඩනවා
        if len(processed_images) > 0:
            train_imgs, test_imgs = train_test_split(processed_images, test_size=0.2, random_state=42)
            save_images(train_imgs, gem_name, "train")
            save_images(test_imgs, gem_name, "test")

def save_images(image_list, gem_name, split_type):
    save_path = os.path.join(OUTPUT_DIR, split_type, gem_name)
    os.makedirs(save_path, exist_ok=True)
    
    for i, img in enumerate(image_list):
        filename = f"{gem_name}_{split_type}_{i+1:04d}.jpg"
        img.save(os.path.join(save_path, filename), quality=90)

if __name__ == "__main__":
    augment_and_split()
    print("\nAugmentation and Splitting Complete! Dataset is ready for training.")