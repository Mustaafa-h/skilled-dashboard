"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSubServiceById, updateSubService } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function EditSubServicePage() {
    const router = useRouter();
    const { subServiceId } = useParams();

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchSubService = async () => {
            try {
                const res = await getSubServiceById(subServiceId);
                const sub = res.data?.data;
                if (!sub) {
                    toast.error("Sub-service not found.");
                    router.push("/dashboard-superadmin/services");
                    return;
                }
                setFormData({
                    name: sub.name || "",
                    description: sub.description || ""
                });
            } catch (error) {
                console.error("Error fetching sub-service:", error);
                toast.error("Failed to fetch sub-service.");
            } finally {
                setLoading(false);
            }
        };

        if (subServiceId) {
            fetchSubService();
        }
    }, [subServiceId, router]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const res = await updateSubService(subServiceId, formData);
            if (res.data?.success) {
                toast.success("Sub-service updated successfully.");
                router.push("/dashboard-superadmin/services");
            } else {
                toast.error(res.data?.message || "Failed to update sub-service.");
            }
        } catch (error) {
            console.error("Error updating sub-service:", error);
            toast.error("Error updating sub-service.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Sub-Service</h1>
            {loading ? (
                <p>Loading sub-service...</p>
            ) : (
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
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        className={styles.textarea}
                    />
                    <button type="submit" disabled={updating} className={styles.button}>
                        {updating ? "Updating..." : "Update Sub-Service"}
                    </button>
                </form>
            )}
        </div>
    );
}
