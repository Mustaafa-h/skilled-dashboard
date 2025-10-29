// ==============================
// File: app/dashboard-superadmin/companies/[companyId]/orders/[bookingId]/page.jsx
// Read-only SuperAdmin view of a single booking
// - Superadmin can inspect ANY company's booking
// - No actions, no status changes, no worker assignment
// - Responsive / uses same translation keys
// - Uses its own CSS module (superadmin version)
// ==============================

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import MapPicker from "@/app/ui/map/MapPicker";

import styles from "../../../../../ui/superadmin/companies/[companyId]/orders/[bookingId]/singleorder.module.css";

export default function SuperAdminCompanySingleOrderPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { companyId, bookingId } = useParams();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch a single booking from a superadmin-scoped endpoint
  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/superadmin/companies/${companyId}/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      // expect { data: {...} } or {...}
      setBooking(data?.data ?? data);
    } catch (err) {
      console.error("❌ [SA] Failed to fetch booking:", err);
      setError(
        t("bookingFetchError", {
          defaultValue: "Failed to load booking",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && bookingId) {
      fetchBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, bookingId]);

  if (loading) {
    return (
      <div className={styles.stateMuted}>
        {t("loading", { defaultValue: "Loading..." })}
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.stateError}>
        {error ||
          t("bookingNotFound", {
            defaultValue: "Booking not found",
          })}
      </div>
    );
  }

  // derived
  const payment = booking.payment || {};
  const address = booking.address || {};
  const total = (
    parseFloat(booking.base_cost || 0) +
    parseFloat(booking.additional_cost || 0)
  ).toFixed(2);

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.bookingTitle}>
            {t("booking", { defaultValue: "Booking" })} #
            {booking.booking_number || booking.id || booking._id}
          </h2>

          <div className={styles.bookingMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>
                {t("status", { defaultValue: "Status" })}:
              </span>
              <span className={styles.metaVal}>
                {booking.status || "—"}
              </span>
            </div>

            {booking.cancellation_reason ? (
              <div className={styles.metaRow}>
                <span className={styles.metaKey}>
                  {t("cancellationReason", {
                    defaultValue: "Reason",
                  })}
                  :
                </span>
                <span className={styles.metaVal}>
                  {booking.cancellation_reason}
                </span>
              </div>
            ) : null}

            <div className={styles.metaRow}>
              <span className={styles.metaKey}>
                {t("company", { defaultValue: "Company" })} ID:
              </span>
              <span className={styles.metaVal}>
                {companyId}
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaKey}>
                {t("customerId", {
                  defaultValue: "Customer ID",
                })}
                :
              </span>
              <span className={styles.metaVal}>
                {booking.customer_id || "—"}
              </span>
            </div>
          </div>
        </div>

        <button
          className={styles.refreshBtn}
          onClick={fetchBooking}
        >
          {t("refresh", { defaultValue: "Refresh" })}
        </button>
      </header>

      {/* ADDRESS & MAP */}
      <section className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          {t("address", { defaultValue: "Address" })}
        </h3>

        <div className={styles.addressBlock}>
          <div>
            {address.apartment}, {address.building}
          </div>
          <div>
            {address.street}, {address.district}
          </div>
          <div>{address.city}</div>
        </div>

        <div className={styles.mapContainer}>
          <MapPicker
            lat={parseFloat(booking.customer_lat)}
            lng={parseFloat(booking.customer_long)}
            onLocationSelect={() => {}}
            markerOptions={{ draggable: false }}
          />
        </div>
      </section>

      {/* SERVICE INFO */}
      <section className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          {t("service", { defaultValue: "Service" })}
        </h3>

        <div className={styles.kvRow}>
          <span className={styles.kvKey}>
            {t("serviceName", { defaultValue: "Service Name" })}:
          </span>
          <span className={styles.kvValue}>
            {booking.service_name || "—"}
          </span>
        </div>

        <div className={styles.kvRow}>
          <span className={styles.kvKey}>
            {t("subService", { defaultValue: "Sub-service" })}:
          </span>
          <span className={styles.kvValue}>
            {booking.sub_service_name || "—"}
          </span>
        </div>
      </section>

      {/* PREFERENCES */}
      {Array.isArray(booking.preferences) &&
      booking.preferences.length > 0 ? (
        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            {t("preferences", {
              defaultValue: "Preferences",
            })}
          </h3>

          <ul className={styles.prefList}>
            {booking.preferences.map((pref) => {
              const typeName =
                locale === "ar" && pref.preference_type_nameAR
                  ? pref.preference_type_nameAR
                  : pref.preference_type_name;

              const valueDisplay =
                locale === "ar"
                  ? pref.customer_value_displayAR ||
                    pref.customer_value_display ||
                    pref.customer_value
                  : pref.customer_value_display ||
                    pref.customer_value;

              return (
                <li
                  key={pref.id}
                  className={styles.prefItem}
                >
                  <span className={styles.prefKey}>
                    {typeName}:
                  </span>{" "}
                  <span className={styles.prefValue}>
                    {valueDisplay}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* SPECIAL INSTRUCTIONS */}
      {booking.special_instructions ? (
        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            {t("specialInstructions", {
              defaultValue: "Special Instructions",
            })}
          </h3>
          <div className={styles.instructionsBox}>
            {booking.special_instructions}
          </div>
        </section>
      ) : null}

      {/* SCHEDULING */}
      <section className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          {t("scheduleInfo", {
            defaultValue: "Schedule Info",
          })}
        </h3>

        <div className={styles.kvGrid}>
          <div className={styles.kvRow}>
            <span className={styles.kvKey}>
              {t("preferredDate", {
                defaultValue: "Preferred Date",
              })}
              :
            </span>
            <span className={styles.kvValue}>
              {booking.preferred_time_slot
                ? new Date(
                    booking.preferred_time_slot
                  )
                    .toISOString()
                    .split("T")[0]
                : "-"}
            </span>
          </div>

          <div className={styles.kvRow}>
            <span className={styles.kvKey}>
              {t("preferredTime", {
                defaultValue: "Preferred Time",
              })}
              :
            </span>
            <span className={styles.kvValue}>
              {booking.preferred_time_slot
                ? (() => {
                    const utcTime = new Date(
                      booking.preferred_time_slot
                    );
                    const hrs = utcTime.getUTCHours();
                    const mins = utcTime
                      .getUTCMinutes()
                      .toString()
                      .padStart(2, "0");
                    const suffix =
                      hrs >= 12 ? "PM" : "AM";
                    const hour12 = (
                      ((hrs + 11) % 12) + 1
                    )
                      .toString()
                      .padStart(2, "0");
                    return `${hour12}:${mins} ${suffix}`;
                  })()
                : "-"}
            </span>
          </div>

          <div className={styles.kvRow}>
            <span className={styles.kvKey}>
              {t("scheduledDate", {
                defaultValue: "Scheduled Date",
              })}
              :
            </span>
            <span className={styles.kvValue}>
              {booking.scheduled_date ||
                t("notScheduled", {
                  defaultValue: "Not scheduled",
                })}
            </span>
          </div>

          <div className={styles.kvRow}>
            <span className={styles.kvKey}>
              {t("startTime", {
                defaultValue: "Start Time",
              })}
              :
            </span>
            <span className={styles.kvValue}>
              {booking.scheduled_start_time || "—"}
            </span>
          </div>

          <div className={styles.kvRow}>
            <span className={styles.kvKey}>
              {t("endTime", {
                defaultValue: "End Time",
              })}
              :
            </span>
            <span className={styles.kvValue}>
              {booking.scheduled_end_time || "—"}
            </span>
          </div>
        </div>
      </section>

      {/* PAYMENT */}
      <section className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          {t("paymentInfo", {
            defaultValue: "Payment Info",
          })}
        </h3>

        <div className={styles.kvRow}>
          <span className={styles.kvKey}>
            {t("amount", { defaultValue: "Amount" })}:
          </span>
          <span className={styles.kvValue}>
            {payment.amount} {payment.currency || "IQD"}
          </span>
        </div>

        <div className={styles.kvRow}>
          <span className={styles.kvKey}>
            {t("method", { defaultValue: "Method" })}:
          </span>
          <span className={styles.kvValue}>
            {payment.payment_method || "—"}
          </span>
        </div>

        <div className={styles.kvRow}>
          <span className={styles.kvKey}>
            {t("status", { defaultValue: "Status" })}:
          </span>
          <span className={styles.kvValue}>
            {payment.status || "—"}
          </span>
        </div>
      </section>

      {/* TOTAL */}
      <section className={styles.totalBar}>
        <span className={styles.totalLabel}>
          {t("totalCost", {
            defaultValue: "Total cost",
          })}
          :
        </span>
        <span className={styles.totalValue}>
          {total} IQD
        </span>
      </section>
    </div>
  );
}
