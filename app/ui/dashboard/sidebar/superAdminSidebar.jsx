"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import styles from "./superAdminSidebar.module.css";
import { useTranslations } from "next-intl";
import {
    MdDashboard,
    MdBusiness,
    MdGroup,
    MdMiscellaneousServices,
    MdTune,
    MdPhotoLibrary,
    MdReceiptLong,
    MdBarChart,
    MdAdminPanelSettings,
    MdSettings,
    MdNotifications
} from "react-icons/md";

const SuperAdminSidebar = ({ onClose, menuOpen }) => {
    const t = useTranslations();
    const pathname = usePathname();
    const prevPath = useRef(pathname);

    useEffect(() => {
        if (prevPath.current !== pathname) {
            prevPath.current = pathname;
            if (onClose) {
                onClose();
            }
        }
    }, [pathname, onClose]);

    const user = {
        img: "/noavatar.png",
        username: "SuperAdmin",
        role: "Platform Administrator",
    };

    const menuItems = [
        {
            title: "Platform",
            list: [
                { title: "Dashboard", path: "/dashboard-superadmin", icon: <MdDashboard /> },
                { title: "Companies", path: "/dashboard-superadmin/companies", icon: <MdBusiness /> },
                { title: "Workers", path: "/dashboard-superadmin/workers", icon: <MdGroup /> },
                { title: "Services", path: "/dashboard-superadmin/services", icon: <MdMiscellaneousServices /> },
                { title: "Preferences", path: "/dashboard-superadmin/preferences", icon: <MdTune /> },
                { title: "Gallery", path: "/dashboard-superadmin/gallery", icon: <MdPhotoLibrary /> },
                { title: "Transactions", path: "/dashboard-superadmin/transactions", icon: <MdReceiptLong /> },
                { title: "Reports", path: "/dashboard-superadmin/reports", icon: <MdBarChart /> },
                { title: "Admin Management", path: "/dashboard-superadmin/admins", icon: <MdAdminPanelSettings /> },
                { title: "Settings", path: "/dashboard-superadmin/settings", icon: <MdSettings /> },
                { title: "Notifications", path: "/dashboard-superadmin/notifications", icon: <MdNotifications /> },
            ],
        },
    ];

    return (
         <div className={`${styles.container} ${menuOpen ? styles.open : ""}`}>
            <div className={styles.user}>
                <Image
                    className={styles.userImage}
                    src={user.img}
                    alt="User"
                    width={50}
                    height={50}
                />
                <div className={styles.userDetail}>
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.userTitle}>{user.role}</span>
                </div>
            </div>

            <ul className={styles.list}>
                {menuItems.map((cat) => (
                    <li key={cat.title}>
                        <span className={styles.cat}>{cat.title}</span>
                        {cat.list.map((item) => (
                            <MenuLink item={item} key={item.path} />
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SuperAdminSidebar;
