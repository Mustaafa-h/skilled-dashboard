"use client";

import { useEffect, useState } from "react";
import { getAllServices } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/preferences/page.module.css";
import { useTranslations } from "next-intl";

export default function SuperAdminPreferencesPage() {
    const t = useTranslations();
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
                toast.error(t("superPreferences.fetchError", { defaultValue: "Failed to fetch services." }));
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [t]);

    if (loading) return <p>{t("superPreferences.loading", { defaultValue: "Loading services..." })}</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t("superPreferences.title", { defaultValue: "Manage Preferences for Services" })}</h2>
            <p className={styles.description}>
                {t("superPreferences.description", {
                    defaultValue: "Click on a service to manage its preferences and options."
                })}
            </p>

            {services.length === 0 ? (
                <p>{t("superPreferences.noServices", { defaultValue: "No services found." })}</p>
            ) : (
                <div className={styles.grid}>
                    {services.map(service => (
                        <div
                            key={service.id}
                            className={styles.card}
                            onClick={() => router.push(`/dashboard-superadmin/preferences/${service.id}`)}
                        >
                            <h3 className={styles.cardTitle}>{service.name}</h3>
                            <p className={styles.cardDescription}>
                                {service.description || t("superPreferences.noDescription", { defaultValue: "No description provided." })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
