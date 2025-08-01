"use client";

import { useEffect, useState } from "react";
import styles from "@/app/ui/dashboard/orders/orders.module.css";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const t = useTranslations();

  const token = typeof window !== "undefined" 
    ? localStorage.getItem("token") 
    : null;

  const fetchOrders = async () => {
    try {
      setRefreshing(true);

      if (!token) {
        console.warn("No token found in localStorage");
        setError(t("ordersloadError"));
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch("/api/bookings/company?page=1&limit=50", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Fetch failed with status:", res.status);
        setError(t("ordersloadError"));
        return;
      }

      const json = await res.json();
      console.log("Fetched bookings:", json);

      const bookingsArray = json?.data?.bookings || [];
      setOrders(bookingsArray);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(t("ordersloadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load + auto-refresh every 60s
  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Updated to ${newStatus}`,
        }),
      });

      if (!res.ok) throw new Error("Failed status update");
      console.log(`Booking ${id} status updated to ${newStatus}`);
      fetchOrders();
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
            onClick={() => handleStatusUpdate(id, "cancelled")}
            className={styles.cancelBtn}
          >
            {t("orderscancel")}
          </button>
        </>
      );
    }

    if (status === "pending_client") {
      return (
        <button
          onClick={() => handleStatusUpdate(id, "cancelled")}
          className={styles.cancelBtn}
        >
          {t("orderscancel")}
        </button>
      );
    }

    return <span>{t("ordersnoActions")}</span>;
  };

  const handleRowClick = (id) => {
    router.push(`/dashboard/orders/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{t("orderscompanyOrders")}</h2>
        <button onClick={fetchOrders} disabled={refreshing}>
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
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("ordersservice")}</th>
                <th>{t("ordersplaced")}</th>        {/* NEW */}
                <th>{t("ordersstatus")}</th>
                <th>{t("orderscustomer")}</th>
                <th>{t("orderstotal")}</th>
                <th>{t("ordersactions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((booking) => {
                // format created_at into date + time UTC
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
                      const hour12 = ((hrs + 11) % 12 + 1)
                        .toString()
                        .padStart(2, "0");
                      return `${hour12}:${mins} ${suffix} `;
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
                        parseFloat(booking.base_cost || 0) +
                        parseFloat(booking.additional_cost || 0)
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
      )}
    </div>
  );
};

export default OrdersPage;
