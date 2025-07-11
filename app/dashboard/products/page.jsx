"use client";

import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import styles from "@/app/ui/dashboard/products/products.module.css";
import { getCompany, getAllServices, removeCompanySubService } from "@/app/lib/api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function ProductsPage() {
  const t = useTranslations();
  const [companyData, setCompanyData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const companyId = "6c886af4-701a-4133-b68f-1647ad3efcad";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companyRes, servicesRes] = await Promise.all([
        getCompany(companyId),
        getAllServices()
      ]);
      setCompanyData(companyRes.data.data);
      setServices(servicesRes.data.data);
      console.log("Fetched company and services data successfully.");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t("fetchError", { defaultValue: "Failed to fetch company data." }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subServiceId) => {
    if (!confirm(t("confirmDelete", { defaultValue: "Are you sure you want to remove this sub-service?" }))) return;
    try {
      await removeCompanySubService(companyId, subServiceId);
      toast.success(t("deleteSuccess", { defaultValue: "Sub-service removed successfully." }));
      fetchData();
    } catch (error) {
      console.error("Error removing sub-service:", error);
      toast.error(t("deleteError", { defaultValue: "Failed to remove sub-service." }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupSubservicesByServiceId = () => {
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

  const groupedSubservices = groupSubservicesByServiceId();

  // Create a mapping for serviceId -> serviceName for fast lookup
  const serviceIdToName = {};
  services.forEach((service) => {
    serviceIdToName[service.id] = service.name;
  });

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h2>Services</h2>
        <Link href="/dashboard/products/add">
          <button className={styles.addButton}>{t("addNewSubService", { defaultValue: "Add New Sub-Service" })}</button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : Object.keys(groupedSubservices).length > 0 ? (
        <div className={styles.cardGrid}>
          {Object.entries(groupedSubservices).map(([serviceId, subservices]) => {
            const service = companyData.companyServices?.find((s) => s.service_id === serviceId);
            const serviceName = serviceIdToName[serviceId] || "Unknown Service";
            return (
              <div className={styles.serviceCard} key={serviceId}>
                <h3>{`Service: ${serviceName}`}</h3>
                <p>{`Base Cost: ${service?.base_cost || "N/A"}`}</p>
                <div className={styles.subServiceList}>
                  {subservices.map((sub) => (
                    <div className={styles.subServiceCard} key={sub.id}>
                      <div>
                        <strong>{sub.name}</strong>
                        <p>{sub.description || "No description"}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className={`${styles.iconButton} ${styles.delete}`}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No sub-services found for this company.</p>
      )}
    </div>
  );
}
