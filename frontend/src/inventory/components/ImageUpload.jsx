import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

import { getImageUrl } from "../utils/helpers";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ images = [], onChange }) {
  const [processing, setProcessing] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) {
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} must be smaller than 5MB`);
        return false;
      }

      return true;
    });

    if (!validFiles.length) {
      return;
    }

    if (images.length + validFiles.length > 5) {
      toast.error("You can upload up to 5 images per listing");
      return;
    }

    setProcessing(true);

    try {
      const nextImages = await Promise.all(validFiles.map((file) => fileToDataUrl(file)));
      onChange([...images, ...nextImages]);
      toast.success(`${nextImages.length} image${nextImages.length > 1 ? "s" : ""} added`);
    } catch (error) {
      toast.error("Image processing failed");
    } finally {
      setProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (index) => onChange(images.filter((_, currentIndex) => currentIndex !== index));

  return (
    <div>
      <div
        className={`inv-upload-area ${drag ? "drag" : ""}`}
        onClick={() => !processing && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        <Upload size={28} color="#2563eb" />
        <p>
          {processing
            ? "Preparing image previews..."
            : "Click or drag images here (JPEG, PNG, WEBP, max 5MB each)"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="inv-image-previews">
          {images.map((url, index) => (
            <div className="inv-image-preview" key={`${url}-${index}`}>
              <img src={getImageUrl(url)} alt={`gem-${index}`} />
              <button className="inv-image-preview-rm" onClick={() => removeImage(index)}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
