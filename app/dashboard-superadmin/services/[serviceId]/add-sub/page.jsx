"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { createSubService } from "@/app/lib/api";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function AddSubServicePage() {
    const router = useRouter();
    const params = useParams();
    const t = useTranslations("AddSubService");
    const serviceId = params.serviceId;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        is_active: true,
    });
    const [iconFile, setIconFile] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log("Changed field:", name, "=", type === "checkbox" ? checked : value);
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        setIconFile(file);
        console.log("Selected icon file:", file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Submitting form with service_id:", serviceId);

        try {
            const payload = new FormData();
            payload.append("service_id", serviceId);
            payload.append("name", formData.name);
            payload.append("slug", formData.slug);
            payload.append("description", formData.description);
            payload.append("is_active", formData.is_active);

            if (iconFile) {
                payload.append("icon", iconFile);
                console.log("Appended icon to payload:", iconFile.name);
            }

            console.log("Final FormData payload:", Array.from(payload.entries()));

            const response = await createSubService(payload);
            console.log("API response:", response);

            if (response.data) {
                toast.success(t("success", { defaultValue: "Sub-service created successfully." }));
                router.push("/dashboard-superadmin/services");
            } else {
                toast.error(response.message || t("fail", { defaultValue: "Failed to create sub-service." }));
            }
        } catch (error) {
            console.error("Error creating sub-service:", error);
            toast.error(t("error", { defaultValue: "Error creating sub-service." }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                {t("title", { defaultValue: "Add New Sub-Service" })}
            </h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder={t("name", { defaultValue: "Sub-Service Name" })}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="slug"
                    placeholder={t("slug", { defaultValue: "Slug (e.g., carpet-cleaning)" })}
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
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading
                        ? t("creating", { defaultValue: "Creating..." })
                        : t("createBtn", { defaultValue: "Create Sub-Service" })}
                </button>
            </form>
        </div>
    );
}
