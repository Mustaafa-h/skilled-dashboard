"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import { useTranslations } from "next-intl";
import {
  MdBusiness,
  MdDashboard,
  MdSupervisedUserCircle,
  MdShoppingBag,
  MdAttachMoney,
  MdWork,
  MdAnalytics,
  MdPeople,
  MdOutlineSettings,
  MdHelpCenter,
  MdPhotoLibrary,
} from "react-icons/md";

const Sidebar = ({ onClose }) => {
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
    username: t("accountManager", { defaultValue: "Account Manager" }),
    role: t("administrator", { defaultValue: "Administrator" }),
  };

  const menuItems = [
    {
      title: t("pages", { defaultValue: "Pages" }),
      list: [
        {
          title: t("dashboard", { defaultValue: "Dashboard" }),
          path: "/dashboard",
          icon: <MdDashboard />,
        },
        {
          title: t("companyInfo", { defaultValue: "Company Info" }),
          path: "/dashboard/company-info",
          icon: <MdBusiness />,
        },
        {
          title: t("workers", { defaultValue: "Workers" }),
          path: "/dashboard/users",
          icon: <MdSupervisedUserCircle />,
        },
        {
          title: t("services", { defaultValue: "Services" }),
          path: "/dashboard/products",
          icon: <MdShoppingBag />,
        },
        {
          title: t("transactions", { defaultValue: "Transactions" }),
          path: "/dashboard/transactions",
          icon: <MdAttachMoney />,
        },
        {
          title: t("gallery", { defaultValue: "Gallery" }),
          path: "/dashboard/gallery",
          icon: <MdPhotoLibrary />,
        },
      ],
    },
    {
      title: t("analytics", { defaultValue: "Analytics" }),
      list: [
        {
          title: t("revenue", { defaultValue: "Revenue" }),
          path: "/dashboard/revenue",
          icon: <MdWork />,
        },
        {
          title: t("reports", { defaultValue: "Reports" }),
          path: "/dashboard/reports",
          icon: <MdAnalytics />,
        },
        {
          title: t("teams", { defaultValue: "Teams" }),
          path: "/dashboard/teams",
          icon: <MdPeople />,
        },
      ],
    },
    {
      title: t("company", { defaultValue: "Company" }),
      list: [
        {
          title: t("preferences", { defaultValue: "Preferences" }),
          path: "/dashboard/preferences",
          icon: <MdOutlineSettings />,
        },
        {
          title: t("settings", { defaultValue: "Settings" }),
          path: "/dashboard/settings",
          icon: <MdOutlineSettings />,
        },
        {
          title: t("privacyPolicy", { defaultValue: "Privacy Policy" }),
          path: "/dashboard/privacy",
          icon: <MdHelpCenter />,
        },
      ],
    },
  ];

  return (
    <div className={styles.container}>
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

export default Sidebar;
