"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllCompanies, deleteCompany } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/companies/page.module.css";
import { useTranslations } from "next-intl";

export default function SuperAdminCompaniesPage() {
  const t = useTranslations();
  const router = useRouter();

  // server data
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters & paging (backend is 0-based page)
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // meta from API
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // derived: debounced search to avoid spamming API
  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setSearchDebounced(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchCompanies = async (opts = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(searchDebounced ? { search: searchDebounced } : {}),
        ...opts,
      };

      const res = await getAllCompanies(params);

      // defensive unwrapping (covers axios wrappers / plain fetch structures)
      const payload = res?.data ?? res;
      const list =
        payload?.data?.data ?? // { data: { data: [...] , meta: {...} } }
        payload?.data ??
        [];

      const meta =
        payload?.data?.meta ??
        payload?.meta ?? {
          total: Array.isArray(list) ? list.length : 0,
          limit,
          totalPages: 1,
        };

      setCompanies(Array.isArray(list) ? list : []);
      setTotal(meta.total ?? 0);
      setTotalPages(Math.max(1, meta.totalPages ?? 1));
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error(
        t("Company.fetchError", {
          defaultValue: "Failed to fetch companies.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // initial + whenever paging/search changes
  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchDebounced, t]);

  // search input handler (keeps client state; server called via debounce)
  const handleSearch = (e) => setSearch(e.target.value.toLowerCase());

  const handleDelete = async (id) => {
    if (
      !confirm(
        t("Company.confirmDelete", {
          defaultValue: "Are you sure you want to delete this company?",
        })
      )
    )
      return;

    try {
      const res = await deleteCompany(id);
      if (res?.success || res?.data?.success) {
        toast.success(
          t("Company.deleteSuccess", {
            defaultValue: "Company deleted successfully.",
          })
        );
        // after delete, refetch same page (it may become empty -> pull previous page)
        const nextCount = companies.length - 1;
        if (nextCount <= 0 && page > 0) {
          setPage((p) => p - 1);
        } else {
          fetchCompanies();
        }
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("Company.deleteError", {
          defaultValue: "Failed to delete company.",
        });
      toast.error(errorMsg);
    }
  };

  const handleAddCompany = () => router.push("/dashboard-superadmin/companies/add");

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value || 10);
    setLimit(newLimit);
    setPage(0); // reset to first page when page size changes
  };

  const gotoPage = (p) => {
    if (p < 0 || p > totalPages - 1) return;
    setPage(p);
  };

  const showingFrom = useMemo(() => page * limit + (companies.length ? 1 : 0), [page, limit, companies.length]);
  const showingTo = useMemo(
    () => Math.min(page * limit + companies.length, total),
    [page, limit, companies.length, total]
  );

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

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder={t("Company.searchPlaceholder", { defaultValue: "Search by name" })}
          value={search}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        <div className={styles.pageSize}>
          <label htmlFor="rows" className={styles.pageSizeLabel}>
            {t("rowsPerPage", { defaultValue: "Rows per page" })}
          </label>
          <select
            id="rows"
            value={limit}
            onChange={handleLimitChange}
            className={styles.pageSizeSelect}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>{t("loading", { defaultValue: "Loading companies..." })}</p>
      ) : companies.length === 0 ? (
        <p>{t("Company.noneFound", { defaultValue: "No companies found." })}</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("Company.logo", { defaultValue: "Logo" })}</th>
                <th>{t("Company.name", { defaultValue: "Name" })}</th>
                <th>{t("Company.status", { defaultValue: "Status" })}</th>
                <th className={styles.actionsHeader}>
                  {t("Company.actions", { defaultValue: "Actions" })}
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  onClick={() =>
                    router.push(`/dashboard-superadmin/companies/${company.id}`)
                  }
                  className={styles.clickableRow}
                >
                  <td className={styles.logo}>
                    <img src={company.logo_url} alt="logo" />
                  </td>
                  <td>{company.name}</td>
                  <td className={styles.statusText}>{company.status}</td>
                  <td className={styles.actions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/dashboard-superadmin/companies/edit/${company.id}`
                        );
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

          <div className={styles.paginationBar}>
            <div className={styles.paginationInfo}>
              {t("showing", { defaultValue: "Showing" })} {showingFrom}{" "}
              {t("to", { defaultValue: "to" })} {showingTo}{" "}
              {t("of", { defaultValue: "of" })} {total}
            </div>

            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                onClick={() => gotoPage(0)}
                disabled={page === 0}
              >
                «
              </button>
              <button
                className={styles.pageBtn}
                onClick={() => gotoPage(page - 1)}
                disabled={page === 0}
              >
                {t("prev", { defaultValue: "Prev" })}
              </button>

              {/* compact numeric window */}
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1)
                .reduce((acc, i, idx, arr) => {
                  if (idx && i - arr[idx - 1] > 1) acc.push("gap-" + i);
                  acc.push(i);
                  return acc;
                }, [])
                .map((i) =>
                  typeof i === "string" ? (
                    <span key={i} className={styles.pageEllipsis}>…</span>
                  ) : (
                    <button
                      key={i}
                      className={`${styles.pageNumber} ${i === page ? styles.pageActive : ""}`}
                      onClick={() => gotoPage(i)}
                    >
                      {i + 1}
                    </button>
                  )
                )}

              <button
                className={styles.pageBtn}
                onClick={() => gotoPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                {t("next", { defaultValue: "Next" })}
              </button>
              <button
                className={styles.pageBtn}
                onClick={() => gotoPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
