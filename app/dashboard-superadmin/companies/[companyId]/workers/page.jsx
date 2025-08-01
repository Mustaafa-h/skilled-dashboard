"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getCompanyWorkers,
    deleteCompanyWorker
} from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/companies/[companyId]/workers/page.module.css";
import { useTranslations } from "next-intl";

export default function CompanyWorkersPage() {
    const t = useTranslations();
    const { companyId } = useParams();
    const router = useRouter();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkers = async () => {
        try {
            const res = await getCompanyWorkers(companyId);
            setWorkers(res.data.data || []);
        } catch (err) {
            console.error("Error fetching workers:", err);
            toast.error(t("workers.fetchError", { defaultValue: "Failed to fetch workers." }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, [companyId]);

    const handleDeleteWorker = async (workerId) => {
        if (!confirm(t("workers.confirmDelete", { defaultValue: "Are you sure you want to delete this worker?" }))) return;
        try {
            await deleteCompanyWorker(workerId);
            toast.success(t("workers.deleteSuccess", { defaultValue: "Worker deleted successfully." }));
            fetchWorkers();
        } catch (err) {
            console.error("Error deleting worker:", err);
            toast.error(t("workers.deleteError", { defaultValue: "Failed to delete worker." }));
        }
    };

    const handleAddWorker = () => {
        router.push(`/dashboard-superadmin/companies/${companyId}/workers/add`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("workers.title", { defaultValue: "Company Workers" })}</h1>
            <button
                onClick={handleAddWorker}
                className={styles.addButton}
            >
                + {t("workers.addButton", { defaultValue: "Add Worker" })}
            </button>

            {loading ? (
                <p>{t("workers.loading", { defaultValue: "Loading workers..." })}</p>
            ) : workers.length === 0 ? (
                <p>{t("workers.empty", { defaultValue: "No workers found for this company." })}</p>
            ) : (
                <div className={styles.grid}>
                    {workers.map((worker) => (
                        <div key={worker.id} className={styles.card}>
                            <p><strong>{t("workers.name", { defaultValue: "Name:" })}</strong> {worker.full_name}</p>
                            <p><strong>{t("workers.phone", { defaultValue: "Phone:" })}</strong> {worker.phone}</p>
                            <p><strong>{t("workers.nationality", { defaultValue: "Nationality:" })}</strong> {worker.nationality}</p>
                            <p><strong>{t("workers.gender", { defaultValue: "Gender:" })}</strong> {worker.gender}</p>
                            <p><strong>{t("workers.status", { defaultValue: "Status:" })}</strong> {worker.is_active ? t("workers.active", { defaultValue: "Active" }) : t("workers.inactive", { defaultValue: "Inactive" })}</p>
                            <div className={styles.buttonGroup}>
                                <button
                                    onClick={() => router.push(`/dashboard-superadmin/companies/${companyId}/workers/edit/${worker.id}`)}
                                    className={`${styles.button} ${styles.editButton}`}
                                >
                                    {t("workers.edit", { defaultValue: "Edit" })}
                                </button>
                                <button
                                    onClick={() => handleDeleteWorker(worker.id)}
                                    className={`${styles.button} ${styles.deleteButton}`}
                                >
                                    {t("workers.delete", { defaultValue: "Delete" })}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
