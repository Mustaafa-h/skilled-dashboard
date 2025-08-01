"use client";

import { useEffect, useState, useCallback } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import styles from "@/app/ui/dashboard/products/products.module.css";
import {
  getCompany,
  getAllServices,
  getAllSubServices,
  removeCompanySubService,
  removeCompanyService,
  addCompanySubService,
} from "@/app/lib/api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function ProductsPage() {
  const t = useTranslations();
  const [companyData, setCompanyData] = useState(null);
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupServiceId, setPopupServiceId] = useState(null);
  const [selectableSubs, setSelectableSubs] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState("");

  const companyId = (typeof window !== "undefined" ? localStorage.getItem("companyId") : null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [companyRes, servicesRes, allSubsRes] = await Promise.all([
        getCompany(companyId),
        getAllServices(),
        getAllSubServices(),
      ]);
      setCompanyData(companyRes.data.data);
      setServices(servicesRes.data.data);
      setSubServices(allSubsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t("fetchDataError"));
    } finally {
      setLoading(false);
    }
  }, [companyId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSub = async (subServiceId) => {
    if (!confirm(t("confirmRemoveSub"))) return;
    try {
      await removeCompanySubService(companyId, subServiceId);
      toast.success(t("subRemoved"));
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("removeSubError"));
    }
  };

  const handleDeleteMainService = async (serviceId) => {
    if (!confirm(t("confirmRemoveService"))) return;

    try {
      const subsToDelete = companyData.subserviceDetails.filter(
        (s) => s.service_id === serviceId
      );

      await Promise.all(
        subsToDelete.map((sub) =>
          removeCompanySubService(companyId, sub.id).catch((err) =>
            console.warn(`Failed to remove subservice ${sub.id}`, err)
          )
        )
      );

      await removeCompanyService(companyId, serviceId);

      toast.success(t("serviceRemoved"));
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("removeServiceError"));
    }
  };

  const handleAddSubService = async () => {
    try {
      await addCompanySubService(companyId, popupServiceId, selectedSubId);
      toast.success(t("subAdded"));
      setPopupServiceId(null);
      setSelectedSubId("");
      fetchData();
    } catch (err) {
      toast.error(t("addSubError"));
    }
  };

  const openSubModal = (serviceId) => {
    setPopupServiceId(serviceId);
    const alreadyAdded = companyData.subserviceDetails
      .filter((s) => s.service_id === serviceId)
      .map((s) => s.id);
    const relatedSubs = subServices.filter((s) => s.service_id === serviceId);
    const available = relatedSubs.filter((s) => !alreadyAdded.includes(s.id));
    setSelectableSubs(available);
  };

  const groupSubservicesByServiceId = () => {
    if (!companyData) return {};
    const grouped = {};
    companyData.subserviceDetails?.forEach((sub) => {
      if (!grouped[sub.service_id]) grouped[sub.service_id] = [];
      grouped[sub.service_id].push(sub);
    });
    return grouped;
  };

  const groupedSubservices = groupSubservicesByServiceId();

  const serviceIdToName = {};
  services.forEach((service) => {
    serviceIdToName[service.id] = service.name;
  });

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h2>{t("services")}</h2>
        <Link href="/dashboard/products/add">
          <button className={styles.addButton}>{t("addNew")}</button>
        </Link>
      </div>

      {loading ? (
        <p>{t("loading")}</p>
      ) : Object.keys(groupedSubservices).length > 0 ? (
        <div className={styles.cardGrid}>
          {Object.entries(groupedSubservices).map(([serviceId, subservices]) => {
            const service = companyData.companyServices?.find((s) => s.service_id === serviceId);
            const serviceName = serviceIdToName[serviceId] || "Unknown";

            return (
              <div className={styles.serviceCard} key={serviceId}>
                <div className={styles.serviceHeader}>
                  <h3>{`${t("services")}: ${serviceName}`}</h3>
                  <div className={styles.serviceActions}>
                    <button
                      className={`${styles.iconButton}`}
                      title={t("add")}
                      onClick={() => openSubModal(serviceId)}
                    >
                      <FiPlus />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.delete}`}
                      title={t("cancel")}
                      onClick={() => handleDeleteMainService(serviceId)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <p>{`${t("baseCost")}: ${service?.base_cost || "N/A"}`}</p>
                <div className={styles.subServiceList}>
                  {subservices.map((sub) => (
                    <div className={styles.subServiceCard} key={sub.id}>
                      <div>
                        <strong>{sub.name}</strong>
                        <p>{sub.description || t("noDescription")}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSub(sub.id)}
                        className={`${styles.iconButton} ${styles.delete}`}
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
        <p>{t("noSubServicesFound")}</p>
      )}

      {popupServiceId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{t("selectSubservice")}</h3>
            <select
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
            >
              <option value="">{t("selectPlaceholder")}</option>
              {selectableSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className={styles.modalActions}>
              <button onClick={handleAddSubService}>{t("add")}</button>
              <button onClick={() => setPopupServiceId(null)}>{t("cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
