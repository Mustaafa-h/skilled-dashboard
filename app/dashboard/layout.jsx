"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../ui/dashboard/navbar/navbar";
import Sidebar from "../ui/dashboard/sidebar/sidebar";
import styles from "../ui/dashboard/dashboard.module.css";
import Footer from "../ui/dashboard/footer/footer";

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

    if (role === "company_admin") {
      setIsAuthorized(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthorized) return null;

  return (
    <div className={styles.container}>
      <div className={styles.menu}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <>
          <div className={styles.sidebarBackdrop} onClick={toggleSidebar}></div>
          <div className={styles.sidebarOverlay}>
            <Sidebar onClose={toggleSidebar} />
          </div>
        </>
      )}

      <div className={styles.content}>
        <Navbar onToggleSidebar={toggleSidebar} />
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
