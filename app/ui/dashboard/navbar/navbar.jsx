"use client";

import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {
    MdNotifications,
    MdOutlineChat,
    MdPublic,
    MdMenu,
} from "react-icons/md";
import Link from "next/link";
import { useTranslations } from "next-intl";

const Navbar = ({ onToggleSidebar }) => {
    const t = useTranslations();
    const pathname = usePathname();
    const notificationCount = 3;

    const pageKey = pathname.split("/").pop();

    const titles = {
        users: t("workers", { defaultValue: "Workers" }),
        products: t("services", { defaultValue: "Services" }),
        // add additional page title mappings if needed
    };

    // Context-aware notifications route
    const notificationPath = pathname.startsWith("/dashboard-superadmin")
        ? "/dashboard-superadmin/notifications"
        : "/dashboard/notifications";

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
                    <MdOutlineChat size={20} />
                    <Link href={notificationPath} className={styles.notificationWrapper}>
                        <MdNotifications size={20} />
                        {notificationCount > 0 && (
                            <span className={styles.badge}>{notificationCount}</span>
                        )}
                    </Link>
                    <MdPublic size={20} />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
