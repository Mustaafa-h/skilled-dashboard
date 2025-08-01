"use client";

import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import styles from "@/app/ui/dashboard/preferences/preferences.module.css";
import {
  getCompanyPreferences,
  getAllServices,
  getPreferenceTypes,
  createCompanyPreference,
  updateCompanyPreference
} from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from "next-intl";

export default function SuperAdminPreferencesPage() {
  const t = useTranslations();
  const { companyId } = useParams();
  const [services, setServices] = useState([]);
  const [companyPreferences, setCompanyPreferences] = useState([]);
  const [states, setStates] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: cpData } = await getCompanyPreferences(companyId);
        setCompanyPreferences(cpData.data);

        const { data: servicesRes } = await getAllServices();
        const fetchedServices = servicesRes.data;

        const servicePrefs = [];
        for (const service of fetchedServices) {
          const res = await getPreferenceTypes(service.id);
          servicePrefs.push({
            service,
            preferences: res.data.data
          });
        }
        setServices(servicePrefs);

        const initial = {};
        cpData.data.forEach(pref => {
          initial[pref.preference_type_id] = {
            id: pref.id,
            price: pref.per_unit_cost || "",
            isActive: pref.is_available
          };
          if (pref.preference_option_id) {
            initial[pref.preference_option_id] = {
              id: pref.id,
              price: pref.per_unit_cost || "",
              isActive: pref.is_available
            };
          }
        });
        setStates(initial);
      } catch (error) {
        console.error(error);
        toast.error(t("preferences.loadError", { defaultValue: "Failed to load preferences." }));
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchData();
  }, [companyId]);

  const handleSave = async (basePayload, idKey, prefType) => {
    try {
      let costType = "fixed";
      if (prefType === "number") {
        costType = "per_worker";
      } else if (prefType === "single-select") {
        costType = "fixed";
      }

      const payload = {
        ...basePayload,
        cost_type: costType
      };

      if (prefType === "number") {
        delete payload.preference_option_id;
      }

      if (states[idKey]?.id) {
        await updateCompanyPreference(states[idKey].id, payload);
        toast.success(t("preferences.updated", { defaultValue: "Preference updated." }));
      } else {
        const { data } = await createCompanyPreference(payload);
        setStates(prev => ({
          ...prev,
          [idKey]: { ...prev[idKey], id: data.data.id }
        }));
        toast.success(t("preferences.created", { defaultValue: "Preference created." }));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("preferences.saveFailed", { defaultValue: "Save failed." }));
    }
  };

  if (loading) return <p className={styles.loading}>{t("preferences.loading", { defaultValue: "Loading preferences..." })}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("preferences.title", { defaultValue: "Company Preferences" })}</h2>
      {services.map(({ service, preferences }) => (
        <div key={service.id} className={styles.serviceBlock}>
          <h3>{service.name}</h3>
          {preferences.length === 0 ? (
            <p className={styles.noOptions}>{t("preferences.noOptions", { defaultValue: "This service has no preferences." })}</p>
          ) : preferences.map(pref => (
            <div key={pref.id} className={styles.prefBlock}>
              <strong>{pref.name}</strong>
              <p className={styles.prefDescription}>{pref.description}</p>

              {pref.type === 'single-select' && pref.options.length > 0 && pref.options.map(option => (
                <div key={option.id} className={styles.optionRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={states[option.id]?.isActive || false}
                      onChange={e => setStates(prev => ({
                        ...prev,
                        [option.id]: {
                          ...prev[option.id],
                          isActive: e.target.checked
                        }
                      }))}
                    /> {option.display_name} - {option.description}
                  </label>
                  <input
                    type="number"
                    placeholder={t("preferences.price", { defaultValue: "Price" })}
                    value={states[option.id]?.price || ""}
                    onChange={e => setStates(prev => ({
                      ...prev,
                      [option.id]: {
                        ...prev[option.id],
                        price: e.target.value
                      }
                    }))}
                    className={styles.priceInput}
                  />
                  <button onClick={() => handleSave({
                    company_id: companyId,
                    preference_type_id: pref.id,
                    preference_option_id: option.id,
                    is_available: states[option.id]?.isActive || false,
                    per_unit_cost: parseFloat(states[option.id]?.price) || 0
                  }, option.id, pref.type)} className={styles.saveButton}>
                    {t("preferences.save", { defaultValue: "Save" })}
                  </button>
                </div>
              ))}

              {pref.type === 'boolean' && (
                <div className={styles.optionRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={states[pref.id]?.isActive || false}
                      onChange={e => setStates(prev => ({
                        ...prev,
                        [pref.id]: {
                          ...prev[pref.id],
                          isActive: e.target.checked
                        }
                      }))}
                    /> {t("preferences.enable", { defaultValue: "Enable" })} {pref.name}
                  </label>
                  {states[pref.id]?.isActive && (
                    <input
                      type="number"
                      placeholder={t("preferences.costEnabled", { defaultValue: "Cost if enabled" })}
                      value={states[pref.id]?.price || ""}
                      onChange={e => setStates(prev => ({
                        ...prev,
                        [pref.id]: {
                          ...prev[pref.id],
                          price: e.target.value
                        }
                      }))}
                      className={styles.priceInput}
                    />
                  )}
                  <button onClick={() => handleSave({
                    company_id: companyId,
                    preference_type_id: pref.id,
                    is_available: states[pref.id]?.isActive || false,
                    per_unit_cost: parseFloat(states[pref.id]?.price) || 0
                  }, pref.id, pref.type)} className={styles.saveButton}>
                    {t("preferences.save", { defaultValue: "Save" })}
                  </button>
                </div>
              )}

              {pref.type === 'number' && (
                <div className={styles.optionRow}>
                  <label>{t("preferences.baseCost", { defaultValue: "Base Cost Per Unit (e.g., 3 = 3000 IQD)" })}</label>
                  <input
                    type="number"
                    placeholder={t("preferences.baseCostPlaceholder", { defaultValue: "Base Cost Per Unit" })}
                    value={states[pref.id]?.price || ""}
                    onChange={e => setStates(prev => ({
                      ...prev,
                      [pref.id]: {
                        ...prev[pref.id],
                        price: e.target.value
                      }
                    }))}
                    className={styles.priceInput}
                  />
                  <button onClick={() => handleSave({
                    company_id: companyId,
                    preference_type_id: pref.id,
                    is_available: true,
                    per_unit_cost: parseFloat(states[pref.id]?.price) || 0
                  }, pref.id, pref.type)} className={styles.saveButton}>
                    {t("preferences.save", { defaultValue: "Save" })}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
