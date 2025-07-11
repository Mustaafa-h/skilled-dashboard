"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { addCompanyImage } from "@/app/lib/api";
import { getCompanyImages } from "@/app/lib/api";
import styles from "@/app/ui/dashboard/gallery/gallery.module.css";
import toast from "react-hot-toast";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const bucketName = "company-images";
  const companyId = "6c886af4-701a-4133-b68f-1647ad3efcad";

  const fetchImages = async () => {
    try {
      const { data } = await getCompanyImages(companyId);
      setImages(data.data); // backend returns an array of images
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch images from server.");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    try {
      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`${companyId}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(`${companyId}/${fileName}`);
      const publicUrl = urlData.publicUrl;

      // Add to company gallery via backend
      await addCompanyImage(companyId, {
        url: publicUrl,
        description: description.trim(),
        image_type: "gallery",
        sort_order: 1
      });

      toast.success("Image uploaded and added to gallery!");
      setFile(null);
      setDescription("");
      fetchImages();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Company Gallery</h2>

      <div className={styles.controls}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Enter image description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className={styles.grid}>
        {images.map((image, idx) => (
          <div className={styles.card} key={image.id || idx}>
            <img src={image.url} alt={image.description || `Image ${idx}`} className={styles.image} />
            <p>{image.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
