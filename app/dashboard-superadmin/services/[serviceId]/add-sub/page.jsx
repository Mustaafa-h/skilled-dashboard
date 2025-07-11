"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { createSubService } from "@/app/lib/api";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function AddSubServicePage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.serviceId;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon_url: "",
        is_active: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                service_id: serviceId,
                ...formData
            };

            const response = await createSubService(payload);

            if (response.data?.success) {
                toast.success("Sub-service created successfully.");
                router.push("/dashboard-superadmin/services");
            } else {
                toast.error(response.data?.message || "Failed to create sub-service.");
            }
        } catch (error) {
            console.error("Error creating sub-service:", error);
            toast.error("Error creating sub-service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Add New Sub-Service</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder="Sub-Service Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="slug"
                    placeholder="Slug (e.g., carpet-cleaning)"
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
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className={styles.checkbox}
                    />
                    Active
                </label>
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading ? "Creating..." : "Create Sub-Service"}
                </button>
            </form>
        </div>
    );
}
