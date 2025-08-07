"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import styles from "./navbar.module.css";
import { MdNotifications, MdOutlineChat, MdMenu } from "react-icons/md";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  loadNotifications,
  subscribeNotifications,
  clearNotifications,
} from "@/app/lib/notificationsClient";

const Navbar = ({ onToggleSidebar }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  const [notificationCount, setNotificationCount] = useState(0);

  // Determine notifications route based on context
  const notificationsPath = pathname.startsWith("/dashboard-superadmin")
    ? "/dashboard-superadmin/notifications"
    : "/dashboard/notifications";

  // Load initial count and subscribe to changes
  useEffect(() => {
    const initial = loadNotifications().length;
    console.log("[Navbar] Initial notification count:", initial);
    setNotificationCount(initial);

    const unsub = subscribeNotifications((all) => {
      console.log("[Navbar] Notifications updated, new count:", all.length);
      setNotificationCount(all.length);
    });
    return () => unsub();
  }, []);

  // Clear notifications when navigating away from notifications page
  useEffect(() => {
    if (
      prevPath.current === notificationsPath &&
      pathname !== notificationsPath
    ) {
      console.log(
        `[Navbar] Leaving ${notificationsPath}, clearing notifications`
      );
      clearNotifications();
      setNotificationCount(0);
    }
    prevPath.current = pathname;
  }, [pathname, notificationsPath]);

  const pageKey = pathname.split("/").pop();
  const titles = {
    users: t("workers", { defaultValue: "Workers" }),
    products: t("services", { defaultValue: "Services" }),
    // add additional page title mappings if needed
  };

  return (
    <div className={styles.container}>
      {/* Hamburger menu */}
      <div
        className={styles.hamburger}
        onClick={onToggleSidebar}
        role="button"
        aria-label="Toggle sidebar"
      >
        <MdMenu size={24} />
      </div>

      {/* Page title */}
      <div className={styles.title}>
        {titles[pageKey] || t("dashboard", { defaultValue: "Dashboard" })}
      </div>

      {/* Right menu */}
      <div className={styles.menu}>
        <div className={styles.icons}>
          <Link href="chat" className={styles.notificationWrapper}>
            <MdOutlineChat size={20} />
          </Link>

          <Link href={notificationsPath} className={styles.notificationWrapper}>
            <MdNotifications size={20} />
            {notificationCount > 0 && (
              <span className={styles.badge}>{notificationCount}</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
