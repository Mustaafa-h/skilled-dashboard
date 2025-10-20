"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../ui/dashboard/reviews/reviews.module.css";
import { useTranslations, useLocale } from "next-intl";
import { getCompanyReviews } from "@/app/lib/api";

export default function CompanyReviewsPage() {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();

    const [reviews, setReviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);     // API is 0-based
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const companyId =
        typeof window !== "undefined" ? localStorage.getItem("companyId") : null;

    const fmtDate = (iso) => {
        if (!iso) return "";
        try {
            const dt = new Date(iso);
            const date = new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "short",
                day: "2-digit",
            }).format(dt);
            const time = new Intl.DateTimeFormat(locale, {
                hour: "2-digit",
                minute: "2-digit",
            }).format(dt);
            return `${date} • ${time}`;
        } catch {
            return iso;
        }
    };

    const ratingMeta = useMemo(
        () => ({
            3: {
                label: t("reviewsExcellent", { defaultValue: "Excellent" }),
                icon: "🌟",
                badgeClass: styles.badgeExcellent,
                toneClass: styles.toneExcellent,
            },
            2: {
                label: t("reviewsGood", { defaultValue: "Good" }),
                icon: "👍",
                badgeClass: styles.badgeGood,
                toneClass: styles.toneGood,
            },
            1: {
                label: t("reviewsBad", { defaultValue: "Bad" }),
                icon: "⚠️",
                badgeClass: styles.badgeBad,
                toneClass: styles.toneBad,
            },
        }),
        [t]
    );

    const fetchPage = async (p = page, l = limit) => {
        setLoading(true);
        setError("");
        try {
            const { data } = await getCompanyReviews(companyId, { page: p, limit: l });
            const list = data?.data?.reviews ?? [];
            setReviews(list);
            setTotal(Number(data?.data?.total ?? list.length));
        } catch {
            setError(t("reviewsFetchError", { defaultValue: "Failed to fetch reviews." }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPage(page, limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const goToBooking = (bookingId) => {
        if (!bookingId) return;
        router.push(`/dashboard/orders/${bookingId}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>{t("reviewsTitle", { defaultValue: "Reviews" })}</h2>
                    <p className={styles.subtitle}>
                        {t("reviewsSubtitle", {
                            defaultValue: "See what customers said about their bookings.",
                        })}
                    </p>
                </div>

                <div className={styles.controls}>
                    <label className={styles.perPageLabel}>
                        {t("perPage", { defaultValue: "Per page" })}
                    </label>
                    <select
                        className={styles.perPageSelect}
                        value={limit}
                        onChange={(e) => {
                            setPage(0);
                            setLimit(Number(e.target.value));
                        }}
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
                <div className={styles.loading}>
                    {t("ordersloading", { defaultValue: "Loading..." })}
                </div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : reviews.length === 0 ? (
                <div className={styles.empty}>
                    {t("reviewsEmpty", { defaultValue: "No reviews yet." })}
                </div>
            ) : (
                <ul className={styles.grid}>
                    {reviews.map((r) => {
                        const meta = ratingMeta[r?.rating] || ratingMeta[2];
                        return (
                            <li key={r?.id} className={styles.card}>
                                <div className={styles.cardTop}>
                                    <div className={`${styles.iconWrap} ${meta.toneClass}`} aria-hidden>
                                        <span className={styles.icon}>{meta.icon}</span>
                                    </div>

                                    <div className={styles.topRight}>
                                        <span className={`${styles.badge} ${meta.badgeClass}`}>
                                            {meta.label}
                                        </span>

                                        <div className={styles.metaRow}>
                                            {r?.customer_id ? (
                                                <span className={`${styles.metaItem} ${styles.breakAnywhere}`}>
                                                    {t("reviewsRatedBy", { defaultValue: "Customer" })}:{" "}
                                                    <strong className={styles.mono}>{r.customer_id}</strong>
                                                </span>
                                            ) : null}

                                            {r?.created_at ? (
                                                <span className={styles.metaItemMuted}>• {fmtDate(r.created_at)}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                {r?.comment ? (
                                    <p className={styles.comment}>{r.comment}</p>
                                ) :  <p className={styles.Nocomment}>No Comment</p> }

                                <div className={styles.cardBottom}>
                                    {r?.booking_id ? (
                                        <button
                                            type="button"
                                            onClick={() => goToBooking(r.booking_id)}
                                            className={`${styles.bookingBtn} ${styles.mono} ${styles.breakAnywhere}`}
                                            title={t("reviewsViewBooking", { defaultValue: "View booking" })}
                                        >
                                            {t("reviewsBooking", { defaultValue: "Booking" })} #{r.booking_id}
                                        </button>
                                    ) : (
                                        <span className={styles.metaItemMuted}>
                                            {t("reviewsNoBookingId", { defaultValue: "No booking id" })}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className={styles.pagination}>
                <div className={styles.pageInfo}>
                    {t("ordersshowing", { defaultValue: "Showing" })}{" "}
                    <strong>{reviews.length === 0 ? 0 : page * limit + 1}</strong>{" "}
                    {t("ordersto", { defaultValue: "to" })}{" "}
                    <strong>{Math.min((page + 1) * limit, total)}</strong>{" "}
                    {t("ordersof", { defaultValue: "of" })} <strong>{total}</strong>
                </div>

                <div className={styles.pageControls}>
                    <button
                        type="button"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        className={styles.pageBtn}
                    >
                        {t("ordersprev", { defaultValue: "Previous" })}
                    </button>
                    <span className={styles.pageCount}>
                        {t("orderspage", { defaultValue: "Page" })} {page + 1} / {Math.max(1, totalPages)}
                    </span>
                    <button
                        type="button"
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                        className={styles.pageBtn}
                    >
                        {t("ordersnext", { defaultValue: "Next" })}
                    </button>
                </div>
            </div>
        </div>
    );
}
