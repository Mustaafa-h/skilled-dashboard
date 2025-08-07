"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPreferenceOptionById, updatePreferenceOption } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";

export default function EditPreferenceOptionPage() {
  const { serviceId, optionId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    value: "",
    display_name: "",
    display_nameAR: "",
    description: "",
    is_default: false,
    is_active: true,
    display_order: 0,      // ← initialize
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchOption() {
      setLoading(true);
      try {
        const res = await getPreferenceOptionById(optionId);
        const option = res.data;
        if (!option) {
          toast.error("Option not found.");
          return router.push(`/dashboard-superadmin/preferences/${serviceId}`);
        }
        setFormData({
          value: option.value || "",
          display_name: option.display_name || "",
          display_nameAR: option.display_nameAR || "",
          description: option.description || "",
          is_default: option.is_default || false,
          is_active: option.is_active !== false,
          display_order: option.display_order ?? 0,  // ← populate
        });
      } catch (err) {
        console.error("❌ Error fetching option:", err);
        toast.error("Failed to fetch option data.");
        router.push(`/dashboard-superadmin/preferences/${serviceId}`);
      } finally {
        setLoading(false);
      }
    }

    if (optionId) fetchOption();
  }, [optionId, router, serviceId]);

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
      "Changed field:", name, "=",
      type === "checkbox" ? checked :
      name === "display_order" ? Number(value) :
      value
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.value.trim() || !formData.display_name.trim()) {
      toast.error("Value and Display Name cannot be empty.");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        value: formData.value.trim(),
        display_name: formData.display_name.trim(),
        display_nameAR: formData.display_nameAR.trim() || null,
        description: formData.description.trim() || null,
        is_default: formData.is_default,
        is_active: formData.is_active,
        display_order: formData.display_order,  // ← include
      };
      console.log("📤 Updating option with payload:", payload);
      await updatePreferenceOption(optionId, payload);
      toast.success("Preference option updated successfully.");
      router.push(`/dashboard-superadmin/preferences/${serviceId}`);
    } catch (err) {
      console.error("❌ Error updating preference option:", err);
      const details = err.response?.data?.details;
      if (Array.isArray(details)) details.forEach((msg) => toast.error(msg));
      else toast.error("Failed to update preference option.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Preference Option</h2>
      {loading ? (
        <p>Loading option data...</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="value"
            placeholder="Value"
            value={formData.value}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="text"
            name="display_name"
            placeholder="Display Name"
            value={formData.display_name}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="text"
            name="display_nameAR"
            placeholder="Display Name (Arabic)"
            value={formData.display_nameAR}
            onChange={handleChange}
            className={styles.input}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
          />

          {/* New display_order field */}
          <input
            type="number"
            name="display_order"
            placeholder="Display Order"
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
            /> Default Option
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className={styles.checkbox}
            /> Active
          </label>

          <button type="submit" disabled={updating} className={styles.button}>
            {updating ? "Updating..." : "Update Preference Option"}
          </button>
        </form>
      )}
    </div>
  );
}
