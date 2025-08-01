"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCompany, updateCompany } from "@/app/lib/api";
import toast from "react-hot-toast";
import MapPicker from "@/app/ui/map/MapPicker";
import styles from "@/app/ui/editCompany/editCompany.module.css";
import { useTranslations } from "next-intl";

const EditCompanyBySuperAdmin = () => {
  const t = useTranslations();
  const router = useRouter();
  const { companyId } = useParams();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    about: "",
    status: "pending",
    website_url: "",
    price_range: "",
    is_verified: false,
    lat: "",
    long: ""
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await getCompany(companyId);
        const data = res.data.data;

        console.log("📥 Loaded company data from backend:", data);

        setForm({
          name: data.name || "",
          about: data.about || "",
          status: data.status || "pending",
          website_url: data.website_url || "",
          price_range: data.price_range || "",
          is_verified: data.is_verified || false,
          lat: data.lat || "",
          long: data.long || ""
        });
      } catch (err) {
        toast.error(t("errors.loadCompany", { defaultValue: "Failed to load company data" }));
        console.error("❌ Error loading company:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    console.log("🖼️ Selected logo file:", file);
  };

  const handleMapSelect = ({ lat, lng }) => {
    console.log("📍 Map position selected:", { lat, lng });
    setForm((prev) => ({ ...prev, lat, long: lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("about", form.about);
      payload.append("status", form.status);
      payload.append("website_url", form.website_url);
      payload.append("price_range", form.price_range);
      payload.append("is_verified", form.is_verified);
      payload.append("lat", form.lat);
      payload.append("long", form.long);

      if (logoFile) {
        payload.append("logo", logoFile);
        console.log("🖼️ Appended logo to payload:", logoFile.name);
      }

      console.log("🚀 Submitting FormData:", Array.from(payload.entries()));

      await updateCompany(companyId, payload);
      toast.success(t("messages.updateSuccess", { defaultValue: "Company info updated" }));
      router.push("/dashboard-superadmin/companies");
    } catch (err) {
      toast.error(t("errors.updateCompany", { defaultValue: "Update failed" }));
      console.error("❌ Update error:", err);
    }
  };

  if (loading) return <div className={styles.container}>{t("loading", { defaultValue: "Loading..." })}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("EditCompany.title", { defaultValue: "Edit Company Info" })}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>{t("EditCompany.name", { defaultValue: "Name:" })}</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className={styles.formInput}
          required
        />

        <label>{t("EditCompany.about", { defaultValue: "About:" })}</label>
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          className={styles.formTextarea}
        />

        <label>{t("EditCompany.status", { defaultValue: "Status:" })}</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className={styles.formSelect}
        >
          <option value="pending">{t("Status.pending", { defaultValue: "Pending" })}</option>
          <option value="active">{t("Status.active", { defaultValue: "Active" })}</option>
        </select>

        <label>{t("EditCompany.website", { defaultValue: "Website URL:" })}</label>
        <input
          type="text"
          name="website_url"
          value={form.website_url}
          onChange={handleChange}
          className={styles.formInput}
        />

        <label>{t("EditCompany.logo", { defaultValue: "Logo:" })}</label>
        {logoFile ? (
          <img
            src={URL.createObjectURL(logoFile)}
            alt="Logo preview"
            className={styles.logoPreview}
          />
        ) : null}
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className={styles.formInput}
        />

        <label>{t("EditCompany.priceRange", { defaultValue: "Price Range:" })}</label>
        <input
          type="text"
          name="price_range"
          value={form.price_range}
          onChange={handleChange}
          className={styles.formInput}
        />

        <label>
          <input
            type="checkbox"
            name="is_verified"
            checked={form.is_verified}
            onChange={handleChange}
          />
          {t("EditCompany.verified", { defaultValue: "Verified" })}
        </label>

        <label>{t("EditCompany.location", { defaultValue: "Company Location:" })}</label>
        <MapPicker
          lat={form.lat}
          lng={form.long}
          onLocationSelect={handleMapSelect}
        />

        <button type="submit" className={styles.submitButton}>
          {t("EditCompany.save", { defaultValue: "Save Changes" })}
        </button>
      </form>
    </div>
  );
};

export default EditCompanyBySuperAdmin;
