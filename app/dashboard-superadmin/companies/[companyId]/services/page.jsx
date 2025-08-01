"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    getCompany,
    getAllServices,
    removeCompanySubService
} from "@/app/lib/api";
import styles from "@/app/ui/superadmin/companies/[companyId]/services/page.module.css";
import { useTranslations } from "next-intl";

export default function CompanyServicesPage() {
    const t = useTranslations();
    const { companyId } = useParams();
    const router = useRouter();

    const [companyData, setCompanyData] = useState(null);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [companyRes, servicesRes] = await Promise.all([
                getCompany(companyId),
                getAllServices()
            ]);
            setCompanyData(companyRes.data.data);
            setAllServices(servicesRes.data.data);
        } catch (error) {
            console.error("Error fetching company services:", error);
            toast.error(t("companyServices.loadError", { defaultValue: "Failed to load company services." }));
        } finally {
            setLoading(false);
        }
    }, [companyId, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteSubService = async (subServiceId) => {
        if (!confirm(t("companyServices.confirmDelete", { defaultValue: "Are you sure you want to remove this sub-service?" }))) return;
        try {
            await removeCompanySubService(companyId, subServiceId);
            toast.success(t("companyServices.deleteSuccess", { defaultValue: "Sub-service removed successfully." }));
            fetchData();
        } catch (error) {
            console.error("Error removing sub-service:", error);
            toast.error(t("companyServices.deleteError", { defaultValue: "Failed to remove sub-service." }));
        }
    };

    const groupSubservicesByService = () => {
        if (!companyData) return {};
        const grouped = {};
        companyData.subserviceDetails?.forEach((sub) => {
            if (!grouped[sub.service_id]) {
                grouped[sub.service_id] = [];
            }
            grouped[sub.service_id].push(sub);
        });
        return grouped;
    };

    const groupedSubservices = groupSubservicesByService();

    const serviceIdToName = {};
    allServices.forEach((service) => {
        serviceIdToName[service.id] = service.name;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {t("companyServices.title", { defaultValue: "Services for" })} {companyData?.name || t("companyServices.company", { defaultValue: "Company" })}
                </h1>
                <Link href={`/dashboard-superadmin/companies/${companyId}/services/add`}>
                    <button className={styles.addButton}>
                        {t("companyServices.addService", { defaultValue: "Add New Service" })}
                    </button>
                </Link>
            </div>

            {loading ? (
                <p>{t("companyServices.loading", { defaultValue: "Loading services..." })}</p>
            ) : Object.keys(groupedSubservices).length === 0 ? (
                <p>{t("companyServices.noServices", { defaultValue: "No services/sub-services associated with this company yet." })}</p>
            ) : (
                <div className={styles.grid}>
                    {Object.entries(groupedSubservices).map(([serviceId, subservices]) => {
                        const service = companyData.companyServices?.find((s) => s.service_id === serviceId);
                        const serviceName = serviceIdToName[serviceId] || t("companyServices.unknownService", { defaultValue: "Unknown Service" });
                        return (
                            <div key={serviceId} className={styles.card}>
                                <h3 className={styles.serviceName}>
                                    {t("companyServices.service", { defaultValue: "Service:" })} {serviceName}
                                </h3>
                                <p className={styles.baseCost}>
                                    {t("companyServices.baseCost", { defaultValue: "Base Cost:" })} {service?.base_cost || t("companyServices.na", { defaultValue: "N/A" })}
                                </p>
                                <div className={styles.subServiceList}>
                                    {subservices.map((sub) => (
                                        <div key={sub.id} className={styles.subServiceItem}>
                                            <div>
                                                <strong>{sub.name}</strong>
                                                <p className={styles.subDescription}>
                                                    {sub.description || t("companyServices.noDescription", { defaultValue: "No description" })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSubService(sub.id)}
                                                className={styles.removeButton}
                                            >
                                                {t("companyServices.remove", { defaultValue: "Remove" })}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
