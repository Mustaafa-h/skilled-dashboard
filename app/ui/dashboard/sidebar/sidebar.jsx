"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import { useTranslations } from "next-intl";
import {
  MdBusiness,
  MdDashboard,
  MdSupervisedUserCircle,
  MdAttachMoney,
  MdOutlineSettings,
  MdHelpCenter,
  MdPhotoLibrary,
  MdChatBubble,
  MdCleaningServices,
  MdRoomPreferences,
} from "react-icons/md";
import { getCompany } from "../../../lib/api";

const Sidebar = ({ onClose }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  const [companyName, setCompanyName] = useState("Loading...");
  const [companyLogo, setCompanyLogo] = useState("/noavatar.png");

  // close sidebar when path changes
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      if (onClose) onClose();
    }
  }, [pathname, onClose]);

  // fetch company info once on mount
  useEffect(() => {
    const fetchCompany = async () => {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        console.warn("No companyId in localStorage");
        return;
      }

      try {
        console.log("📡 Fetching company for ID:", companyId);
        const res = await getCompany(companyId);
        const companyData = res?.data?.data;
        console.log("🏢 Company data:", companyData);

        // name
        setCompanyName(companyData?.name || "Company");

        // logo, fallback if null or empty
        const logoUrl = companyData?.logo_url;
        if (logoUrl) {
          setCompanyLogo(logoUrl);
        } else {
          console.log("⚠️ No logo_url, falling back to noavatar");
          setCompanyLogo("/noavatar.png");
        }
      } catch (err) {
        console.error("❌ Failed to fetch company:", err);
        setCompanyName("Company");
        setCompanyLogo("/noavatar.png");
      }
    };

    fetchCompany();
  }, []);

  const user = {
    img: companyLogo,
    username: companyName,
    role: t("administrator", { defaultValue: "Administrator" }),
  };

  const menuItems = [
    {
      title: t("pages", { defaultValue: "Pages" }),
      list: [
        { title: t("dashboard", { defaultValue: "Dashboard" }), path: "/dashboard", icon: <MdDashboard /> },
        { title: t("companyInfo", { defaultValue: "Company Info" }), path: "/dashboard/company-info", icon: <MdBusiness /> },
        { title: t("workers", { defaultValue: "Workers" }), path: "/dashboard/users", icon: <MdSupervisedUserCircle /> },
        { title: t("services", { defaultValue: "Services" }), path: "/dashboard/products", icon: <MdCleaningServices /> },
        { title: t("orders", { defaultValue: "Orders" }), path: "/dashboard/orders", icon: <MdAttachMoney /> },
        { title: t("Chat", { defaultValue: "Chat" }), path: "/dashboard/chat", icon: <MdChatBubble /> },
        { title: t("Gallery", { defaultValue: "Gallery" }), path: "/dashboard/gallery", icon: <MdPhotoLibrary /> },
      ],
    },
    {
      title: t("company", { defaultValue: "Company" }),
      list: [
        { title: t("admins", { defaultValue: "Admins" }), path: "/dashboard/admins", icon: <MdSupervisedUserCircle /> },
        { title: t("preferences", { defaultValue: "Preferences" }), path: "/dashboard/preferences", icon: <MdRoomPreferences /> },
        { title: t("settings", { defaultValue: "Settings" }), path: "/dashboard/settings", icon: <MdOutlineSettings /> },
        { title: t("privacyPolicy", { defaultValue: "Privacy Policy" }), path: "/dashboard/privacy", icon: <MdHelpCenter /> },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.user}>

        <img className={styles.userImage} src={user.img} alt="company logo" width={50} height={50}/>
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

export default Sidebar;
