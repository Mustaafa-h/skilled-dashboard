"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getPreferenceTypeById,
  updatePreferenceType,
} from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function EditPreferenceTypePage() {
  const { serviceId, prefTypeId } = useParams();
  const router = useRouter();
  const t = useTranslations();

  const [formData, setFormData] = useState({
    name: "",
    nameAR: "",
    field_name: "",
    type: "single-select",
    description: "",
    descriptionAR: "",
    is_required: false,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchType = async () => {
      try {
        const res = await getPreferenceTypeById(prefTypeId);
        const data = res.data;

        console.log("📥 Loaded preference type:", data);

        setFormData({
          name: data.name || "",
          nameAR: data.nameAR || "",
          field_name: data.field_name || "",
          type: data.type || "single-select",
          description: data.description || "",
          descriptionAR: data.descriptionAR || "",
          is_required: data.is_required || false,
          is_active: data.is_active !== false, // default to true
        });
      } catch (error) {
        console.error("❌ Error fetching preference type:", error);
        toast.error(
          t("editPrefType.fetchError", {
            defaultValue: "Failed to fetch preference type.",
          })
        );
        router.push(`/dashboard-superadmin/preferences/${serviceId}`);
      } finally {
        setLoading(false);
      }
    };

    if (prefTypeId) fetchType();
  }, [prefTypeId, router, serviceId, t]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📝 Form before update:", formData);

    if (!formData.name.trim() || !formData.field_name.trim()) {
      toast.error(
        t("editPrefType.emptyFields", {
          defaultValue: "Name and Field Name cannot be empty.",
        })
      );
      return;
    }

    const validTypes = ["single-select", "multi-select", "number", "boolean"];
    if (!validTypes.includes(formData.type)) {
      toast.error(
        t("editPrefType.invalidType", {
          defaultValue: "Invalid type.",
        })
      );
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        name: formData.name.trim(),
        nameAR: formData.nameAR.trim() || null,
        field_name: formData.field_name.trim(),
        type: formData.type,
        description: formData.description.trim() || null,
        descriptionAR: formData.descriptionAR.trim() || null,
        is_required: formData.is_required,
        is_active: formData.is_active,
        display_order: 0,
      };

      console.log("📤 Payload to update:", payload);

      await updatePreferenceType(prefTypeId, payload);

      toast.success(
        t("editPrefType.success", {
          defaultValue: "Preference type updated successfully.",
        })
      );
      router.push(`/dashboard-superadmin/preferences/${serviceId}`);
    } catch (error) {
      console.error("❌ Error updating preference type:", error);
      const details = error.response?.data?.details;
      if (details && Array.isArray(details)) {
        details.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          t("editPrefType.failed", {
            defaultValue: "Failed to update preference type.",
          })
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t("editPrefType.title", {
          defaultValue: "Edit Preference Type",
        })}
      </h2>
      {loading ? (
        <p>
          {t("editPrefType.loading", {
            defaultValue: "Loading preference type data...",
          })}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder={t("editPrefType.name", {
              defaultValue: "Preference Name",
            })}
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="text"
            name="nameAR"
            placeholder={t("editPrefType.nameAR", {
              defaultValue: "Preference Name (Arabic)",
            })}
            value={formData.nameAR}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="field_name"
            placeholder={t("editPrefType.fieldName", {
              defaultValue: "Field Name",
            })}
            value={formData.field_name}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <textarea
            name="description"
            placeholder={t("editPrefType.description", {
              defaultValue: "Description",
            })}
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
          />
          <textarea
            name="descriptionAR"
            placeholder={t("editPrefType.descriptionAR", {
              defaultValue: "Description (Arabic)",
            })}
            value={formData.descriptionAR}
            onChange={handleChange}
            className={styles.textarea}
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="is_required"
              checked={formData.is_required}
              onChange={handleChange}
              className={styles.checkbox}
            />{" "}
            {t("editPrefType.required", { defaultValue: "Required" })}
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className={styles.checkbox}
            />{" "}
            {t("editPrefType.active", { defaultValue: "Active" })}
          </label>

          <label className={styles.label}>
            {t("editPrefType.typeLabel", {
              defaultValue: "Preference Type:",
            })}
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="single-select">
              {t("editPrefType.single", {
                defaultValue: "Single Select",
              })}
            </option>
            <option value="multi-select">
              {t("editPrefType.multi", {
                defaultValue: "Multi Select",
              })}
            </option>
            <option value="boolean">
              {t("editPrefType.boolean", {
                defaultValue: "Boolean",
              })}
            </option>
            <option value="number">
              {t("editPrefType.number", {
                defaultValue: "Number",
              })}
            </option>
          </select>

          <button type="submit" disabled={updating} className={styles.button}>
            {updating
              ? t("editPrefType.updating", {
                  defaultValue: "Updating...",
                })
              : t("editPrefType.updateBtn", {
                  defaultValue: "Update Preference Type",
                })}
          </button>
        </form>
      )}
    </div>
  );
}
