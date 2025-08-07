"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAdmins,
  getAllCompanies,
  registerCompanyAdmin,
  registerAdmin,
  resetAdminsPassword,
} from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/shared/form.module.css";
import { useTranslations } from "next-intl";

export default function AdminsPage() {
  const t = useTranslations();
  const router = useRouter();

  // Shared list of all admins + companies
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Company-Admin form state
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyId: "",
  });
  const [submittingCompany, setSubmittingCompany] = useState(false);

  // Super-Admin form state
  const [showSuperForm, setShowSuperForm] = useState(false);
  const [superFormData, setSuperFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [submittingSuper, setSubmittingSuper] = useState(false);

  // Reset-Password form state
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetFormData, setResetFormData] = useState({
    userId: "",
    newPassword: "",
  });
  const [submittingReset, setSubmittingReset] = useState(false);

  // Utility to get company name by ID
  const getCompanyName = (id) =>
    companies.find((c) => c.id === id)?.name || "-";

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
        toast.error(
          t("admins.loadError", { defaultValue: "Failed to load data." })
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  // Handlers for form field changes
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSuperChange = (e) => {
    const { name, value } = e.target;
    setSuperFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Company-Admin
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting Company-Admin:", companyFormData);

    const { name, email, password, companyId } = companyFormData;
    if (!name || !email || !password || !companyId) {
      toast.error(
        t("admins.emptyFields", { defaultValue: "All fields are required." })
      );
      return;
    }

    setSubmittingCompany(true);
    try {
      await registerCompanyAdmin(companyFormData);
      toast.success(
        t("admins.success", { defaultValue: "Admin registered successfully." })
      );
      router.refresh();
      setCompanyFormData({ name: "", email: "", password: "", companyId: "" });
      setShowCompanyForm(false);
    } catch (error) {
      console.error("❌ Error registering Company-Admin:", error);
      toast.error(
        t("admins.failed", { defaultValue: "Failed to register admin." })
      );
    } finally {
      setSubmittingCompany(false);
    }
  };

  // Submit Super-Admin
  const handleSuperSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting Super-Admin:", superFormData);

    const { name, phone, email, password } = superFormData;
    if (!name || !phone || !email || !password) {
      toast.error(
        t("admins.emptyFields", { defaultValue: "All fields are required." })
      );
      return;
    }

    setSubmittingSuper(true);
    try {
      await registerAdmin(superFormData);
      toast.success(
        t("admins.success", { defaultValue: "Admin registered successfully." })
      );
      router.refresh();
      setSuperFormData({ name: "", phone: "", email: "", password: "" });
      setShowSuperForm(false);
    } catch (error) {
      console.error("❌ Error registering Super-Admin:", error);
      toast.error(
        t("admins.failed", { defaultValue: "Failed to register admin." })
      );
    } finally {
      setSubmittingSuper(false);
    }
  };

  // Submit Reset-Password
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

      {/* Toggle buttons */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => setShowCompanyForm((v) => !v)}
        >
          {t("admins.addCompanyBtn", { defaultValue: "Add Company Admin" })}
        </button>

        <button
          className={styles.button}
          onClick={() => setShowSuperForm((v) => !v)}
        >
          {t("admins.addSuperBtn", { defaultValue: "Add Super Admin" })}
        </button>

        <button
          className={styles.button}
          onClick={() => setShowResetForm((v) => !v)}
        >
          {t("admins.resetBtn", { defaultValue: "Reset Password" })}
        </button>
      </div>

      {/* Company-Admin Form */}
      {showCompanyForm && (
        <form onSubmit={handleCompanySubmit} className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder={t("admins.name", { defaultValue: "Name" })}
            value={companyFormData.name}
            onChange={handleCompanyChange}
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder={t("admins.email", { defaultValue: "Email" })}
            value={companyFormData.email}
            onChange={handleCompanyChange}
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder={t("admins.password", { defaultValue: "Password" })}
            value={companyFormData.password}
            onChange={handleCompanyChange}
            className={styles.input}
          />
          <select
            name="companyId"
            value={companyFormData.companyId}
            onChange={handleCompanyChange}
            className={styles.select}
          >
            <option value="" disabled>
              {t("admins.selectCompany", { defaultValue: "Select Company" })}
            </option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submittingCompany}
            className={styles.button}
          >
            {submittingCompany
              ? t("admins.creating", { defaultValue: "Creating..." })
              : t("admins.createBtn", { defaultValue: "Create Admin" })}
          </button>
        </form>
      )}

      {/* Super-Admin Form */}
      {showSuperForm && (
        <form onSubmit={handleSuperSubmit} className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder={t("admins.name", { defaultValue: "Name" })}
            value={superFormData.name}
            onChange={handleSuperChange}
            className={styles.input}
          />
          <input
            type="tel"
            name="phone"
            placeholder={t("admins.phone", { defaultValue: "Phone" })}
            value={superFormData.phone}
            onChange={handleSuperChange}
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder={t("admins.email", { defaultValue: "Email" })}
            value={superFormData.email}
            onChange={handleSuperChange}
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder={t("admins.password", { defaultValue: "Password" })}
            value={superFormData.password}
            onChange={handleSuperChange}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={submittingSuper}
            className={styles.button}
          >
            {submittingSuper
              ? t("admins.creating", { defaultValue: "Creating..." })
              : t("admins.createBtn", { defaultValue: "Create Admin" })}
          </button>
        </form>
      )}

      {/* Reset-Password Form */}
      {showResetForm && (
        <form onSubmit={handleResetSubmit} className={styles.form}>
          <select
            name="userId"
            value={resetFormData.userId}
            onChange={handleResetChange}
            className={styles.select}
          >
            <option value="" disabled>
              {t("admins.selectAdmin", { defaultValue: "Select Admin" })}
            </option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.role}
                {a.companyId ? ` @ ${getCompanyName(a.companyId)}` : ""})
              </option>
            ))}
          </select>
          <input
            type="password"
            name="newPassword"
            placeholder={t("admins.newPassword", {
              defaultValue: "New Password",
            })}
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

      {/* Admins list */}
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
              {admin.phone && <p>{admin.phone}</p>}
              <p>
                {t("admins.role", { defaultValue: "Role:" })} {admin.role}
              </p>
              {admin.companyId && (
                <p>
                  {t("admins.company", { defaultValue: "Company:" })}{" "}
                  {getCompanyName(admin.companyId)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
