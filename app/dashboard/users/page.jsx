"use client";

import { useEffect, useState, useMemo } from "react";
import { getCompanyWorkers, deleteCompanyWorker } from "@/app/lib/api";
import Worker from "@/app/models/workerModel";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/app/ui/dashboard/users/users.module.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const t = useTranslations();
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

const companyId = (typeof window !== "undefined" ? localStorage.getItem("companyId") : null);

  const ITEMS_PER_PAGE = 6;

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data } = await getCompanyWorkers(companyId);
      const workerObjects = data.data.map(w => new Worker({ ...w, _id: w.id }));
      setWorkers(workerObjects);
      console.log("First worker object for debug:", workerObjects[0]);
    } catch (error) {
      console.error(error);
      toast.error(t("fetchWorkersError", { defaultValue: "Failed to fetch workers." }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId) => {
    try {
      await deleteCompanyWorker(workerId);
      toast.success(t("workerDeleted", { defaultValue: "Worker deleted successfully." }));
      fetchWorkers();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message?.includes("no elements in sequence")) {
        toast.success(t("workerDeleted", { defaultValue: "Worker deleted successfully." }));
        fetchWorkers();
      } else {
        toast.error(t("deleteWorkerError", { defaultValue: "Failed to delete worker." }));
      }
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const query = searchQuery.toLowerCase();
      return (
        worker.full_name?.toLowerCase().includes(query) ||
        worker.phone?.toLowerCase().includes(query) ||
        worker.nationality?.toLowerCase().includes(query) ||
        worker.getSkillString()?.toLowerCase().includes(query)
      );
    });
  }, [workers, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWorkers.length / ITEMS_PER_PAGE);
  const currentWorkers = filteredWorkers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <div className={styles.top}>
        <input
          type="text"
          placeholder={t("search", { defaultValue: "Search workers..." })}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchBar}
        />
        <Link href="/dashboard/users/add">
          <button className={styles.addButton}>
            {t("addNewWorker", { defaultValue: "Add New" })}
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : currentWorkers.length > 0 ? (
        <div className={styles.cardGrid}>
          {currentWorkers.map(worker => (
            <div className={styles.workerCard} key={worker._id}>
              <img
                src={worker.image_url || "/noavatar.png"}
                alt="Worker Avatar"
                className={styles.workerImage}
              />
              <h3>{worker.full_name}</h3>
              <p><strong>{t("nationality", { defaultValue: "Nationality" })}:</strong> {worker.nationality || "N/A"}</p>
              <p><strong>{t("phone", { defaultValue: "Phone" })}:</strong> {worker.phone || "N/A"}</p>
              <p><strong>{t("gender", { defaultValue: "Gender" })}:</strong> {worker.gender || "N/A"}</p>
              <p><strong>{t("skills", { defaultValue: "Skills" })}:</strong> {worker.getSkillString() || "N/A"}</p>
              <p><strong>{t("experience", { defaultValue: "Experience" })}:</strong> {worker.getExperienceString() || "N/A"}</p>
              <p><strong>{t("certifications", { defaultValue: "Certifications" })}:</strong> {worker.getCertificationString() || "N/A"}</p>
              <p><strong>{t("status", { defaultValue: "Status" })}:</strong> {worker.isActiveString() || "N/A"}</p>

              <div className={styles.cardButtons}>
                <Link href={`/dashboard/users/${worker._id}`}>
                  <button
                    className={`${styles.button} ${styles.view}`}
                    title={t("viewEdit", { defaultValue: "View/Edit" })}
                  >
                    <FaEdit size={16} />
                  </button>
                </Link>
                <button
                  className={`${styles.button} ${styles.delete}`}
                  onClick={() => handleDelete(worker._id)}
                  title={t("delete", { defaultValue: "Delete" })}
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>{t("noWorkersFound", { defaultValue: "No workers found." })}</p>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            {t("previous", { defaultValue: "Previous" })}
          </button>
          <span>{`${currentPage} / ${totalPages}`}</span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            {t("next", { defaultValue: "Next" })}
          </button>
        </div>
      )}
    </div>
  );
}
