"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "@/app/ui/superadmin/dashboard/superAdminLayout.module.css";
import { getAllCompanies, getCompanyWorkers } from "@/app/lib/api";

export default function SuperAdminDashboardPage() {
    const [metrics, setMetrics] = useState({
        companies: 0,
        workers: 0,
        admins: 5,
    });
    const [loading, setLoading] = useState(true);

    const fetchMetrics = useCallback(async () => {
        try {
            const companiesRes = await getAllCompanies();
            const companies = companiesRes.data.data || [];
            const totalCompanies = companies.length;

            let totalWorkers = 0;
            await Promise.all(
                companies.map(async (company) => {
                    try {
                        const workersRes = await getCompanyWorkers(company.id);
                        totalWorkers += workersRes.data.data.length;
                    } catch (err) {
                        console.error(`Error fetching workers for company ${company.id}:`, err);
                    }
                })
            );

            setMetrics({
                companies: totalCompanies,
                workers: totalWorkers,
                admins: 5,
                transactions: 12
            });
        } catch (err) {
            console.error("Error fetching SuperAdmin metrics:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return (
        <div className={styles.dashboard}>
            <h1>SuperAdmin Dashboard</h1>
            {loading ? (
                <p>Loading metrics...</p>
            ) : (
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <h3>Total Companies</h3>
                        { <p>{metrics.companies}</p> }
                    </div>
                    <div className={styles.card}>
                        <h3>Total Workers</h3>
                        { <p>{metrics.workers}</p> }
                    </div>
                    <div className={styles.card}>
                        <h3>Total Admins</h3>
                        { <p>{metrics.admins}</p> }
                    </div>
                </div>
            )}
        </div>
    );
}
