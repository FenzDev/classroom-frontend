import React, { useEffect, useRef, useState } from "react";
import { UploadWidgetValue } from "@/types";
import { UploadCloud } from "lucide-react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";

const UploadWidget = ({ value = null, onChange, disabled = false }) => {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const onChangeRef = useRef(onChange);

  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    setPreview(value);
    if (!value) setDeleteToken(null);
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeWidget = () => {
      if (!window.cloudinary || widgetRef.current) return false;
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          multiple: false,
          folder: "uploads",
          maxFileSize: 5000000,
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        },
        (error, res) => {
          if (!error && res.event === "success") {
            const payload: UploadWidgetValue = {
              url: res.info.secure_url,
              publicId: res.info.public_id,
            };
            setPreview(payload);
            setDeleteToken(res.info.delete_token ?? null);
            onChangeRef.current?.(payload);
          }
        },
      );
    };
    if (!initializeWidget()) return;

    const intervalId = setInterval(() => {
      if (initializeWidget()) {
        window.clearInterval(intervalId);
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  });

  const openWidget = () => {
    if (!disabled) {
      widgetRef.current?.open();
    }
  };

  const uploadFile = async (file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();

    const payload: UploadWidgetValue = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    setPreview(payload);
    setDeleteToken(result.delete_token ?? null);
    onChangeRef.current?.(payload);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (disabled) return;

    const file = event.dataTransfer.files[0];

    if (!file) return;

    await uploadFile(file);
  };

  const removeFromCloudinary = async () => {};

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="upload-preview flex justify-center">
          <img
            className="max-w-100" 
            src={preview.url} alt='Uploaded photo'/>
        </div>
      ) : (
        <div
          className="upload-dropzone"
          role="button"
          tabIndex={0}
          onClick={openWidget}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              openWidget();
            }
          }}
        >
          <div className="upload-prompt">
            <UploadCloud className="icon" />
            <div>
              <p>Click to upload photo</p>
              <p>PNG, JPG up to 5 MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadWidget;
