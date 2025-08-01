"use client";

import { useEffect, useState } from "react";
import styles from "./transactions.module.css";
import { useTranslations } from "next-intl";

const Transactions = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/bookings/company?page=1&limit=5" , {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
        const json = await res.json();
        const bookingsArray = json?.data?.bookings || [];
        setTransactions(bookingsArray);
      } catch (err) {
        console.error("Failed to fetch latest bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatStatus = (status) => {
    switch (status) {
      case "completed":
        return t("orderscompleted");
      case "cancelled":
        return t("orderscancelled");
      case "pending":
        return t("orderspending");
      case "confirmed":
        return t("ordersconfirmed");
      default:
        return status;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("dashboardlatestTransactions")}</h2>
      <div className={styles.tableContainer}>
        {loading ? (
          <p>{t("ordersloading")}</p>
        ) : transactions.length === 0 ? (
          <p>{t("ordersempty")}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <td>{t("orderscustomer")}</td>
                <td>{t("ordersstatus")}</td>
                <td>{t("ordersdate")}</td>
                <td>{t("orderstotal")}</td>
              </tr>
            </thead>
            <tbody>
              {transactions.map((order) => (
                <tr key={order.id}>
                  <td>{order.customer_id?.slice(0, 8)}...</td>
                  <td>
                    <span
                      className={`${styles.status} ${styles[order.status] || ""}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    {(
                      parseFloat(order.base_cost || 0) +
                      parseFloat(order.additional_cost || 0)
                    ).toFixed(2)} IQD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transactions;
