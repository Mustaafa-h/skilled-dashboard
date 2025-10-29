"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { addCompanyImage, getCompanyImages, deleteCompanyImage } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/companies/[companyId]/gallery/page.module.css";
import { useTranslations } from "next-intl";

export default function GallerySection({ companyId }) {
  const t = useTranslations();

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const bucketName = "company-images";

  const fetchImages = async () => {
    try {
      const { data } = await getCompanyImages(companyId);
      setImages(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error(t("gallery.fetchError", { defaultValue: "Failed to fetch images." }));
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchImages();
    }
  }, [companyId]);

  const handleUpload = async () => {
    if (!file) {
      toast.error(t("gallery.selectFile", { defaultValue: "Please select a file." }));
      return;
    }
    if (!description.trim()) {
      toast.error(t("gallery.addDescription", { defaultValue: "Please add a description." }));
      return;
    }
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`${companyId}/${fileName}`, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(`${companyId}/${fileName}`);
      const publicUrl = urlData.publicUrl;

      await addCompanyImage(companyId, {
        url: publicUrl,
        description: description.trim(),
        image_type: "gallery",
        sort_order: 1
      });

      toast.success(t("gallery.uploadSuccess", { defaultValue: "Image uploaded!" }));
      setFile(null);
      setDescription("");
      fetchImages();
    } catch (error) {
      console.error(error);
      toast.error(t("gallery.uploadError", { defaultValue: "Upload failed." }));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm(t("gallery.confirmDelete", { defaultValue: "Delete this image?" }))) return;
    try {
      await deleteCompanyImage(imageId);
      toast.success(t("gallery.deleteSuccess", { defaultValue: "Image deleted." }));
      fetchImages();
    } catch (err) {
      console.error(err);
      toast.error(t("gallery.deleteError", { defaultValue: "Failed to delete image." }));
    }
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("gallery.title", { defaultValue: "Company Gallery" })}</h2>
      <div className={styles.uploadSection}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className={styles.fileInput}
        />
        <input
          type="text"
          placeholder={t("gallery.descriptionPlaceholder", { defaultValue: "Image description" })}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textInput}
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={styles.uploadButton}
        >
          {uploading
            ? t("gallery.uploading", { defaultValue: "Uploading..." })
            : t("gallery.upload", { defaultValue: "Upload" })}
        </button>
      </div>
      <div className={styles.galleryGrid}>
        {images.map((img) => (
          <div key={img.id} className={styles.imageCard}>
            <img src={img.url} alt={img.description} className={styles.image} />
            <p className={styles.imageDescription}>{img.description}</p>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(img.id)}
            >
              {t("delete", { defaultValue: "Delete" })}
            </button>
          </div>
        ))}
      </div>
    </div >
  );
}
