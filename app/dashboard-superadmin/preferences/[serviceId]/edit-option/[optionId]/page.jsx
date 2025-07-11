"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPreferenceOptionById, updatePreferenceOption } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function EditPreferenceOptionPage() {
    const { serviceId, optionId } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        value: "",
        display_name: "",
        description: "",
        is_default: false
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOption = async () => {
        setLoading(true);
        try {
            const res = await getPreferenceOptionById(optionId);
            const option = res.data?.data;

            if (!option) {
                toast.error("Option not found.");
                router.push(`/dashboard-superadmin/preferences/${serviceId}`);
                return;
            }

            setFormData({
                value: option.value || "",
                display_name: option.display_name || "",
                description: option.description || "",
                is_default: option.is_default || false
            });
        } catch (error) {
            console.error("Error fetching option:", error);
            toast.error("Failed to fetch option data.");
            router.push(`/dashboard-superadmin/preferences/${serviceId}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (optionId) {
            fetchOption();
        }
    }, [optionId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.value.trim() || !formData.display_name.trim()) {
            toast.error("Value and Display Name cannot be empty.");
            return;
        }

        setUpdating(true);
        try {
            const payload = {
                value: formData.value.trim(),
                display_name: formData.display_name.trim(),
                description: formData.description.trim() || null,
                is_default: formData.is_default,
                display_order: 0,
                is_active: true
            };

            await updatePreferenceOption(optionId, payload);
            toast.success("Preference option updated successfully.");
            router.push(`/dashboard-superadmin/preferences/${serviceId}`);
        } catch (error) {
            console.error("Error updating preference option:", error);
            const details = error.response?.data?.details;
            if (details && Array.isArray(details)) {
                details.forEach(msg => toast.error(msg));
            } else {
                toast.error("Failed to update preference option.");
            }
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Edit Preference Option</h2>
            {loading ? (
                <p>Loading option data...</p>
            ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        name="value"
                        placeholder="Value"
                        value={formData.value}
                        onChange={handleChange}
                        required
                        className={styles.input}
                    />
                    <input
                        type="text"
                        name="display_name"
                        placeholder="Display Name"
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
                    <button type="submit" disabled={updating} className={styles.button}>
                        {updating ? "Updating..." : "Update Preference Option"}
                    </button>
                </form>
            )}
        </div>
    );
}
