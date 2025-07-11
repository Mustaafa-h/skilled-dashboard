"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addCompanyWorker } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function AddWorkerPage() {
    const { companyId } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        full_name: "",
        nationality: "",
        phone: "",
        gender: "male",
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
        setLoading(true);

        try {
            await addCompanyWorker(companyId, formData);
            toast.success("Worker added successfully.");
            router.push(`/dashboard-superadmin/companies/${companyId}/workers`);
        } catch (error) {
            console.error("Error adding worker:", error);
            toast.error("Failed to add worker.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Add New Worker</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="nationality"
                    placeholder="Nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className={styles.input}
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                />
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>

                <button type="submit" disabled={loading} className={styles.button}>
                    {loading ? "Adding..." : "Add Worker"}
                </button>
            </form>
        </div>
    );
}
