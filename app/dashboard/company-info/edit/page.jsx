"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getCompany, updateCompany } from "@/app/lib/api";
import styles from "@/app/ui/editCompany/editCompany.module.css";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const MapPicker = dynamic(() => import("@/app/ui/map/MapPicker"), {
  ssr: false,
});

const EditCompanyInfoPage = () => {
  const router = useRouter();
  const t = useTranslations();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    about: "",
    status: "pending",
    website_url: "",
    price_range: "",
    is_verified: false,
    lat: 33.3152,
    long: 44.3661,
  });
  const [logoFile, setLogoFile] = useState(null);

  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("companyId") : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!companyId) {
          toast.error(t("errorsmissingCompanyId"));
          return;
        }

        const res = await getCompany(companyId);
        const data = res.data.data;
        console.log("✅ Loaded company data:", data);
        setCompany(data);
        setForm({
          name: data.name || "",
          about: data.about || "",
          status: data.status || "pending",
          website_url: data.website_url || "",
          price_range: data.price_range || "",
          is_verified: data.is_verified || false,
          lat: data.lat || 33.3152,
          long: data.long || 44.3661,
        });
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error(t("errorsfetchCompany"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    console.log("🖼️ Selected logo file:", file);
  };

  const handleLocationChange = (coords) => {
    console.log("📍 Map position selected:", coords);
    setForm((prev) => ({ ...prev, lat: coords.lat, long: coords.lng }));
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
      toast.success(t("notificationscompanyUpdated"));
      router.push("/dashboard/company-info");
    } catch (err) {
      console.error("❌ Update error:", err);
      toast.error(t("errorsupdateCompany"));
    }
  };

  if (loading) return <div className={styles.container}>{t("loading")}</div>;
  if (!company) return <div className={styles.container}>{t("companyInfonotFound")}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("companyInfoeditTitle")}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>{t("companyInfoname")}:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className={styles.formInput}
        />

        <label>{t("companyInfoabout")}:</label>
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          className={styles.formTextarea}
        />

        <label>{t("companyInfostatus")}:</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className={styles.formSelect}
        >
          <option value="pending">{t("statusespending")}</option>
          <option value="active">{t("statusesactive")}</option>
        </select>

        <label>{t("companyInfowebsite")}:</label>
        <input
          type="text"
          name="website_url"
          value={form.website_url}
          onChange={handleChange}
          className={styles.formInput}
        />

        <label>{t("companyInfologo")}:</label>
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

        <label>{t("companyInfopriceRange")}:</label>
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
          {t("companyInfoverified")}
        </label>

        <label>{t("companyInfolocation")}</label>
        <div className={styles.mapContainer}>
          <MapPicker
            onLocationSelect={handleLocationChange}
            lat={form.lat}
            lng={form.long}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          {t("actionssaveChanges")}
        </button>
      </form>
    </div>
  );
};

export default EditCompanyInfoPage;
