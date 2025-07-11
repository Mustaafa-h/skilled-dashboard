"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getCompanyWorkers,
    deleteCompanyWorker
} from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/companies/[companyId]/workers/page.module.css";

export default function CompanyWorkersPage() {
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
            toast.error("Failed to fetch workers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, [companyId]);

    const handleDeleteWorker = async (workerId) => {
        if (!confirm("Are you sure you want to delete this worker?")) return;
        try {
            await deleteCompanyWorker(workerId);
            toast.success("Worker deleted successfully.");
            fetchWorkers();
        } catch (err) {
            console.error("Error deleting worker:", err);
            toast.error("Failed to delete worker.");
        }
    };

    const handleAddWorker = () => {
        router.push(`/dashboard-superadmin/companies/${companyId}/workers/add`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Company Workers</h1>
            <button
                onClick={handleAddWorker}
                className={styles.addButton}
            >
                + Add Worker
            </button>

            {loading ? (
                <p>Loading workers...</p>
            ) : workers.length === 0 ? (
                <p>No workers found for this company.</p>
            ) : (
                <div className={styles.grid}>
                    {workers.map((worker) => (
                        <div
                            key={worker.id}
                            className={styles.card}
                        >
                            <p><strong>Name:</strong> {worker.full_name}</p>
                            <p><strong>Phone:</strong> {worker.phone}</p>
                            <p><strong>Nationality:</strong> {worker.nationality}</p>
                            <p><strong>Gender:</strong> {worker.gender}</p>
                            <p><strong>Status:</strong> {worker.is_active ? "Active" : "Inactive"}</p>
                            <div className={styles.buttonGroup}>
                                <button
                                    onClick={() =>
                                        router.push(`/dashboard-superadmin/companies/${companyId}/workers/edit/${worker.id}`)
                                    }
                                    className={`${styles.button} ${styles.editButton}`}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteWorker(worker.id)}
                                    className={`${styles.button} ${styles.deleteButton}`}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
