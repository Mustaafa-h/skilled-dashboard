"use client";

import { useEffect, useState } from "react";
import styles from "../../ui/dashboard/orders/orders.module.css";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const OrdersPage = () => {
  const t = useTranslations();
  const router = useRouter();

  // pagination
  const LIMIT = 13;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const CANCEL_REASON_OPTIONS = [
    t("ordersreasonNoStaff"),
    t("ordersreasonScheduling"),
    t("ordersreasonNoShow"),
    t("ordersreasonDuplicate"),
    t("ordersreasonOutOfArea"),
    t("ordersreasonPricing"),
  ];

  // fetch with page argument; default uses current `page`
  const fetchOrders = async (pageArg = page) => {
    try {
      setRefreshing(true);

      if (!token) {
        console.warn("No token found in localStorage");
        setError(t("ordersloadError"));
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch(
        `/api/bookings/company?page=${pageArg}&limit=${LIMIT}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.error("Fetch failed with status:", res.status);
        setError(t("ordersloadError"));
        return;
      }

      const json = await res.json();
      console.log("Fetched bookings:", json);

      // bookings array
      const bookingsArray = json?.data?.bookings ?? json?.bookings ?? [];
      setOrders(bookingsArray);

      // meta extraction (nullish only)
      const meta =
        json?.data?.pagination ?? json?.data?.meta ?? json?.meta ?? {};

      const serverPage = Number(meta.page ?? meta.currentPage ?? pageArg);
      const serverLimit = Number(meta.limit ?? meta.perPage ?? LIMIT);
      const serverTotal = Number(
        meta.total ?? meta.totalCount ?? json?.data?.total ?? 0
      );

      const computedTotalPages = Math.max(
        1,
        Math.ceil(((serverTotal ?? 0) / (serverLimit ?? LIMIT)))
      );
      const serverTotalPages = Number(meta.totalPages ?? computedTotalPages);

      setPage(serverPage || pageArg);
      setTotalPages(serverTotalPages || 1);
      setTotalCount(
        Number.isFinite(serverTotal) ? serverTotal : bookingsArray.length
      );
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(t("ordersloadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // initial + auto-refresh current page
  useEffect(() => {
    fetchOrders(page);
    const intervalId = setInterval(() => fetchOrders(page), 50000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleStatusUpdate = async (id, newStatus, notes) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes ?? `Updated to ${newStatus}`,
        }),
      });

      if (!res.ok) throw new Error("Failed status update");
      console.log(`Booking ${id} status updated to ${newStatus}`);
      fetchOrders(page);
    } catch (err) {
      console.error("Update failed:", err);
      alert(t("ordersstatusUpdateError"));
    }
  };

  const renderActionButton = (booking) => {
    const { id, status } = booking;

    if (status === "new") {
      return (
        <>
          <button
            onClick={() => handleStatusUpdate(id, "pending_client")}
            className={styles.confirmBtn}
          >
            {t("orderssendToClient")}
          </button>
          <button
            onClick={() => openCancelModal(id)}
            className={styles.cancelBtn}
          >
            {t("orderscancel")}
          </button>
        </>
      );
    }

    if (status === "pending_client") {
      return (
        <button onClick={() => openCancelModal(id)} className={styles.cancelBtn}>
          {t("orderscancel")}
        </button>
      );
    }

    return <span>{t("ordersnoActions")}</span>;
  };

  const handleRowClick = (id) => {
    router.push(`/dashboard/orders/${id}`);
  };

  const openCancelModal = (id) => {
    setCancelBookingId(id);
    setCancelReason("");
    setCancelError("");
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setCancelBookingId(null);
    setCancelReason("");
    setCancelSubmitting(false);
    setCancelError("");
  };

  const confirmCancelWithReason = async () => {
    if (!cancelReason.trim()) {
      setCancelError(t("orderscancelReasonRequired"));
      return;
    }
    try {
      setCancelSubmitting(true);
      await handleStatusUpdate(
        cancelBookingId,
        "cancelled",
        cancelReason.trim()
      );
      closeCancelModal();
    } catch (e) {
      setCancelSubmitting(false);
      setCancelError(t("ordersstatusUpdateError"));
    }
  };

  // pagination helpers
  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };
  const goPrev = () => goToPage(page - 1);
  const goNext = () => goToPage(page + 1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{t("orderscompanyOrders")}</h2>
        <button onClick={() => fetchOrders(page)} disabled={refreshing}>
          {refreshing ? t("ordersrefreshing") : t("ordersrefresh")}
        </button>
      </div>

      {loading ? (
        <p>{t("ordersloading")}</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : orders.length === 0 ? (
        <p>{t("ordersempty")}</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("ordersservice")}</th>
                  <th>{t("ordersplaced")}</th>
                  <th>{t("ordersstatus")}</th>
                  <th>{t("orderscustomer")}</th>
                  <th>{t("orderstotal")}</th>
                  <th>{t("ordersactions")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((booking) => {
                  const createdDate = booking.created_at
                    ? new Date(booking.created_at).toISOString().split("T")[0]
                    : "-";
                  const createdTime = booking.created_at
                    ? (() => {
                        const utc = new Date(booking.created_at);
                        const hrs = utc.getUTCHours();
                        const mins = utc
                          .getUTCMinutes()
                          .toString()
                          .padStart(2, "0");
                        const suffix = hrs >= 12 ? "PM" : "AM";
                        const hour12 = ((hrs + 11) % 12) + 1;
                        return `${hour12.toString().padStart(2, "0")}:${mins} ${suffix}`;
                      })()
                    : "-";

                  return (
                    <tr
                      key={booking.id}
                      onClick={() => handleRowClick(booking.id)}
                      className={styles.clickableRow}
                    >
                      <td>{booking.service_name || "N/A"}</td>
                      <td>
                        <div>{createdDate}</div>
                        <div>{createdTime}</div>
                      </td>
                      <td>{booking.status}</td>
                      <td>{booking.customer_id}</td>
                      <td>
                        {(
                          parseFloat(booking.base_cost ?? 0) +
                          parseFloat(booking.additional_cost ?? 0)
                        ).toFixed(2)}{" "}
                        IQD
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {renderActionButton(booking)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={goPrev}
              disabled={page <= 1 || refreshing}
              aria-label={t("orderspaginationPrev")}
            >
              {t("orderspaginationPrev")}
            </button>

            {(() => {
              const windowSize = 7;
              const half = Math.floor(windowSize / 2);
              let start = Math.max(1, page - half);
              let end = Math.min(totalPages, start + windowSize - 1);
              if (end - start + 1 < windowSize) {
                start = Math.max(1, end - windowSize + 1);
              }

              const items = [];

              if (start > 1) {
                items.push(
                  <button
                    key={1}
                    className={styles.pageBtn}
                    onClick={() => goToPage(1)}
                    aria-label={`${t("orderspaginationPage")} 1`}
                  >
                    1
                  </button>
                );
                if (start > 2)
                  items.push(
                    <span key="start-ellipsis" className={styles.ellipsis}>
                      …
                    </span>
                  );
              }

              for (let p = start; p <= end; p++) {
                items.push(
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${
                      p === page ? styles.activePage : ""
                    }`}
                    onClick={() => goToPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    aria-label={`${t("orderspaginationPage")} ${p}`}
                    disabled={p === page || refreshing}
                  >
                    {p}
                  </button>
                );
              }

              if (end < totalPages) {
                if (end < totalPages - 1)
                  items.push(
                    <span key="end-ellipsis" className={styles.ellipsis}>
                      …
                    </span>
                  );
                items.push(
                  <button
                    key={totalPages}
                    className={styles.pageBtn}
                    onClick={() => goToPage(totalPages)}
                    aria-label={`${t("orderspaginationPage")} ${totalPages}`}
                  >
                    {totalPages}
                  </button>
                );
              }

              return items;
            })()}

            <button
              className={styles.pageBtn}
              onClick={goNext}
              disabled={page >= totalPages || refreshing}
              aria-label={t("orderspaginationNext")}
            >
              {t("orderspaginationNext")}
            </button>

            <span className={styles.pageMeta}>
              {t("orderspaginationMeta", {
                page,
                totalPages,
                total: totalCount,
              })}
            </span>
          </div>
        </>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalOpen && (
        <div className={styles.modalOverlay} onClick={closeCancelModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancelModalTitle"
          >
            <h3 id="cancelModalTitle" className={styles.modalTitle}>
              {t("orderscancelTitle")}
            </h3>

            <label htmlFor="cancelReasonSelect" className={styles.modalLabel}>
              {t("orderscancelReasonLabel")}
            </label>
            <select
              id="cancelReasonSelect"
              className={styles.modalInput}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelSubmitting}
            >
              <option value="">{t("ordersselectReasonPlaceholder")}</option>
              {CANCEL_REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {cancelError ? (
              <p className={styles.error}>{cancelError}</p>
            ) : null}

            <div className={styles.modalActions}>
              <button
                onClick={confirmCancelWithReason}
                disabled={cancelSubmitting}
                className={styles.confirmBtn}
              >
                {cancelSubmitting ? t("orderssaving") : t("orderscancelConfirm")}
              </button>
              <button
                onClick={closeCancelModal}
                disabled={cancelSubmitting}
                className={styles.cancelBtn}
              >
                {t("orderscancelDismiss")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
