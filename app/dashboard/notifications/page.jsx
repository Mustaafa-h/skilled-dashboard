"use client";

import { useEffect, useState } from "react";
import styles from "./notifications.module.css";
import {
  loadNotifications,
  subscribeNotifications,
} from "@/app/lib/notificationsClient";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // initial load
    setItems(loadNotifications());
    // live updates (new tab + same tab)
    const unsub = subscribeNotifications(setItems);
    return unsub;
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Notifications</h2>

      {!items.length && (
        <p style={{ opacity: 0.6 }}>No notifications yet.</p>
      )}

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
