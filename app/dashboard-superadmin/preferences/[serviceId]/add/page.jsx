"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createPreferenceType } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function AddPreferenceTypePage() {
  const t = useTranslations();
  const { serviceId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    nameAR: "",
    field_name: "",
    type: "single-select",
    description: "",
    descriptionAR: "",
    is_required: false,
    is_active: true,
    display_order: 0,              // ← new field
  });

  const [validationRules, setValidationRules] = useState({
    min: 1,
    max: 5,
    default: 1,
    step: 1,
    minLength: 3,
    maxLength: 50,
    maxSelections: 3,
  });

  const [options, setOptions] = useState([
    { value: "", display_name: "", display_nameAR: "", description: "", is_default: false, is_active: true }
  ]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
               name === "display_order" ? Number(value) :
               value,
    }));
  };

  const handleValidationChange = (e) => {
    const { name, value } = e.target;
    setValidationRules((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleOptionChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updated = [...options];
    updated[index][name] = type === "checkbox" ? checked : value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { value: "", display_name: "", display_nameAR: "", description: "", is_default: false, is_active: true },
    ]);
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting formData:", formData);
    console.log("📏 Validation Rules:", validationRules);
    console.log("📋 Options:", options);

    if (!formData.name.trim() || !formData.field_name.trim()) {
      toast.error(t("addPrefType.emptyFields", { defaultValue: "Name and Field Name cannot be empty." }));
      return;
    }

    if (!serviceId) {
      toast.error(t("addPrefType.missingServiceId", { defaultValue: "Service ID missing from URL." }));
      return;
    }

    const payload = {
      name: formData.name.trim(),
      nameAR: formData.nameAR.trim() || null,
      field_name: formData.field_name.trim(),
      type: formData.type,
      description: formData.description.trim() || null,
      descriptionAR: formData.descriptionAR.trim() || null,
      is_required: formData.is_required,
      is_active: formData.is_active,
      display_order: formData.display_order,    // ← include dynamic display_order
      service_id: serviceId,
    };

    if (formData.type === "number") {
      payload.validation_rules = validationRules;
    } else if (["single-select", "multi-select"].includes(formData.type)) {
      payload.options = options.map(opt => ({
        ...opt,
        value: opt.value.trim(),
        display_name: opt.display_name.trim(),
        display_nameAR: opt.display_nameAR.trim() || "",
        description: opt.description.trim() || null,
      }));
    }

    console.log("📦 Final Payload:", payload);
    setLoading(true);
    try {
      await createPreferenceType(payload);
      toast.success(t("addPrefType.success", { defaultValue: "Preference type created successfully." }));
      router.push(`/dashboard-superadmin/preferences/${serviceId}`);
    } catch (error) {
      console.error("❌ Error:", error);
      const details = error.response?.data?.details;
      if (details && Array.isArray(details)) {
        details.forEach(msg => toast.error(msg));
      } else {
        toast.error(t("addPrefType.failed", { defaultValue: "Failed to create preference type." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("addPrefType.title", { defaultValue: "Create New Preference Type" })}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Core Fields */}
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className={styles.input} />
        <input type="text" name="nameAR" placeholder="Name (Arabic)" value={formData.nameAR} onChange={handleChange} className={styles.input} />
        <input type="text" name="field_name" placeholder="Field Name" value={formData.field_name} onChange={handleChange} className={styles.input} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className={styles.textarea} />
        <textarea name="descriptionAR" placeholder="Description (Arabic)" value={formData.descriptionAR} onChange={handleChange} className={styles.textarea} />

        {/* New display_order field */}
        <input
          type="number"
          name="display_order"
          placeholder={t("displayOrder", { defaultValue: "Display Order" })}
          value={formData.display_order}
          onChange={handleChange}
          className={styles.input}
        />

        {/* Checkboxes */}
        <label className={styles.checkboxLabel}>
          <input type="checkbox" name="is_required" checked={formData.is_required} onChange={handleChange} />{" "}
          {t("addPrefType.required", { defaultValue: "Required" })}
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />{" "}
          {t("addPrefType.active", { defaultValue: "Active" })}
        </label>

        {/* Type Selection */}
        <label className={styles.label}>{t("addPrefType.prefType", { defaultValue: "Preference Type:" })}</label>
        <select name="type" value={formData.type} onChange={handleChange} className={styles.select}>
          <option value="single-select">single-select</option>
          <option value="multi-select">multi-select</option>
          <option value="boolean">boolean</option>
          <option value="number">number</option>
        </select>

        {/* Conditional Fields */}
        {formData.type === "number" && (
          <div className={styles.section}>
            <h4>{t("addPrefType.validationRules", { defaultValue: "Validation Rules" })}</h4>
            {Object.keys(validationRules).map((rule) => (
              <input
                key={rule}
                type="number"
                name={rule}
                placeholder={rule}
                value={validationRules[rule]}
                onChange={handleValidationChange}
                className={styles.input}
              />
            ))}
          </div>
        )}

        {["single-select", "multi-select"].includes(formData.type) && (
          <div className={styles.section}>
            <h4>{t("addPrefType.options", { defaultValue: "Options" })}</h4>
            {options.map((opt, i) => (
              <div key={i} className={styles.optionBlock}>
                <input type="text" name="value" placeholder="Value" value={opt.value} onChange={(e) => handleOptionChange(i, e)} className={styles.input} />
                <input type="text" name="display_name" placeholder="Display Name" value={opt.display_name} onChange={(e) => handleOptionChange(i, e)} className={styles.input} />
                <input type="text" name="display_nameAR" placeholder="Display Name (Arabic)" value={opt.display_nameAR} onChange={(e) => handleOptionChange(i, e)} className={styles.input} />
                <textarea name="description" placeholder="Description" value={opt.description} onChange={(e) => handleOptionChange(i, e)} className={styles.textarea} />
                <label>
                  <input type="checkbox" name="is_default" checked={opt.is_default} onChange={(e) => handleOptionChange(i, e)} />{" "}
                  {t("addPrefType.default", { defaultValue: "Default" })}
                </label>
                <label>
                  <input type="checkbox" name="is_active" checked={opt.is_active} onChange={(e) => handleOptionChange(i, e)} />{" "}
                  {t("addPrefType.activeOption", { defaultValue: "Active" })}
                </label>
                {options.length > 1 && (
                  <button type="button" onClick={() => removeOption(i)}>
                    {t("addPrefType.remove", { defaultValue: "Remove" })}
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption}>
              {t("addPrefType.addOption", { defaultValue: "Add More Option" })}
            </button>
          </div>
        )}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading
            ? t("addPrefType.creating", { defaultValue: "Creating..." })
            : t("addPrefType.createBtn", { defaultValue: "Create Preference Type" })}
        </button>
      </form>
    </div>
  );
}
