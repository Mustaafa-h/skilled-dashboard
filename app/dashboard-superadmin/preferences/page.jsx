"use client";

import { useEffect, useState } from "react";
import { getAllServices } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/preferences/page.module.css";

export default function SuperAdminPreferencesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await getAllServices();
                setServices(data.data || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch services.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) return <p>Loading services...</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Manage Preferences for Services</h2>
            <p className={styles.description}>Click on a service to manage its preferences and options.</p>

            {services.length === 0 ? (
                <p>No services found.</p>
            ) : (
                <div className={styles.grid}>
                    {services.map(service => (
                        <div
                            key={service.id}
                            className={styles.card}
                            onClick={() => router.push(`/dashboard-superadmin/preferences/${service.id}`)}
                        >
                            <h3 className={styles.cardTitle}>{service.name}</h3>
                            <p className={styles.cardDescription}>{service.description || "No description provided."}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
