"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createPreferenceOption } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function AddPreferenceOptionPage() {
  const { serviceId, prefTypeId } = useParams();
  const router = useRouter();
  const t = useTranslations();

  const [formData, setFormData] = useState({
    value: "",
    display_name: "",
    display_nameAR: "",
    description: "",
    is_default: false,
    is_active: true,
    display_order: 0,        // ← initialize display_order
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "display_order"
          ? Number(value)
          : value,
    }));
    console.log(
      "Changed field:",
      name,
      "=",
      type === "checkbox"
        ? checked
        : name === "display_order"
        ? Number(value)
        : value
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔎 Submitting form data:", formData);

    if (!formData.value.trim()) {
      toast.error(
        t("addPrefOption.emptyValue", {
          defaultValue: "Value cannot be empty.",
        })
      );
      return;
    }
    if (!formData.display_name.trim()) {
      toast.error(
        t("addPrefOption.emptyName", {
          defaultValue: "Display Name cannot be empty.",
        })
      );
      return;
    }

    const payload = {
      preference_type_id: prefTypeId,
      value: formData.value.trim(),
      display_name: formData.display_name.trim(),
      display_nameAR: formData.display_nameAR.trim() || null,
      description: formData.description.trim() || null,
      is_default: formData.is_default,
      is_active: formData.is_active,
      display_order: formData.display_order,  // ← include display_order
    };

    console.log("📤 Payload to send:", payload);

    setLoading(true);
    try {
      await createPreferenceOption(payload);
      toast.success(
        t("addPrefOption.success", {
          defaultValue: "Preference option created successfully.",
        })
      );
      router.push(`/dashboard-superadmin/preferences/${serviceId}`);
    } catch (error) {
      console.error("❌ Error creating preference option:", error);
      const details = error.response?.data?.details;
      if (details && Array.isArray(details)) {
        details.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          t("addPrefOption.failed", {
            defaultValue: "Failed to create preference option.",
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t("addPrefOption.title", {
          defaultValue: "Create New Preference Option",
        })}
      </h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="value"
          placeholder={t("addPrefOption.valuePlaceholder", {
            defaultValue: "Value (e.g., '3')",
          })}
          value={formData.value}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="text"
          name="display_name"
          placeholder={t("addPrefOption.namePlaceholder", {
            defaultValue: "Display Name (e.g., '3 Workers')",
          })}
          value={formData.display_name}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="text"
          name="display_nameAR"
          placeholder={t("addPrefOption.nameARPlaceholder", {
            defaultValue: "Display Name (Arabic)",
          })}
          value={formData.display_nameAR}
          onChange={handleChange}
          className={styles.input}
        />
        <textarea
          name="description"
          placeholder={t("addPrefOption.description", {
            defaultValue: "Description",
          })}
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
        />

        {/* New display_order field */}
        <input
          type="number"
          name="display_order"
          placeholder={t("displayOrder", { defaultValue: "Display Order" })}
          value={formData.display_order}
          onChange={handleChange}
          className={styles.input}
        />

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            className={styles.checkbox}
          />{' '}
          {t("addPrefOption.defaultOption", {
            defaultValue: "Default Option",
          })}
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className={styles.checkbox}
          />{' '}
          {t("addPrefOption.active", {
            defaultValue: "Active",
          })}
        </label>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading
            ? t("addPrefOption.creating", {
                defaultValue: "Creating...",
              })
            : t("addPrefOption.createBtn", {
                defaultValue: "Create Preference Option",
              })}
        </button>
      </form>
    </div>
  );
}
