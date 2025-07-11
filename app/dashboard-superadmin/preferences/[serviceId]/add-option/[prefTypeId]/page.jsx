"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createPreferenceOption } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function AddPreferenceOptionPage() {
    const { serviceId, prefTypeId } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        value: "",
        display_name: "",
        description: "",
        is_default: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.value.trim()) {
            toast.error("Value cannot be empty.");
            return;
        }
        if (!formData.display_name.trim()) {
            toast.error("Display Name cannot be empty.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                preference_type_id: prefTypeId,
                value: formData.value.trim(),
                display_name: formData.display_name.trim(),
                description: formData.description.trim() || null,
                is_default: formData.is_default,
                display_order: 0,
                is_active: true
            };

            await createPreferenceOption(payload);
            toast.success("Preference option created successfully.");
            router.push(`/dashboard-superadmin/preferences/${serviceId}`);
        } catch (error) {
            console.error("Error creating preference option:", error);
            const details = error.response?.data?.details;
            if (details && Array.isArray(details)) {
                details.forEach((msg) => toast.error(msg));
            } else {
                toast.error("Failed to create preference option.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Create New Preference Option</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="value"
                    placeholder="Value (e.g., '3')"
                    value={formData.value}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="display_name"
                    placeholder="Display Name (e.g., '3 Workers')"
                    value={formData.display_name}
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
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                        className={styles.checkbox}
                    />{" "}
                    Default Option
                </label>
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading ? "Creating..." : "Create Preference Option"}
                </button>
            </form>
        </div>
    );
}
