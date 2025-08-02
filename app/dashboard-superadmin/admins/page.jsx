"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdmins, getAllCompanies, registerCompanyAdmin } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function AdminsPage() {
  const t = useTranslations();
  const router = useRouter();

  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyId: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminsRes, companiesRes] = await Promise.all([
          getAdmins(),
          getAllCompanies(),
        ]);

        console.log("✅ Loaded admins:", adminsRes.data);
        console.log("✅ Loaded companies:", companiesRes.data.data);

        setAdmins(adminsRes.data?.data || []);
        setCompanies(companiesRes.data?.data || []);
      } catch (error) {
        console.error("❌ Error loading data:", error);
        toast.error(t("admins.loadError", { defaultValue: "Failed to load data." }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting new admin:", formData);

    const { name, email,  password, companyId } = formData;
    if (!name || !email || !password || !companyId) {
      toast.error(t("admins.emptyFields", { defaultValue: "All fields are required." }));
      return;
    }

    setSubmitting(true);
    try {
      await registerCompanyAdmin(formData);
      toast.success(t("admins.success", { defaultValue: "Admin registered successfully." }));
      router.refresh();
      setFormData({
        name: "",
        email: "",
        password: "",
        companyId: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("❌ Error registering admin:", error);
      toast.error(t("admins.failed", { defaultValue: "Failed to register admin." }));
    } finally {
      setSubmitting(false);
    }
  };

  const getCompanyName = (companyId) => {
    return companies.find((c) => c.id === companyId)?.name || "-";
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("admins.title", { defaultValue: "Admins" })}</h2>

      <button className={styles.button} onClick={() => setShowForm((prev) => !prev)}>
        {t("admins.addBtn", { defaultValue: "Add Admin" })}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder={t("admins.name", { defaultValue: "Name" })}
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder={t("admins.email", { defaultValue: "Email" })}
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder={t("admins.password", { defaultValue: "Password" })}
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
          />

          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="" disabled>{t("admins.selectCompany", { defaultValue: "Select Company" })}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>

          <button type="submit" disabled={submitting} className={styles.button}>
            {submitting
              ? t("admins.creating", { defaultValue: "Creating..." })
              : t("admins.createBtn", { defaultValue: "Create Admin" })}
          </button>
        </form>
      )}

      {loading ? (
        <p>{t("admins.loading", { defaultValue: "Loading..." })}</p>
      ) : (
        <div className={styles.cardContainer}>
          {admins.map((admin) => (
            <div key={admin.id} className={styles.card}>
              <p><strong>{admin.name}</strong></p>
              <p>{admin.email}</p>
              <p>{admin.phone}</p>
              <p>
                {t("admins.company", { defaultValue: "Company:" })}{" "}
                {getCompanyName(admin.companyId)}
              </p>
              <p>
                {t("admins.role", { defaultValue: "Role:" })}{" "}
                {admin.role}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
