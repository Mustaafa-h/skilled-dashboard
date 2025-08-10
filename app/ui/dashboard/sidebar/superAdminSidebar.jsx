"use client";
// superadmin sidebar 
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import styles from "./superAdminSidebar.module.css";
import { useTranslations } from "next-intl";
import {
    MdSupervisedUserCircle,
    MdDashboard,
    MdBusiness,
    MdMiscellaneousServices,
    MdTune,
    MdPhotoLibrary,
    MdSettings,
} from "react-icons/md";

const SuperAdminSidebar = ({ onClose, menuOpen }) => {
    const t = useTranslations("Sidebar");
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
        role: t("userRole", { defaultValue: "Platform Administrator" }),
    };

    const menuItems = [
        {
            title: t("section.platform", { defaultValue: "Platform" }),
            list: [
                {
                    title: t("dashboard", { defaultValue: "Dashboard" }),
                    path: "/dashboard-superadmin",
                    icon: <MdDashboard />,
                },
                {
                    title: t("companies", { defaultValue: "Companies" }),
                    path: "/dashboard-superadmin/companies",
                    icon: <MdBusiness />,
                },
                {
                    title: t("services", { defaultValue: "Services" }),
                    path: "/dashboard-superadmin/services",
                    icon: <MdMiscellaneousServices />,
                },
                {
                    title: t("preferences", { defaultValue: "Preferences" }),
                    path: "/dashboard-superadmin/preferences",
                    icon: <MdTune />,
                },
                { title: t("banners", { defaultValue: "Banners" }), path: "/dashboard-superadmin/banners", icon: <MdPhotoLibrary /> },


                { title: t("admins", { defaultValue: "Admins" }), path: "/dashboard-superadmin/admins", icon: <MdSupervisedUserCircle /> },

                {
                    title: t("settings", { defaultValue: "Settings" }),
                    path: "/dashboard-superadmin/settings",
                    icon: <MdSettings />,
                },
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
