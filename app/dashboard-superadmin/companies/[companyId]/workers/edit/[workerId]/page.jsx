"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCompanyWorkers, updateCompanyWorker } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function EditWorkerPage() {
    const t = useTranslations();
    const { companyId, workerId } = useParams();
    const router = useRouter();

    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        full_name: "",
        nationality: "",
        phone: "",
        gender: ""
    });

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const res = await getCompanyWorkers(companyId);
                const foundWorker = res.data.data.find(w => w.id === workerId);
                if (!foundWorker) {
                    toast.error(t("editWorker.notFound", { defaultValue: "Worker not found in this company." }));
                    router.push(`/dashboard-superadmin/companies/${companyId}/workers`);
                    return;
                }
                setWorker(foundWorker);
                setFormData({
                    full_name: foundWorker.full_name || "",
                    nationality: foundWorker.nationality || "",
                    phone: foundWorker.phone || "",
                    gender: foundWorker.gender || ""
                });
            } catch (err) {
                console.error("Error fetching worker:", err);
                toast.error(t("editWorker.fetchError", { defaultValue: "Failed to fetch worker data." }));
            } finally {
                setLoading(false);
            }
        };

        fetchWorker();
    }, [companyId, workerId, router, t]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateCompanyWorker(workerId, formData);
            toast.success(t("editWorker.success", { defaultValue: "Worker updated successfully." }));
            router.push(`/dashboard-superadmin/companies/${companyId}/workers`);
        } catch (err) {
            console.error("Error updating worker:", err);
            toast.error(err.response?.data?.message || t("editWorker.updateError", { defaultValue: "Failed to update worker." }));
        }
    };

    if (loading) return <p>{t("editWorker.loading", { defaultValue: "Loading worker data..." })}</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("editWorker.title", { defaultValue: "Edit Worker" })}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="full_name"
                    placeholder={t("editWorker.fullName", { defaultValue: "Full Name" })}
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                <input
                    type="text"
                    name="nationality"
                    placeholder={t("editWorker.nationality", { defaultValue: "Nationality" })}
                    value={formData.nationality}
                    onChange={handleChange}
                    className={styles.input}
                />
                <input
                    type="text"
                    name="phone"
                    placeholder={t("editWorker.phone", { defaultValue: "Phone" })}
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
                    <option value="">{t("editWorker.selectGender", { defaultValue: "Select Gender" })}</option>
                    <option value="male">{t("editWorker.male", { defaultValue: "Male" })}</option>
                    <option value="female">{t("editWorker.female", { defaultValue: "Female" })}</option>
                </select>
                <button type="submit" className={styles.button}>
                    {t("editWorker.updateButton", { defaultValue: "Update Worker" })}
                </button>
            </form>
        </div>
    );
}
