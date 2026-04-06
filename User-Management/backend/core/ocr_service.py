import os
from pathlib import Path
from typing import Dict

import easyocr
from pdfminer.high_level import extract_text as extract_pdf_text
from PIL import Image, ImageEnhance, ImageFilter

# Cache the OCR reader so it is reused across requests.
_reader = None

def get_reader():
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["en"], gpu=False)
    return _reader


def preprocess_image(image_path: str) -> str:
    """Preprocess image for better OCR: grayscale, enhance contrast, sharpen."""
    img = Image.open(image_path)
    img = img.convert('L')  # Grayscale
    img = ImageEnhance.Contrast(img).enhance(2.0)  # Increase contrast
    img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))  # Sharpen
    processed_path = image_path.replace('.png', '_processed.png').replace('.jpg', '_processed.jpg').replace('.jpeg', '_processed.jpeg')
    img.save(processed_path)
    return processed_path


def extract_text_from_image(file_path: str) -> str:
    processed_path = preprocess_image(file_path)
    reader = get_reader()
    result = reader.readtext(processed_path, detail=0)
    # Clean up processed file
    try:
        os.remove(processed_path)
    except OSError:
        pass
    return "\n".join(result)


def extract_text_from_pdf(file_path: str) -> str:
    return extract_pdf_text(file_path)


def extract_text_from_file(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()
    if ext in [".png", ".jpg", ".jpeg"]:
        return extract_text_from_image(file_path)
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    raise ValueError("Unsupported file type for OCR")