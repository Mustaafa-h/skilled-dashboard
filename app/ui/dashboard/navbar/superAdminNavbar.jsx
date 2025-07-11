"use client";

import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {
    MdNotifications,
    MdPublic,
    MdMenu,
} from "react-icons/md";
import Link from "next/link";
import { useTranslations } from "next-intl";

const SuperAdminNavbar = ({ onToggleSidebar }) => {
    const t = useTranslations();
    const pathname = usePathname();
    const notificationCount = 5; // Replace with dynamic later if needed

    const pageKey = pathname.split("/").pop();

    const titles = {
        companies: "Companies",
        workers: "Workers",
        services: "Services",
        preferences: "Preferences",
        gallery: "Gallery",
        transactions: "Transactions",
        reports: "Reports",
        admins: "Admin Management",
        settings: "Settings",
        notifications: "Notifications",
    };

    const notificationPath = "/dashboard-superadmin/notifications";

    return (
        <div className={styles.container}>
            {/* Hamburger */}
          <div className={styles.hamburger} onClick={onToggleSidebar}>
                <MdMenu size={24} />
            </div>

            {/* Page title */}
            <div className={styles.title}>
                {titles[pageKey] || "SuperAdmin Dashboard"}
            </div>

            {/* Icons */}
            <div className={styles.menu}>
                <Link href={notificationPath} className={styles.notificationWrapper}>
                    <MdNotifications size={20} />
                    {notificationCount > 0 && (
                        <span className={styles.badge}>{notificationCount}</span>
                    )}
                </Link>
                <MdPublic size={20} />
            </div>
        </div>
    );
};

export default SuperAdminNavbar;
