"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllCompanies, deleteCompany } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/companies/page.module.css";
import { useTranslations } from "next-intl";

export default function SuperAdminCompaniesPage() {
  const t = useTranslations();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await getAllCompanies();
        const data = res.data?.data || [];
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error(t("Company.fetchError", { defaultValue: "Failed to fetch companies." }));
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [t]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = companies.filter((company) =>
      company.name.toLowerCase().includes(value)
    );
    setFilteredCompanies(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm(t("Company.confirmDelete", { defaultValue: "Are you sure you want to delete this company?" })))
      return;
    try {
      const res = await deleteCompany(id);
      if (res.success) {
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        setFilteredCompanies((prev) => prev.filter((c) => c.id !== id));
        toast.success(t("Company.deleteSuccess", { defaultValue: "Company deleted successfully." }));
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("Company.deleteError", { defaultValue: "Failed to delete company." });
      toast.error(errorMsg);
    }
  };

  const handleAddCompany = () => {
    router.push("/dashboard-superadmin/companies/add");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {t("Company.title", { defaultValue: "Companies Management" })}
        </h1>
        <button onClick={handleAddCompany} className={styles.addButton}>
          {t("Company.add", { defaultValue: "+ Add Company" })}
        </button>
      </div>

      <input
        type="text"
        placeholder={t("Company.searchPlaceholder", { defaultValue: "Search by name" })}
        value={search}
        onChange={handleSearch}
        className={styles.searchInput}
      />

      {loading ? (
        <p>{t("loading", { defaultValue: "Loading companies..." })}</p>
      ) : filteredCompanies.length === 0 ? (
        <p>{t("Company.noneFound", { defaultValue: "No companies found." })}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("Company.name", { defaultValue: "Name" })}</th>
              <th>{t("Company.status", { defaultValue: "Status" })}</th>
              <th>{t("Company.actions", { defaultValue: "Actions" })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr
                key={company.id}
                onClick={() =>
                  router.push(`/dashboard-superadmin/companies/${company.id}`)
                }
              >
                <td>{company.name}</td>
                <td className={styles.statusText}>{company.status}</td>
                <td className={styles.actions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard-superadmin/companies/edit/${company.id}`);
                    }}
                    className={styles.editButton}
                  >
                    {t("edit", { defaultValue: "Edit" })}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(company.id);
                    }}
                    className={styles.deleteButton}
                  >
                    {t("delete", { defaultValue: "Delete" })}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
