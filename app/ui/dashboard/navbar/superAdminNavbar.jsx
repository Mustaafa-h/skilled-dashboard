"use client";

import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {

    MdMenu,
} from "react-icons/md";
import { useTranslations } from "next-intl";

const SuperAdminNavbar = ({ onToggleSidebar }) => {
    const t = useTranslations();
    const pathname = usePathname();

    const pageKey = pathname.split("/").pop();

    const titles = {
        companies: t("companies", { defaultValue: "companies" }),
        serviecs: t("serviecs", { defaultValue: "serviecs" }),
        preferences: t("preferences", { defaultValue: "preferences" }),
        admins: t("admins Management", { defaultValue: "Admins Management" }),
        settings: t("settings", { defaultValue: "settings" }),
        banners: t("banners", { defaultValue: "banners" }),
    };


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

        </div>
    );
};

export default SuperAdminNavbar;
