"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { getSubServiceById, updateSubService } from "@/app/lib/api";

export default function EditSubServicePage() {
  const router = useRouter();
  const { subServiceId } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    service_id: "",
    icon_url: "", // for preview only
  });

  const [iconFile, setIconFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSubService = async () => {
      try {
        const res = await getSubServiceById(subServiceId);
        const sub = res.data;
        console.log("Fetched sub-service:", sub);

        setFormData({
          name: sub.name || "",
          slug: sub.slug || "",
          description: sub.description || "",
          service_id: sub.service?.id || "",
          icon_url: sub.icon || "", // preview only
        });
      } catch (error) {
        console.error("Error fetching sub-service:", error);
        toast.error("Failed to fetch sub-service.");
      } finally {
        setLoading(false);
      }
    };

    if (subServiceId) fetchSubService();
  }, [subServiceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected icon file:", file);
    setIconFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formPayload = new FormData();
      formPayload.append("service_id", formData.service_id);
      formPayload.append("name", formData.name);
      formPayload.append("slug", formData.slug);
      formPayload.append("description", formData.description);
      if (iconFile) {
        formPayload.append("icon", iconFile);
        console.log("Icon appended:", iconFile.name);
      } else {
        console.log("No new icon selected; sending without 'icon'");
      }

      console.log("Final payload:", [...formPayload.entries()]);

      const res = await updateSubService(subServiceId, formPayload); // this should handle form-data in api.js

      if (res?.data) {
        toast.success("Sub-service updated successfully.");
        router.push("/dashboard-superadmin/services");
      } else {
        console.log("Update failed:", res);
        toast.error("Update failed.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong during update.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Sub-Service</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className={styles.input}
        />
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="Slug"
          required
          className={styles.input}
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className={styles.textarea}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleIconChange}
          className={styles.input}
        />
        {formData.icon_url && !iconFile && (
          <div className={styles.previewContainer}>
            <p>Current Icon:</p>
            <img
              src={formData.icon_url}
              alt="Current Icon"
              className={styles.imagePreview}
            />
          </div>
        )}
        <button type="submit" disabled={updating} className={styles.button}>
          {updating ? "Updating..." : "Update Sub-Service"}
        </button>
      </form>
    </div>
  );
}
