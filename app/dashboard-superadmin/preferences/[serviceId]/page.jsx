"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getServiceById,
  getPreferenceTypesByServiceId,
  deletePreferenceType,
  deletePreferenceOption,
} from "@/app/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "@/app/ui/superadmin/preferences/[serviceId]/page.module.css";

export default function ServicePreferencesPage() {
  const { serviceId } = useParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [serviceRes, prefsRes] = await Promise.all([
        getServiceById(serviceId),
        getPreferenceTypesByServiceId(serviceId),
      ]);
      console.log("Service response:", serviceRes.data);
      console.log("Prefs response:", prefsRes.data.data);

      setService(serviceRes.data);

      const cleanedPrefs = (prefsRes.data.data || []).map((pref) => ({
        ...pref,
        options: (pref.options || []).filter(
          (opt) => opt && opt.id && opt.is_active !== false
        ),
      }));
      setPreferences(cleanedPrefs);
    } catch (error) {
      console.error("fetchData error:", error);
      toast.error("Failed to load service preferences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocale(document.cookie.includes("locale=ar") ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (serviceId) fetchData();
  }, [serviceId]);

  const handleDeletePrefType = async (prefTypeId) => {
    if (!confirm("Delete this preference type and its options?")) return;
    try {
      await deletePreferenceType(prefTypeId);
      toast.success("Preference type deleted.");
      fetchData();
    } catch (error) {
      console.error("deletePreferenceType error:", error);
      toast.error("Failed to delete preference type.");
      fetchData();
    }
  };

  const handleDeleteOption = async (optionId) => {
    if (!confirm("Delete this preference option?")) return;
    try {
      await deletePreferenceOption(optionId);
      toast.success("Preference option deleted.");
      fetchData();
    } catch (error) {
      console.error("deletePreferenceOption error:", error);
      toast.error("Failed to delete option.");
      fetchData();
    }
  };

  if (loading) return <p>Loading preferences...</p>;
  if (!service) return <p>Service not found.</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Preferences for: {service.name}</h2>
      <p className={styles.description}>
        {service.description || "No description provided."}
      </p>

      <button
        onClick={() =>
          router.push(`/dashboard-superadmin/preferences/${serviceId}/add`)
        }
        className={styles.addButton}
      >
        + Create New Preference Type
      </button>

      {preferences.length === 0 ? (
        <p>No preferences found for this service.</p>
      ) : (
        preferences.map((pref) => {
          const displayName = locale === "ar" ? pref.nameAR : pref.name;
          const displayDesc =
            locale === "ar" ? pref.descriptionAR : pref.description;

          console.log("Rendering pref:", {
            id: pref.id,
            type: pref.type,
            displayName,
            displayDesc,
          });

          const showAddOption = pref.type !== "number" && pref.type !== "boolean";

          return (
            <div key={pref.id} className={styles.card}>
              <h3 className={styles.prefName}>{displayName}</h3>
              <p className={styles.prefDescription}>
                {displayDesc || "No description provided."}
              </p>

              <div className={styles.buttonGroup}>
                <Link
                  href={`/dashboard-superadmin/preferences/${serviceId}/edit/${pref.id}`}
                >
                  <button className={styles.button}>Edit Type</button>
                </Link>
                <button
                  onClick={() => handleDeletePrefType(pref.id)}
                  className={`${styles.button} ${styles.deleteButton}`}
                >
                  Delete Type
                </button>

                {showAddOption && (
                  <Link
                    href={`/dashboard-superadmin/preferences/${serviceId}/add-option/${pref.id}`}
                  >
                    <button className={styles.button}>+ Add Option</button>
                  </Link>
                )}
              </div>

              <h4 className={styles.optionsTitle}>Options:</h4>
              {pref.options.length === 0 ? (
                <p className={styles.noOptions}>No options available.</p>
              ) : (
                <ul className={styles.optionList}>
                  {pref.options.map((option) => (
                    <li key={option.id} className={styles.optionItem}>
                      {option.display_name} -{" "}
                      {option.description || "No description"}
                      <div className={styles.optionButtonGroup}>
                        <Link
                          href={`/dashboard-superadmin/preferences/${serviceId}/edit-option/${option.id}`}
                        >
                          <button className={styles.button}>Edit Option</button>
                        </Link>
                        <button
                          onClick={() => handleDeleteOption(option.id)}
                          className={`${styles.button} ${styles.deleteButton}`}
                        >
                          Delete Option
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
