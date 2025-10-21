// ==============================
// File ONLY: app/dashboard-superadmin/companies/[companyId]/orders/page.jsx
// (Send 1 file at a time — logic mirrors company dashboard Orders list)
// ==============================
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import styles from "../../../../ui/superadmin/companies/[companyId]/orders/orders.module.css"; // expects a sibling CSS module (same naming pattern as company)

/**
 * Logic parity with Company Orders list:
 * - 1-based pagination (limit=13)
 * - Refresh button
 * - Row click navigates to details page
 * - Same columns & date formatting
 * - Same empty/loading/error states
 * - Uses t('...') keys consistent with company dashboard
 *
 * NOTE: This page calls a superadmin-scoped endpoint:
 *   /api/superadmin/companies/:companyId/bookings?page=&limit=
 * Add that proxy route in next step (identical response shape to company list).
 */
export default function SuperAdminCompanyOrdersPage() {
    const t = useTranslations();
    const router = useRouter();
    const { companyId } = useParams();
      const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1); // 1-based like company page
    const [limit] = useState(13);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fmtDate = (iso) => {
        if (!iso) return "";
        try {
            const dt = new Date(iso);
            return new Intl.DateTimeFormat(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }).format(dt);
        } catch {
            return iso;
        }
    };

    const fetchOrders = async (p = page) => {
        try {
            setLoading(true);
            setError("");

            // Superadmin-scoped list (same shape as company list)
            const url = `/api/superadmin/companies/${companyId}/bookings?page=${p}&limit=${limit}`;
            const res = await fetch(
                `/api/superadmin/companies/${companyId}/bookings?page=${p}&limit=${limit}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            // Accept both shapes to stay compatible with company logic:
            // { data: { bookings: [], meta: { total, page, limit } } }
            // or { data: [], meta: {...} }
            const bookings = json?.data?.bookings ?? json?.data ?? [];
            const meta = json?.data?.meta ?? json?.meta ?? {};

            setOrders(Array.isArray(bookings) ? bookings : []);
            setTotal(typeof meta?.total === "number" ? meta.total : bookings.length);
            setPage(typeof meta?.page === "number" ? meta.page : p);
        } catch (e) {
            console.error("Fetch orders (SA) error:", e);
            const msg = t("ordersloadError", { defaultValue: "Failed to load orders." });
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (companyId) fetchOrders(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    const pageCount = useMemo(() => {
        if (!total) return 1;
        return Math.max(1, Math.ceil(total / limit));
    }, [total, limit]);

    const onPageChange = async (next) => {
        const p = Math.min(Math.max(1, next), pageCount);
        if (p === page) return;
        await fetchOrders(p);
    };

    const goToDetails = (bookingId) => {
        router.push(`/dashboard-superadmin/companies/${companyId}/orders/${bookingId}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t("orders", { defaultValue: "Orders" })}</h1>
                <button onClick={() => fetchOrders(page)} className={styles.btnSecondary}>
                    {t("refresh", { defaultValue: "Refresh" })}
                </button>
            </div>

            {loading ? (
                <div className={styles.stateMuted}>{t("loading", { defaultValue: "Loading..." })}</div>
            ) : error ? (
                <div className={styles.stateError}>{error}</div>
            ) : orders.length === 0 ? (
                <div className={styles.stateMuted}>{t("ordersEmpty", { defaultValue: "No orders yet." })}</div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{t("ordersservice", { defaultValue: "Service" })}</th>
                                <th>{t("orderscustomer", { defaultValue: "Customer" })}</th>
                                <th>{t("ordersstatus", { defaultValue: "Status" })}</th>
                                <th>{t("orderstotal", { defaultValue: "Total" })}</th>
                                <th>{t("orderscreatedAt", { defaultValue: "Created" })}</th>
                                <th>{t("ordersactions", { defaultValue: "Actions" })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o, idx) => {
                                const id = o.id || o._id;
                                return (
                                    <tr key={id ?? idx} className={styles.row}>
                                        <td onClick={() => goToDetails(id)}>{o.code || id || idx + 1}</td>
                                        <td onClick={() => goToDetails(id)}>{o.serviceName  || "—"}</td>
                                        <td onClick={() => goToDetails(id)}>{o.customerId  || "—"}</td>
                                        <td onClick={() => goToDetails(id)}>{o.status || "—"}</td>
                                        <td onClick={() => goToDetails(id)}>
                                            {typeof o.total === "number" ? o.total.toFixed(2) : o.total ?? "—"}
                                        </td>
                                        <td onClick={() => goToDetails(id)}>{fmtDate(o.createdAt || o.created_at)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.btnGhost}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        goToDetails(id);
                                                    }}
                                                >
                                                    {t("view", { defaultValue: "View" })}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={styles.pager}>
                <div className={styles.pagerText}>
                    {t("orderspaginationPage", { defaultValue: "Page" })} {page} / {pageCount}
                </div>
                <div className={styles.pagerBtns}>
                    <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={styles.btnSecondary}>
                        {t("prev", { defaultValue: "Prev" })}
                    </button>
                    <button onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} className={styles.btnSecondary}>
                        {t("next", { defaultValue: "Next" })}
                    </button>
                </div>
            </div>
        </div>
    );
}
