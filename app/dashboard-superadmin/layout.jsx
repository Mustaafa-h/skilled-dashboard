"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/ui/dashboard/sidebar/superAdminSidebar";
import Topbar from "@/app/ui/dashboard/navbar/navbar";
import styles from "@/app/ui/superadmin/dashboard/superAdminLayout.module.css";

export default function SuperAdminLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

    if (role === "superadmin") {
      setIsAuthorized(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  const closeSidebar = () => setMenuOpen(false);

  if (!isAuthorized) return null;

  return (
    <div className={styles.container}>
      {menuOpen && <div className={styles.backdrop} onClick={closeSidebar}></div>}

      <div className={`${styles.menu} ${menuOpen ? styles.open : ""}`}>
        <SuperAdminSidebar onClose={closeSidebar} />
      </div>

      <div className={`${styles.content} ${menuOpen ? styles.shifted : ""}`}>
        <Topbar onToggleSidebar={() => setMenuOpen(prev => !prev)} />
        {children}
      </div>
    </div>
  );
}
