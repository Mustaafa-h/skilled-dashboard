"use client";

import { useState, useEffect } from "react";
import {
  addCompanyService,
  removeCompanyService,
  addCompanySubService,
  getAllServices,
  getAllSubServices,
} from "@/app/lib/api";
import styles from "@/app/ui/dashboard/products/addProduct/addProduct.module.css";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function AddSubServicePage() {
  const t = useTranslations();

  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [filteredSubServices, setFilteredSubServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [baseCost, setBaseCost] = useState("");
  const [selectedSubServiceIds, setSelectedSubServiceIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const companyId = "6c886af4-701a-4133-b68f-1647ad3efcad";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesResponse = await getAllServices();
        setServices(servicesResponse.data.data);

        const subServicesResponse = await getAllSubServices();
        setSubServices(subServicesResponse.data.data);
      } catch (error) {
        console.error("Fetch services error:", error);
        toast.error("Failed to load services.");
      }
    };
    fetchData();
  }, []);

  const handleContinue = async () => {
    if (!selectedServiceId || !baseCost) {
      toast.error("Please select a main service and enter a base cost.");
      return;
    }

    setLoading(true);
    try {
      const costValue = parseFloat(baseCost) * 1000;
      await addCompanyService(companyId, selectedServiceId, costValue);
      toast.success("Main service associated successfully.");
      const filtered = subServices.filter(
        (sub) => sub.service_id === selectedServiceId
      );
      setFilteredSubServices(filtered);
      setStep(2);
    } catch (error) {
      console.error("Add main service error:", error);
      toast.error("Failed to associate main service.");
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
      toast.error("You must select at least one sub-service. Removing main service.");
      try {
        await removeCompanyService(companyId, selectedServiceId);
        toast.success("Main service removed.");
        setStep(1);
        setSelectedServiceId("");
        setBaseCost("");
      } catch (error) {
        console.error("Remove main service error:", error);
        toast.error("Failed to remove main service.");
      }
      return;
    }

    setLoading(true);
    try {
      for (const subId of selectedSubServiceIds) {
        try {
          await addCompanySubService(companyId, selectedServiceId, subId);
        } catch (innerError) {
          console.error(`Failed to add sub-service ${subId}:`, innerError);
          toast.error(`Sub-service already associated.`);
        }
      }
      toast.success("Sub-services added successfully.");
      setStep(1);
      setSelectedServiceId("");
      setBaseCost("");
      setSelectedSubServiceIds([]);
    } catch (error) {
      console.error("Add sub-services error:", error);
      toast.error("Failed to add sub-services.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {step === 1 && (
          <>
            <label>Select Main Service</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
            >
              <option value="">-- Select a Service --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <label>Base Cost (in thousands IQD)</label>
            <input
              type="number"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              placeholder="e.g., 3 = 3000 IQD"
              required
            />
            <small className={styles.hint}>Enter cost in thousands. E.g., 3 means 3000 IQD.</small>

            <button type="button" onClick={handleContinue} disabled={loading}>
              {loading ? "Processing..." : "Continue to Select Sub-Services"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label>Select Sub-Services</label>
            {filteredSubServices.length > 0 ? (
              <div className={styles.subServiceGrid}>
                {filteredSubServices.map((sub) => (
                  <div
                    key={sub.id}
                    className={`${styles.subServiceCard} ${
                      selectedSubServiceIds.includes(sub.id) ? styles.selected : ""
                    }`}
                    onClick={() => handleSubServiceToggle(sub.id)}
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            ) : (
              <p>No sub-services available for this main service.</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Sub-Services"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
