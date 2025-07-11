"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function AddCompanyPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        about: "",
        price_range: "medium",
        website_url: "",
        owner_id: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await createCompany(formData);

            if (response.data.success) {
                toast.success("Company created successfully!");
                router.push("/dashboard-superadmin/companies");
            } else {
                toast.error(response.data.message || "Failed to create company");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "An error occurred while creating the company.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Add New Company</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder="Company Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <textarea
                    name="about"
                    placeholder="About the company"
                    value={formData.about}
                    onChange={handleChange}
                    required
                    className={styles.textarea}
                />
                <input
                    type="url"
                    name="website_url"
                    placeholder="Website URL"
                    value={formData.website_url}
                    onChange={handleChange}
                    className={styles.input}
                />
                <select
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <input
                    type="text"
                    name="owner_id"
                    placeholder="Owner ID (UUID)"
                    value={formData.owner_id}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <button type="submit" disabled={loading} className={styles.button}>
                    {loading ? "Creating..." : "Create Company"}
                </button>
            </form>
        </div>
    );
}
