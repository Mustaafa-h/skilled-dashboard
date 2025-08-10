"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const MapPicker = dynamic(() => import("@/app/ui/map/MapPicker"), { ssr: false });

export default function AddCompanyPage() {
  const t = useTranslations();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    about: "",
    price_range: "medium",
    owner_id: ""
  });
  const [logoFile, setLogoFile] = useState(null);
  const [location, setLocation] = useState({ lat: 33.3152, lng: 44.3661 });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Changed field:", name, "=", value);
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    console.log("Selected logo file:", file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting company form with:", formData);
    console.log("Location selected:", location);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("about", formData.about);
      payload.append("owner_id", formData.owner_id);
      payload.append("price_range", formData.price_range);
      payload.append("lat", location.lat);
      payload.append("long", location.lng);
      payload.append("status", "pending");

      if (logoFile) {
        payload.append("logo", logoFile);
        console.log("Appended logo file to payload:", logoFile.name);
      }

      console.log("Final FormData payload:");
      for (let [key, val] of payload.entries()) {
        console.log(key, val);
      }

      const response = await createCompany(payload);
      console.log("API response:", response);

      if (response.data.success) {
        console.log(response.data)
        toast.success(t("addCompany.success", { defaultValue: "Company created successfully!" }));
        router.push("/dashboard-superadmin/companies");
      } else {
        toast.error(response.data.message || t("addCompany.error", { defaultValue: "Failed to create company" }));
      }
    } catch (error) {
      console.error("Create company error:", error);
      toast.error(
        error.response?.data?.message ||
        t("addCompany.genericError", { defaultValue: "An error occurred while creating the company." })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("addCompany.title", { defaultValue: "Add New Company" })}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder={t("addCompany.namePlaceholder", { defaultValue: "Company Name" })}
          value={formData.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <textarea
          name="about"
          placeholder={t("addCompany.aboutPlaceholder", { defaultValue: "About the company" })}
          value={formData.about}
          onChange={handleChange}
          required
          className={styles.textarea}
        />
        <select
          name="price_range"
          value={formData.price_range}
          onChange={handleChange}
          className={styles.input}
        >
          <option value="low">{t("Price.low", { defaultValue: "Low" })}</option>
          <option value="medium">{t("Price.medium", { defaultValue: "Medium" })}</option>
          <option value="high">{t("Price.high", { defaultValue: "High" })}</option>
        </select>
        <input
          type="text"
          name="owner_id"
          placeholder={t("addCompany.ownerIdPlaceholder", { defaultValue: "Owner ID (UUID)" })}
          value={formData.owner_id}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className={styles.input}
        />

        {/* 🌍 Map Picker */}
        <div style={{ marginBottom: "1rem" }}>
          <MapPicker lat={location.lat} lng={location.lng} onChange={setLocation} />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading
            ? t("addCompany.creating", { defaultValue: "Creating..." })
            : t("addCompany.create", { defaultValue: "Create Company" })}
        </button>
      </form>
    </div>
  );
}
