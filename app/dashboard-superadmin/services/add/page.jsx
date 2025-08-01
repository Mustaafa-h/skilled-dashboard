"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function AddServicePage() {
    const router = useRouter();
    const t = useTranslations("addService");

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        sort_order: 0,
        is_active: true
    });
    const [iconFile, setIconFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log("Changed field:", name, "=", type === "checkbox" ? checked : value);
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        setIconFile(file);
        console.log("Selected icon file:", file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Submitting create service form");

        try {
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("slug", formData.slug);
            payload.append("description", formData.description);
            payload.append("sort_order", formData.sort_order);
            payload.append("is_active", formData.is_active);

            if (iconFile) {
                payload.append("icon", iconFile);
                console.log("Appended icon to payload:", iconFile.name);
            }

            console.log("Final FormData payload:", Array.from(payload.entries()));

            const response = await createService(payload);
            console.log("API response:", response);

            if (response.data?.success) {
                toast.success(t("success", { defaultValue: "Service created successfully." }));
                router.push("/dashboard-superadmin/services");
            } else {
                toast.error(response.data?.message || t("fail", { defaultValue: "Failed to create service." }));
            }
        } catch (error) {
            console.error("Error creating service:", error);
            toast.error(t("error", { defaultValue: "Failed to create service." }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("title", { defaultValue: "Create New Service" })}</h1>
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
                    required
                    className={styles.textarea}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className={styles.input}
                />
                <input
                    type="number"
                    name="sort_order"
                    placeholder={t("sortOrder", { defaultValue: "Sort Order" })}
                    value={formData.sort_order}
                    onChange={handleChange}
                    className={styles.input}
                />
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className={styles.checkbox}
                    />{" "}
                    {t("active", { defaultValue: "Active" })}
                </label>
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading
                        ? t("creating", { defaultValue: "Creating..." })
                        : t("createBtn", { defaultValue: "Create Service" })}
                </button>
            </form>
        </div>
    );
}
