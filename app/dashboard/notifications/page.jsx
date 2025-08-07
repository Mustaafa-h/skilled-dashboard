"use client";
// app/dashboard/notifications/page.jsx

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import styles from "./notifications.module.css";
import {
  loadNotifications,
  subscribeNotifications,
  clearNotifications,
} from "@/app/lib/notificationsClient";

export default function NotificationsPage() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  const notificationsPath = pathname.startsWith("/dashboard-superadmin")
    ? "/dashboard-superadmin/notifications"
    : "/dashboard/notifications";

  const [items, setItems] = useState([]);

  // 1️⃣ Initial load & subscribe
  useEffect(() => {
    const initial = loadNotifications();
    console.log("[NotificationsPage] Initial notifications:", initial);
    setItems(initial);

    const unsub = subscribeNotifications((all) => {
      console.log("[NotificationsPage] Notifications updated, new list:", all);
      setItems(all);
    });

    return () => {
      console.log("[NotificationsPage] Unsubscribing subscription");
      unsub();
    };
  }, []);

  // 2️⃣ Clear storage when navigating away from notifications
  useEffect(() => {
    if (
      prevPath.current === notificationsPath &&
      pathname !== notificationsPath
    ) {
      console.log(
        `[NotificationsPage] Leaving notifications page: ${prevPath.current} → ${pathname}, clearing notifications`
      );
      clearNotifications();
    }
    prevPath.current = pathname;
  }, [pathname, notificationsPath]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Notifications</h2>

      {!items.length && <p style={{ opacity: 0.6 }}>No notifications yet.</p>}

      <div className={styles.notificationsList}>
        {items.map((n) => (
          <div key={n.id} className={styles.notification}>
            <div className={styles.notificationTitle}>{n.title}</div>
            {n.body && <div style={{ opacity: 0.8 }}>{n.body}</div>}
            <span className={styles.notificationDate}>
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
