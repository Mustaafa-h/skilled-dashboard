"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCompany } from "@/app/lib/api";
import GallerySection from "./gallery/GallerySection";
import styles from "@/app/ui/superadmin/companies/[companyId]/page.module.css";

export default function SingleCompanyPage() {
    const { companyId } = useParams();
    const router = useRouter();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await getCompany(companyId);
                setCompany(res.data.data);
            } catch (err) {
                console.error("Error fetching company:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [companyId]);

    if (loading) return <p>Loading company data...</p>;
    if (!company) return <p>Company not found.</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{company.name}</h1>

            {/* Action Buttons */}
            <div className={styles.buttonGroup}>
                <button
                    onClick={() => router.push(`/dashboard-superadmin/companies/${companyId}/workers`)}
                    className={styles.button}
                >
                    Manage Workers
                </button>
                <button
                    onClick={() => router.push(`/dashboard-superadmin/companies/${companyId}/services`)}
                    className={styles.button}
                >
                    Manage Services
                </button>
                <button
                    onClick={() => router.push(`/dashboard-superadmin/companies/${companyId}/preferences`)}
                    className={styles.button}
                >
                    Manage Preferences
                </button>
            </div>

            {/* Basic Company Overview */}
            <div className={styles.section}>
                <p><span className={styles.label}>About:</span> <span className={styles.value}>{company.about || "N/A"}</span></p>
                <p><span className={styles.label}>Website:</span> <span className={styles.value}>{company.website_url || "N/A"}</span></p>
                <p><span className={styles.label}>Price Range:</span> <span className={styles.value}>{company.price_range || "N/A"}</span></p>
                <p><span className={styles.label}>Status:</span> <span className={styles.value}>{company.status || "N/A"}</span></p>
                <p><span className={styles.label}>Created At:</span> <span className={styles.value}>{new Date(company.created_at).toLocaleString()}</span></p>
                <p><span className={styles.label}>Updated At:</span> <span className={styles.value}>{new Date(company.updated_at).toLocaleString()}</span></p>
            </div>

            <GallerySection companyId={company.id} />
        </div>
    );
}
