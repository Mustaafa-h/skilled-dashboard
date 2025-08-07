"use client";

import { useState, useEffect } from "react";
import { addCompanyImage, getCompanyImages, deleteCompanyImage } from "@/app/lib/api";
import styles from "../../ui/dashboard/gallery/gallery.module.css";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function GalleryPage() {
  const t = useTranslations();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const companyId = typeof window !== "undefined" ? localStorage.getItem("companyId") : null;

  const fetchImages = async () => {
    try {
      console.log("📥 Fetching gallery images...");
      const { data } = await getCompanyImages(companyId);
      console.log("✅ Loaded images:", data.data);
      setImages(data.data);
    } catch (error) {
      console.error("❌ Error loading images:", error);
      toast.error(t("fetchImagesFailed"));
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error(t("selectFileFirst"));
      return;
    }
    if (!description.trim()) {
      toast.error(t("enterDescription"));
      return;
    }

    setUploading(true);
    const payload = new FormData();
    payload.append("description", description.trim());
    payload.append("image", file);

    try {
      console.log("📤 Uploading image:", file.name);
      await addCompanyImage(companyId, payload);
      toast.success(t("imageUploaded"));

      setFile(null);
      setDescription("");
      fetchImages();
    } catch (error) {
      console.error("❌ Upload failed:", error);
      toast.error(t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm(t("confirmDeleteImage") || "Are you sure you want to delete this image?")) return;

    try {
      console.log("🗑️ Deleting image with ID:", imageId);
      await deleteCompanyImage(imageId);
      toast.success(t("imageDeleted"));
      fetchImages();
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error(t("deleteFailed"));
    }
  };

  return (
    <div className={styles.container}>
      <h2>{t("companyGallery")}</h2>

      <div className={styles.controls}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            console.log("📸 Selected file:", e.target.files[0]);
          }}
        />
        <input
          type="text"
          placeholder={t("enterImageDescription")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? t("uploading") : t("upload")}
        </button>
      </div>

      <div className={styles.grid}>
        {images.map((image, idx) => (
          <div className={styles.card} key={image.id || idx}>
            <img src={image.url} alt={image.description || `Image ${idx}`} className={styles.image} />
            <p>{image.description}</p>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(image.id)}
            >
              {t("delete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
