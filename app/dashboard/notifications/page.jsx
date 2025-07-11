"use client";

import styles from "./notifications.module.css";
import { useTranslations } from "next-intl";

const NotificationsPage = () => {
  const t = useTranslations();

  const notifications = [
    { id: 1, title: t("newUserRegistered", { defaultValue: "New user registered" }), date: "July 5, 2025", read: false },
    { id: 2, title: t("serviceUpdated", { defaultValue: "Service updated" }), date: "July 4, 2025", read: true },
    { id: 3, title: t("monthlyReportReady", { defaultValue: "Monthly report ready" }), date: "July 3, 2025", read: false },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("notificationsTitle", { defaultValue: "Notifications" })}</h2>
      <div className={styles.notificationsList}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`${styles.notification} ${n.read ? styles.read : styles.unread}`}
          >
            <p className={styles.notificationTitle}>{n.title}</p>
            <span className={styles.notificationDate}>{n.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
