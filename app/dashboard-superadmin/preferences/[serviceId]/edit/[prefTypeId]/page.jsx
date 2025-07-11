"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPreferenceTypeById, updatePreferenceType } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function EditPreferenceTypePage() {
    const { serviceId, prefTypeId } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        field_name: "",
        type: "single-select",
        description: "",
        is_required: false
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchType = async () => {
            try {
                const res = await getPreferenceTypeById(prefTypeId);
                const data = res.data.data;

                setFormData({
                    name: data.name || "",
                    field_name: data.field_name || "",
                    type: data.type || "single-select",
                    description: data.description || "",
                    is_required: data.is_required || false
                });
            } catch (error) {
                console.error("Error fetching preference type:", error);
                toast.error("Failed to fetch preference type.");
                router.push(`/dashboard-superadmin/preferences/${serviceId}`);
            } finally {
                setLoading(false);
            }
        };

        if (prefTypeId) fetchType();
    }, [prefTypeId, router, serviceId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.field_name.trim()) {
            toast.error("Name and Field Name cannot be empty.");
            return;
        }

        const validTypes = ["single-select", "multi-select", "number", "boolean"];
        if (!validTypes.includes(formData.type)) {
            toast.error("Invalid type.");
            return;
        }

        setUpdating(true);
        try {
            const payload = {
                name: formData.name.trim(),
                field_name: formData.field_name.trim(),
                type: formData.type,
                description: formData.description.trim() || null,
                is_required: formData.is_required,
                display_order: 0,
                is_active: true
            };

            await updatePreferenceType(prefTypeId, payload);
            toast.success("Preference type updated successfully.");
            router.push(`/dashboard-superadmin/preferences/${serviceId}`);
        } catch (error) {
            console.error("Error updating preference type:", error);
            const details = error.response?.data?.details;
            if (details && Array.isArray(details)) {
                details.forEach(msg => toast.error(msg));
            } else {
                toast.error("Failed to update preference type.");
            }
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Edit Preference Type</h2>
            {loading ? (
                <p>Loading preference type data...</p>
            ) : (
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
                        placeholder="Field Name"
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
                        <option value="single-select">Single Select</option>
                        <option value="multi-select">Multi Select</option>
                        <option value="boolean">Boolean</option>
                        <option value="number">Number</option>
                    </select>
                    <button type="submit" disabled={updating} className={styles.button}>
                        {updating ? "Updating..." : "Update Preference Type"}
                    </button>
                </form>
            )}
        </div>
    );
}
