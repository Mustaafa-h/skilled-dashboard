"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAdmins,
  registerCompanyAdmin,
  resetAdminsPassword,
} from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/dashboard/admins/admins.module.css";
import { useTranslations } from "next-intl";

export default function CompanyAdminsPage() {
  const t = useTranslations();
  const router = useRouter();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add-Admin form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {companyId} = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyId: companyId || "",
  });

  // Reset-Password form state
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetFormData, setResetFormData] = useState({
    userId: "",
    newPassword: "",
  });
  const [submittingReset, setSubmittingReset] = useState(false);

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
        toast.error(
          t("admins.loadError", { defaultValue: "Failed to load admins." })
        );
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchAdmins();
  }, [t, companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting new admin:", formData);

    if (!formData.name || !formData.email || !formData.password) {
      toast.error(
        t("admins.emptyFields", { defaultValue: "All fields are required." })
      );
      return;
    }

    setSubmitting(true);
    try {
      await registerCompanyAdmin(formData);
      toast.success(
        t("admins.success", { defaultValue: "Admin registered successfully." })
      );
      router.refresh();
      setFormData({
        name: "",
        email: "",
        password: "",
        companyId: companyId || "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("❌ Error registering admin:", error);
      toast.error(
        t("admins.failed", { defaultValue: "Failed to register admin." })
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset handlers
  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    console.log("🔑 Resetting password for:", resetFormData.userId);

    const { userId, newPassword } = resetFormData;
    if (!userId || !newPassword) {
      toast.error(
        t("admins.emptyFields", { defaultValue: "All fields are required." })
      );
      return;
    }

    setSubmittingReset(true);
    try {
      await resetAdminsPassword(resetFormData);
      toast.success(
        t("admins.resetSuccess", { defaultValue: "Password reset successfully." })
      );
      router.refresh();
      setResetFormData({ userId: "", newPassword: "" });
      setShowResetForm(false);
    } catch (error) {
      console.error("❌ Error resetting password:", error);
      toast.error(
        t("admins.failed", { defaultValue: "Failed to reset password." })
      );
    } finally {
      setSubmittingReset(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t("admins.title", { defaultValue: "Admins" })}
      </h2>

      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {t("admins.addBtn", { defaultValue: "Add Admin" })}
        </button>

        <button
          className={styles.button}
          onClick={() => setShowResetForm((prev) => !prev)}
        >
          {t("admins.resetBtn", { defaultValue: "Reset Password" })}
        </button>
      </div>

      {loading ? (
        <p>{t("admins.loading", { defaultValue: "Loading..." })}</p>
      ) : (
        <div className={styles.cardContainer}>
          {admins.map((admin) => (
            <div key={admin.id} className={styles.card}>
              <p>
                <strong>{admin.name}</strong>
              </p>
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

      {showResetForm && (
        <form onSubmit={handleResetSubmit} className={styles.form}>
          <select
            name="userId"
            value={resetFormData.userId}
            onChange={handleResetChange}
            className={styles.input}
          >
            <option value="" disabled>
              {t("admins.selectAdmin", { defaultValue: "Select Admin" })}
            </option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.role})
              </option>
            ))}
          </select>

          <input
            type="password"
            name="newPassword"
            placeholder={t("admins.newPassword", { defaultValue: "New Password" })}
            value={resetFormData.newPassword}
            onChange={handleResetChange}
            className={styles.input}
          />

          <button
            type="submit"
            disabled={submittingReset}
            className={styles.button}
          >
            {submittingReset
              ? t("admins.resetting", { defaultValue: "Resetting..." })
              : t("admins.resetBtn", { defaultValue: "Reset Password" })}
          </button>
        </form>
      )}
    </div>
  );
}
