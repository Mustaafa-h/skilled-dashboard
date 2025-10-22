"use client";

import { useState, useEffect } from "react";
import {
  addCompanyService,
  removeCompanyService,
  addCompanySubService,
  getAllServices,
  getAllSubServices,
  getCompany,
} from "@/app/lib/api";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function AddSubServicePage() {
  const t = useTranslations();

  const [services, setServices] = useState([]);
  const [companyServices, setCompanyServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [filteredSubServices, setFilteredSubServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [baseCost, setBaseCost] = useState("");
  const [selectedSubServiceIds, setSelectedSubServiceIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [companySubserviceIds, setCompanySubserviceIds] = useState([]);

  const {companyId} = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, subServicesResponse, companyRes] = await Promise.all([
          getAllServices(),
          getAllSubServices(),
          getCompany(companyId),
        ]);

        setServices(servicesResponse.data.data);
        setSubServices(subServicesResponse.data.data);

        const companyData = companyRes.data.data;
        setCompanyServices(companyData.companyServices.map((s) => s.service_id));
        setCompanySubserviceIds(companyData.subserviceDetails.map((s) => s.id));
      } catch (error) {
        console.error("❌ Fetch error:", error);
        toast.error(t("loadError"));
      }
    };

    fetchData();
  }, [companyId, t]);

  const handleContinue = async () => {
    if (!selectedServiceId || !baseCost) {
      toast.error(t("selectServiceAndCost"));
      return;
    }

    setLoading(true);
    try {
      const costValue = parseFloat(baseCost) * 1000;
      await addCompanyService(companyId, selectedServiceId, costValue);
      toast.success(t("mainServiceAdded"));

      const relatedSubs = subServices.filter((sub) => sub.service_id === selectedServiceId);
      setFilteredSubServices(relatedSubs);
      setStep(2);
    } catch (error) {
      console.error("❌ Add main service error:", error);
      toast.error(t("mainServiceAddFail"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubServiceToggle = (id) => {
    setSelectedSubServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubServiceIds.length === 0) {
      toast.error(t("mustSelectSub"));
      try {
        await removeCompanyService(companyId, selectedServiceId);
        toast.success(t("mainServiceRemoved"));
        setStep(1);
        setSelectedServiceId("");
        setBaseCost("");
      } catch (error) {
        console.error("❌ Remove main service error:", error);
        toast.error(t("mainServiceRemoveFail"));
      }
      return;
    }

    setLoading(true);
    try {
      for (const subId of selectedSubServiceIds) {
        try {
          await addCompanySubService(companyId, selectedServiceId, subId);
        } catch (innerError) {
          console.warn(`⚠️ Sub-service ${subId} already associated.`, innerError);
          toast.error(t("someSubAlready"));
        }
      }

      toast.success(t("subAddedSuccess"));
      setStep(1);
      setSelectedServiceId("");
      setBaseCost("");
      setSelectedSubServiceIds([]);
    } catch (error) {
      console.error("❌ Add sub-services error:", error);
      toast.error(t("subAddFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {step === 1 && (
          <>
            <label>{t("selectMainService")}</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
            >
              <option value="">{t("selectServicePlaceholder")}</option>
              {services
                .filter((service) => !companyServices.includes(service.id))
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
            </select>

            <label>{t("baseCostLabel")}</label>
            <input
              type="number"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              placeholder={t("baseCostPlaceholder")}
              required
            />
            <small className={styles.hint}>
              {t("actualValue")}: {baseCost ? baseCost * 1000 : 0} IQD
            </small>

            <button type="button" onClick={handleContinue} disabled={loading}>
              {loading ? t("processing") : t("continueToSub")}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label>{t("selectSubservices")}</label>
            {filteredSubServices.length > 0 ? (
              <div className={styles.subServiceGrid}>
                {filteredSubServices.map((sub) => {
                  const isDisabled = companySubserviceIds.includes(sub.id);
                  const isSelected = selectedSubServiceIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      className={`${styles.subServiceCard} ${
                        isSelected ? styles.selected : ""
                      } ${isDisabled ? styles.disabled : ""}`}
                      onClick={() => !isDisabled && handleSubServiceToggle(sub.id)}
                      title={isDisabled ? t("alreadyAdded") : ""}
                    >
                      {sub.name}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>{t("noSubsAvailable")}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? t("saving") : t("saveSubs")}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
