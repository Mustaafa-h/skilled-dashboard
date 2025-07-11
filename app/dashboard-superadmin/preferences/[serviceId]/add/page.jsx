"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createPreferenceType } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function AddPreferenceTypePage() {
    const { serviceId } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        field_name: "",
        type: "single-select",
        description: "",
        is_required: false
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

        if (!formData.name.trim() || !formData.field_name.trim()) {
            toast.error("Name and Field Name cannot be empty.");
            return;
        }

        const validTypes = ["single-select", "multi-select", "number", "boolean"];
        if (!validTypes.includes(formData.type)) {
            toast.error("Invalid type selected.");
            return;
        }

        if (!serviceId) {
            toast.error("Service ID missing from URL.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                field_name: formData.field_name.trim(),
                type: formData.type,
                description: formData.description.trim() || null,
                is_required: formData.is_required,
                display_order: 0,
                is_active: true,
                service_id: serviceId
            };

            await createPreferenceType(payload);

            toast.success("Preference type created successfully.");
            router.push(`/dashboard-superadmin/preferences/${serviceId}`);
        } catch (error) {
            console.error("Error creating preference type:", error);
            const details = error.response?.data?.details;
            if (details && Array.isArray(details)) {
                details.forEach(msg => toast.error(msg));
            } else {
                toast.error("Failed to create preference type.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Create New Preference Type</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder="Preference Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="field_name"
                    placeholder="Field Name (e.g., workers)"
                    value={formData.field_name}
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
                        name="is_required"
                        checked={formData.is_required}
                        onChange={handleChange}
                        className={styles.checkbox}
                    />{" "}
                    Required
                </label>
                <label className={styles.label}>Preference Type:</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="single-select">single-select</option>
                    <option value="multi-select">multi-select</option>
                    <option value="boolean">boolean</option>
                    <option value="number">number</option>
                </select>
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading ? "Creating..." : "Create Preference Type"}
                </button>
            </form>
        </div>
    );
}
