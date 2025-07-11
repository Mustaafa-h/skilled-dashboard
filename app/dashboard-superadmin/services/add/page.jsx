"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function AddServicePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon_url: "",
        image_url: "",
        sort_order: 0,
        is_active: true
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createService(formData);
            toast.success("Service created successfully.");
            router.push("/dashboard-superadmin/services");
        } catch (error) {
            console.error("Error creating service:", error);
            toast.error("Failed to create service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create New Service</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder="Service Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="slug"
                    placeholder="Slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className={styles.textarea}
                />
                <input
                    type="url"
                    name="icon_url"
                    placeholder="Icon URL"
                    value={formData.icon_url}
                    onChange={handleChange}
                    className={styles.input}
                />
                <input
                    type="url"
                    name="image_url"
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={handleChange}
                    className={styles.input}
                />
                <input
                    type="number"
                    name="sort_order"
                    placeholder="Sort Order"
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
                    Active
                </label>
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading ? "Creating..." : "Create Service"}
                </button>
            </form>
        </div>
    );
}
