"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getAllServices,
    getAllSubServices,
    addCompanyService,
    addCompanySubService,
    removeCompanyService,
} from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function AddCompanyServicePage() {
    const t = useTranslations();
    const { companyId } = useParams();
    const router = useRouter();

    const [services, setServices] = useState([]);
    const [subServices, setSubServices] = useState([]);
    const [filteredSubServices, setFilteredSubServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [baseCost, setBaseCost] = useState("");
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const fetchData = useCallback(async () => {
        try {
            const [servicesRes, subServicesRes] = await Promise.all([
                getAllServices(),
                getAllSubServices(),
            ]);
            setServices(servicesRes.data.data || []);
            setSubServices(subServicesRes.data.data || []);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error(t("addService.fetchError", { defaultValue: "Failed to load services." }));
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleContinue = async () => {
        if (!selectedServiceId || !baseCost) {
            toast.error(t("addService.missingFields", { defaultValue: "Please select a service and enter base cost." }));
            return;
        }
        setLoading(true);
        try {
            const costValue = parseFloat(baseCost) * 1000;
            await addCompanyService(companyId, selectedServiceId, costValue);
            toast.success(t("addService.serviceAdded", { defaultValue: "Service added. Now select sub-services." }));
            const filtered = subServices.filter((sub) => sub.service_id === selectedServiceId);
            setFilteredSubServices(filtered);
            setStep(2);
        } catch (error) {
            console.error("Error adding service:", error);
            toast.error(t("addService.addServiceError", { defaultValue: "Failed to add service." }));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSub = (id) => {
        setSelectedSubServiceIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSubServiceIds.length === 0) {
            toast.error(t("addService.noSubSelected", { defaultValue: "You must select at least one sub-service. Service will be removed." }));
            try {
                await removeCompanyService(companyId, selectedServiceId);
                toast.success(t("addService.serviceRemoved", { defaultValue: "Service removed." }));
                setStep(1);
                setSelectedServiceId("");
                setBaseCost("");
            } catch (error) {
                console.error("Error removing service:", error);
                toast.error(t("addService.removeServiceError", { defaultValue: "Failed to remove service." }));
            }
            return;
        }

        setLoading(true);
        try {
            for (const subId of selectedSubServiceIds) {
                await addCompanySubService(companyId, selectedServiceId, subId);
            }
            toast.success(t("addService.subServicesAdded", { defaultValue: "Sub-services added successfully." }));
            router.push(`/dashboard-superadmin/companies/${companyId}/services`);
        } catch (error) {
            console.error("Error adding sub-services:", error);
            toast.error(t("addService.addSubError", { defaultValue: "Failed to add sub-services." }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("addService.title", { defaultValue: "Add Service to Company" })}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                {step === 1 && (
                    <>
                        <label className={styles.label}>{t("addService.selectService", { defaultValue: "Select Service" })}</label>
                        <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            required
                            className={styles.select}
                        >
                            <option value="">{t("addService.selectOption", { defaultValue: "-- Select a service --" })}</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                        <label className={styles.label}>{t("addService.baseCost", { defaultValue: "Base Cost (in thousands IQD)" })}</label>
                        <input
                            type="number"
                            placeholder={t("addService.baseCostPlaceholder", { defaultValue: "e.g., 5 means 5000 IQD" })}
                            value={baseCost}
                            onChange={(e) => setBaseCost(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={loading}
                            className={styles.button}
                        >
                            {loading
                                ? t("addService.processing", { defaultValue: "Processing..." })
                                : t("addService.continue", { defaultValue: "Continue to Sub-Services" })}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <label className={styles.label}>{t("addService.selectSubServices", { defaultValue: "Select Sub-Services" })}</label>
                        {filteredSubServices.length > 0 ? (
                            <div className={styles.subServiceGrid}>
                                {filteredSubServices.map((sub) => (
                                    <div
                                        key={sub.id}
                                        onClick={() => handleToggleSub(sub.id)}
                                        className={`${styles.subServiceCard} ${
                                            selectedSubServiceIds.includes(sub.id)
                                                ? styles.subServiceCardSelected
                                                : ""
                                        }`}
                                    >
                                        {sub.name}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.noOptions}>
                                {t("addService.noSubAvailable", { defaultValue: "No sub-services available for this service." })}
                            </p>
                        )}
                        <button type="submit" disabled={loading} className={styles.button}>
                            {loading
                                ? t("addService.saving", { defaultValue: "Saving..." })
                                : t("addService.saveSubServices", { defaultValue: "Save Sub-Services" })}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
