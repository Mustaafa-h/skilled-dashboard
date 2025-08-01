"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { getServiceById, updateService } from "@/app/lib/api";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function EditServicePage() {
    const router = useRouter();
    const { serviceId } = useParams();
    const t = useTranslations("editService");

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon_url: "",
        image_url: "",
        is_active: true
    });
    const [iconFile, setIconFile] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await getServiceById(serviceId);
                const data = response.data;
                console.log("Fetched service data:", data);
                if (data) {
                    setFormData({
                        name: data.name || "",
                        slug: data.slug || "",
                        description: data.description || "",
                        icon_url: data.icon_url || "",
                        image_url: data.image_url || "",
                        is_active: data.is_active ?? true
                    });
                }
            } catch (error) {
                console.error("Error fetching service:", error);
                toast.error(t("fetchError", { defaultValue: "Failed to fetch service data." }));
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [serviceId, t]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        setIconFile(file);
        console.log("Selected icon file:", file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("slug", formData.slug);
            payload.append("description", formData.description);
            if (iconFile) {
                payload.append("icon", iconFile);
                console.log("Icon appended:", iconFile.name);
            }

            console.log("Final payload (FormData entries):", Array.from(payload.entries()));

            const response = await updateService(serviceId, payload);
            console.log("Update response:", response);

            if (response.data?.success) {
                toast.success(t("success", { defaultValue: "Service updated successfully." }));
                router.push("/dashboard-superadmin/services");
            } else {
                toast.error(response.data?.message || t("fail", { defaultValue: "Failed to update service." }));
            }
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error(t("error", { defaultValue: "Error updating service." }));
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p>{t("loading", { defaultValue: "Loading..." })}</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("title", { defaultValue: "Edit Service" })}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder={t("name", { defaultValue: "Service Name" })}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="slug"
                    placeholder={t("slug", { defaultValue: "Slug" })}
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <textarea
                    name="description"
                    placeholder={t("description", { defaultValue: "Description" })}
                    value={formData.description}
                    onChange={handleChange}
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
                        <p>{t("currentIcon", { defaultValue: "Current Icon:" })}</p>
                        <img src={formData.icon_url} alt="Current Icon" className={styles.imagePreview} />
                    </div>
                )}
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className={styles.checkbox}
                    />
                    {t("active", { defaultValue: "Active" })}
                </label>
                <button type="submit" disabled={updating} className={styles.button}>
                    {updating
                        ? t("updating", { defaultValue: "Updating..." })
                        : t("updateBtn", { defaultValue: "Update Service" })}
                </button>
            </form>
        </div>
    );
}
