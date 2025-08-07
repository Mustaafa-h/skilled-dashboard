"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../../ui/dashboard/orders/[id]/singleorder.module.css";
import { getCompanyWorkers } from "@/app/lib/api";
import { useTranslations, useLocale } from "next-intl";
import toast from "react-hot-toast";
import MapPicker from "@/app/ui/map/MapPicker";

const SingleOrderPage = () => {
  const token = localStorage.getItem("token");
  const t = useTranslations();
  const locale = useLocale();
  const companyId =
    typeof window !== "undefined"
      ? localStorage.getItem("companyId")
      : null;
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("📦 Booking fetched:", data);
      setBooking(data.data);
    } catch (err) {
      console.error("❌ Failed to fetch booking:", err);
      setError(
        t("bookingFetchError", {
          defaultValue: "Failed to load booking",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      if (!companyId) return;
      const { data } = await getCompanyWorkers(companyId);
      console.log("👷 Workers fetched:", data);
      setWorkers(
        (Array.isArray(data.data) ? data.data : []).filter(
          (w) => w.full_name || w.name
        )
      );
    } catch (err) {
      console.error("❌ Failed to fetch workers:", err);
    }
  };

  const assignWorker = async () => {
    try {
      const res = await fetch(
        `/api/bookings/${bookingId}/assign-worker`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            worker_id: selectedWorker,
            notes: "Assigned by admin",
          }),
        }
      );
      const result = await res.json();
      console.log("👤 Worker assigned:", result);
      toast.success(
        t("workerAssigned", {
          defaultValue: "Worker assigned successfully",
        })
      );
      fetchBooking();
    } catch (err) {
      console.error("❌ Assign worker error:", err);
      toast.error(
        t("assignWorkerError", {
          defaultValue: "Failed to assign worker",
        })
      );
    }
  };

  const markCashPaid = async () => {
    try {
      const res = await fetch(
        `/api/bookings/${bookingId}/mark-cash-paid`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log("💰 Cash marked as paid:", data);
      toast.success(
        t("cashMarkedPaid", {
          defaultValue: "Cash marked as paid",
        })
      );
      fetchBooking();
    } catch (err) {
      console.error("❌ Failed to mark cash paid:", err);
      toast.error(
        t("cashMarkError", {
          defaultValue: "Failed to mark cash paid",
        })
      );
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(
        `/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            notes: `Marked ${newStatus}`,
          }),
        }
      );
      const result = await res.json();
      console.log("✅ Status updated:", result);
      toast.success(
        t("statusUpdated", {
          defaultValue: `Status updated to ${newStatus}`,
        })
      );
      fetchBooking();
    } catch (err) {
      console.error("❌ Status update failed:", err);
      toast.error(
        t("statusUpdateError", {
          defaultValue: "Failed to update status",
        })
      );
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    fetchWorkers();
  }, [bookingId]);

  if (loading) return <div>{t("loading")}</div>;
  if (error || !booking)
    return <div>{error || t("bookingNotFound")}</div>;

  const total = (
    parseFloat(booking.base_cost || 0) +
    parseFloat(booking.additional_cost || 0)
  ).toFixed(2);
  const payment = booking.payment || {};
  const address = booking.address || {};
  const canAssign = booking.status === "in_progress";
  const isNewOrPendingClient = ["new", "pending_client"].includes(
    booking.status
  );

  return (
    <div className={styles.container}>
      <h2>
        {t("booking")} #{booking.booking_number}
      </h2>

      {/* ADDRESS & MAP */}
      <div className={styles.section}>
        <strong>{t("address")}</strong>
        <div>
          {address.apartment}, {address.building}
        </div>
        <div>
          {address.street}, {address.district}
        </div>
        <div>{address.city}</div>

        {/* Map view instead of raw coords */}
        <div className={styles.mapContainer}>
          <MapPicker
            lat={parseFloat(booking.customer_lat)}
            lng={parseFloat(booking.customer_long)}
            onLocationSelect={() => { }}
            markerOptions={{ draggable: false }}
          />
        </div>
      </div>

      {/* SERVICE INFO */}
      <div className={styles.section}>
        <strong>{t("service")}</strong>
        <div>
          {t("serviceName")}: {booking.service_name}
        </div>
        <div>
          {t("subService")}: {booking.sub_service_name}
        </div>
        <div>
          {t("customerId")}: {booking.customer_id}
        </div>
      </div>

      {/* PREFERENCES (locale-aware) */}
      {Array.isArray(booking.preferences) &&
        booking.preferences.length > 0 && (
          <div className={styles.section}>
            <strong>{t("preferences")}</strong>
            <ul>
              {booking.preferences.map((pref) => {
                const typeName =
                  locale === "ar" &&
                    pref.preference_type_nameAR
                    ? pref.preference_type_nameAR
                    : pref.preference_type_name;
                const valueDisplay =
                  locale === "ar"
                    ? pref.customer_value_displayAR ||
                    pref.customer_value_display ||
                    pref.customer_value
                    : pref.customer_value_display ||
                    pref.customer_value;
                console.log("Rendering preference:", {
                  id: pref.id,
                  typeName,
                  valueDisplay,
                });
                return (
                  <li key={pref.id}>
                    {typeName}: {valueDisplay}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

      {/* SPECIAL INSTRUCTIONS */}
      {booking.special_instructions && (
        <div className={styles.section}>
          <strong>{t("specialInstructions")}</strong>
          <div>{booking.special_instructions}</div>
        </div>
      )}

      {/* SCHEDULE INFO */}
      <div className={styles.section}>
        <strong>{t("scheduleInfo")}</strong>

        <div>
          {t("preferredDate")}:{" "}
          {booking.preferred_time_slot
            ? new Date(
              booking.preferred_time_slot
            )
              .toISOString()
              .split("T")[0]
            : "-"}
        </div>
        <div>
          {t("preferredTime")}:{" "}
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
              const suffix = hrs >= 12 ? "PM" : "AM";
              const hour12 = ((hrs + 11) % 12 + 1)
                .toString()
                .padStart(2, "0");
              return `${hour12}:${mins} ${suffix}`;
            })()
            : "-"}
        </div>
        <div>
          {t("scheduledDate")}:{" "}
          {booking.scheduled_date || t("notScheduled")}
        </div>
        <div>
          {t("startTime")}: {booking.scheduled_start_time || "-"}
        </div>
        <div>
          {t("endTime")}: {booking.scheduled_end_time || "-"}
        </div>
      </div>

      {/* PAYMENT INFO */}
      <div className={styles.section}>
        <strong>{t("paymentInfo")}</strong>
        <div>
          {t("amount")}: {payment.amount}{" "}
          {payment.currency || "IQD"}
        </div>
        <div>
          {t("method")}: {payment.payment_method}
        </div>
        <div>
          {t("status")}: {payment.status}
        </div>
        {payment.payment_method === "cash_on_delivery" &&
          payment.status === "pending" && (
            <button onClick={markCashPaid}>
              {t("markCashPaid")}
            </button>
          )}
      </div>

      {/* ASSIGN WORKER */}
      {/* <div className={styles.section}>
        <strong>{t("assignWorker")}</strong>
        {canAssign ? (
          <>
            <select
              value={selectedWorker}
              onChange={(e) =>
                setSelectedWorker(e.target.value)
              }
            >
              <option value="">
                {t("selectWorker")}
              </option>
              {workers.map((w) => (
                <option
                  key={w._id || w.id}
                  value={w._id || w.id}
                >
                  {w.full_name || w.name || "Unnamed"}
                </option>
              ))}
            </select>
            <button onClick={assignWorker}>
              {t("assign")}
            </button>
            <div>
              {t("assigned-workers")}: {booking.assigned_worker_id}
            </div>
          </>
        ) : (
          <p>
            {t("assignOnlyIfInProgress", {
              defaultValue:
                "Worker can only be assigned if order is in progress.",
            })}
          </p>
        )}
      </div> */}

      {/* STATUS BUTTONS */}
      {isNewOrPendingClient && (
        <div className={styles.section}>
          <button
            onClick={() => updateStatus("cancelled")}
          >
            {t("cancelOrder", {
              defaultValue: "Cancel Order",
            })}
          </button>
          <button
            onClick={() => updateStatus("pending_client")}
          >
            {t("acceptOrder", {
              defaultValue: "Accept Order",
            })}
          </button>
        </div>
      )}
      {booking.status === "in_progress" && (
        <div className={styles.section}>
          <button
            onClick={() => updateStatus("completed")}
          >
            {t("markCompleted")}
          </button>
        </div>
      )}

      {/* TOTAL */}
      <div className={styles.sectionHighlight}>
        {t("totalCost")}: {total} IQD
      </div>
    </div>
  );
};

export default SingleOrderPage;
