from bing_image_downloader import downloader
import os

# අපේ original uploads තියෙන තැන
SAVE_DIR = "ai_engine/dataset/my_uploads/Not_a_Gem"

# හොයන්න ඕන දේවල් (Search queries)
search_queries = [
    "river pebbles and rocks",
    "common garden stones",
    "broken glass pieces",
    "granite rock texture",
    "human palm holding nothing",
    "construction gravel"
]

def download_negatives():
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)

    for query in search_queries:
        print(f"Downloading images for: {query}")
        downloader.download(
            query, 
            limit=100,  # එක query එකකට images 100 ගානේ
            output_dir='temp_download', 
            adult_filter_off=True, 
            force_replace=False, 
            timeout=60
        )
        
        # Download වුනු ෆයිල් ටික අපේ ප්‍රධාන Not_a_Gem ෆෝල්ඩරයට Move කිරීම
        temp_path = os.path.join('temp_download', query)
        for filename in os.listdir(temp_path):
            src = os.path.join(temp_path, filename)
            dst = os.path.join(SAVE_DIR, f"neg_{query.replace(' ', '_')}_{filename}")
            if not os.path.exists(dst):
                os.rename(src, dst)

    print(f"Successfully downloaded negative images to {SAVE_DIR}")

if __name__ == "__main__":
    download_negatives()