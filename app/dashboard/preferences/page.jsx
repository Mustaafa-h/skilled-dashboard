"use client";

import { useState, useEffect } from 'react';
import styles from '@/app/ui/dashboard/preferences/preferences.module.css';
import {
  getCompanyPreferences,
  getCompanyServices,
  getPreferenceTypes,
  createCompanyPreference,
  updateCompanyPreference
} from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

export default function PreferencesPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [services, setServices] = useState([]);
  const [companyPreferences, setCompanyPreferences] = useState([]);
  const [states, setStates] = useState({});
  const [loading, setLoading] = useState(false);

  const companyId = typeof window !== "undefined"
    ? localStorage.getItem("companyId")
    : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: cpData } = await getCompanyPreferences(companyId);
        console.log('Company preferences response:', cpData);
        setCompanyPreferences(cpData.data);

        const { data: servicesRes } = await getCompanyServices(companyId);
        console.log('company services response:', servicesRes); // <-- array of { id, name? }
        const fetchedServices = Array.isArray(servicesRes) ? servicesRes : [];

        const servicePrefs = [];
        for (const service of fetchedServices) {
          const res = await getPreferenceTypes(service.id);
          console.log('Preference types for service', service.id, res.data);
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
        console.log('Initial states:', initial);
        setStates(initial);

      } catch (error) {
        console.error('fetchData error:', error);
        toast.error(t("loadPreferencesError"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        toast.success(t("preferenceUpdated"));
      } else {
        const { data } = await createCompanyPreference(payload);
        console.log('Created preference:', data);
        setStates(prev => ({
          ...prev,
          [idKey]: { ...prev[idKey], id: data.id }
        }));
        toast.success(t("preferenceCreated"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("saveFailed"));
    }
  };

  if (loading) return <p className={styles.loading}>{t("loadingPreferences")}</p>;

  return (
    <div className={styles.container} dir={locale === "ar" ? "rtl" : "ltr"}>
      <h2 className={styles.title}>{t("companyPreferences")}</h2>

      {services.map(({ service, preferences }, idx) => {
        // ---- Separation header (no extra API calls) ----
        // Prefer any existing name fields; else show the ID as the header.
        const headerLabel =
          (locale === "ar" ? (service.nameAR || service.name) : (service.name || service.nameAR))
          || `Service ${String(service.id).slice(0, 8)}`;

        // Small short id badge
        const shortId = String(service.id).slice(0, 8);

        return (
          <div key={service.id} className={styles.serviceBlock}>
            {/* Divider between services (except first) */}
            {idx > 0 && (
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '24px 0' }} />
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{headerLabel}</h3>
              <code style={{ opacity: 0.6, fontSize: 12 }}>{shortId}</code>
            </div>

            {preferences.length === 0 ? (
              <p className={styles.noOptions}>{t("noPreferences")}</p>
            ) : preferences.map(pref => {
              const displayName = locale === "ar"
                ? pref.nameAR || pref.name
                : pref.name;
              const displayDesc = locale === "ar"
                ? pref.descriptionAR || pref.description
                : pref.description;
              console.log("Rendering pref:", { id: pref.id, displayName, displayDesc });

              return (
                <div key={pref.id} className={styles.prefBlock}>
                  <strong>{displayName}</strong>
                  <p className={styles.prefDescription}>{displayDesc}</p>

                  {/* single-select */}
                  {pref.type === 'single-select' && pref.options.length > 0 && pref.options.map(option => {
                    const optionName = locale === "ar"
                      ? option.display_nameAR || option.display_name
                      : option.display_name;
                    const optionDesc = locale === "ar"
                      ? option.descriptionAR || option.description
                      : option.description;
                    console.log("Rendering option:", { id: option.id, optionName, optionDesc });

                    return (
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
                          /> {optionName} - {optionDesc}
                        </label>
                        <input
                          type="number"
                          placeholder={t("price")}
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
                        <button
                          onClick={() => handleSave({
                            company_id: companyId,
                            preference_type_id: pref.id,
                            preference_option_id: option.id,
                            is_available: states[option.id]?.isActive || false,
                            cost_type: "fixed",
                            per_unit_cost: parseFloat(states[option.id]?.price) || 0
                          }, option.id)}
                          className={styles.saveButton}
                        >
                          {t("save")}
                        </button>
                      </div>
                    );
                  })}

                  {/* boolean */}
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
                        /> {t("enable")} {displayName}
                      </label>
                      {states[pref.id]?.isActive && (
                        <input
                          type="number"
                          placeholder={t("costIfEnabled")}
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
                      <button
                        onClick={() => handleSave({
                          company_id: companyId,
                          preference_type_id: pref.id,
                          is_available: states[pref.id]?.isActive || false,
                          cost_type: "fixed",
                          per_unit_cost: parseFloat(states[pref.id]?.price) || 0
                        }, pref.id)}
                        className={styles.saveButton}
                      >
                        {t("save")}
                      </button>
                    </div>
                  )}

                  {/* number */}
                  {pref.type === 'number' && (
                    <div className={styles.optionRow}>
                      <label>{t("baseCostPerUnitLabel")}</label>
                      <input
                        type="number"
                        placeholder={t("baseCostPerUnitPlaceholder")}
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
                      <button
                        onClick={() => handleSave({
                          company_id: companyId,
                          preference_type_id: pref.id,
                          is_available: true,
                          cost_type: "fixed",
                          per_unit_cost: parseFloat(states[pref.id]?.price) || 0
                        }, pref.id)}
                        className={styles.saveButton}
                      >
                        {t("save")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
