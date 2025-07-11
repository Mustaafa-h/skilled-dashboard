"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { getServiceById, updateService } from "@/app/lib/api";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function EditServicePage() {
    const router = useRouter();
    const { serviceId } = useParams();

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon_url: "",
        image_url: "",
        is_active: true
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await getServiceById(serviceId);
                const data = response.data?.data;
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
                toast.error("Failed to fetch service data.");
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [serviceId]);

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
            const response = await updateService(serviceId, formData);
            if (response.data?.success) {
                toast.success("Service updated successfully.");
                router.push("/dashboard-superadmin/services");
            } else {
                toast.error(response.data?.message || "Failed to update service.");
            }
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error("Error updating service.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Service</h1>
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
                    {loading ? "Updating..." : "Update Service"}
                </button>
            </form>
        </div>
    );
}
