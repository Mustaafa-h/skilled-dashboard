"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdmins, registerCompanyAdmin } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function CompanyAdminsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("companyId") : null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyId: companyId || "",
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await getAdmins();
        const filtered = res.data.data.filter(
          (admin) => admin.companyId === companyId
        );
        console.log("✅ Filtered admins:", filtered);
        setAdmins(filtered);
      } catch (error) {
        console.error("❌ Failed to fetch admins:", error);
        toast.error(t("admins.loadError", { defaultValue: "Failed to load admins." }));
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchAdmins();
    }
  }, [t, companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting new admin:", formData);

    if (!formData.name || !formData.email || !formData.password) {
      toast.error(t("admins.emptyFields", { defaultValue: "All fields are required." }));
      return;
    }

    setSubmitting(true);
    try {
      await registerCompanyAdmin(formData);
      toast.success(t("admins.success", { defaultValue: "Admin registered successfully." }));
      router.refresh();
    } catch (error) {
      console.error("❌ Error registering admin:", error);
      toast.error(t("admins.failed", { defaultValue: "Failed to register admin." }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("admins.title", { defaultValue: "Admins" })}</h2>

      <button
        className={styles.button}
        onClick={() => setShowForm((prev) => !prev)}
      >
        {t("admins.addBtn", { defaultValue: "Add Admin" })}
      </button>

      {loading ? (
        <p>{t("admins.loading", { defaultValue: "Loading..." })}</p>
      ) : (
        <div className={styles.cardContainer}>
          {admins.map((admin) => (
            <div key={admin.id} className={styles.card}>
              <p><strong>{admin.name}</strong></p>
              <p>{admin.email}</p>
              <p>
                {t("admins.role", { defaultValue: "Role:" })} {admin.role}
              </p>
            </div>
          ))}
        </div>
      )}

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

          <button type="submit" disabled={submitting} className={styles.button}>
            {submitting
              ? t("admins.creating", { defaultValue: "Creating..." })
              : t("admins.createBtn", { defaultValue: "Create Admin" })}
          </button>
        </form>
      )}
    </div>
  );
}
