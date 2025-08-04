// app/dashboard/layout.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../ui/dashboard/navbar/navbar";
import Sidebar from "../ui/dashboard/sidebar/sidebar";
import styles from "../ui/dashboard/dashboard.module.css";
import Footer from "../ui/dashboard/footer/footer";
import { connectSocket, disconnectSocket } from "../lib/socket";

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1) Check auth on mount
  useEffect(() => {
    let role = null;
    try {
      role = localStorage.getItem("role");
      console.log("[Layout] Retrieved role:", role);
    } catch (err) {
      console.error("[Layout] Error reading role from localStorage:", err);
    }

    if (role === "company_admin") {
      console.log("[Layout] Authorization OK");
      setIsAuthorized(true);
    } else {
      console.warn("[Layout] Not authorized, redirecting to /login");
      router.push("/login");
    }
  }, [router]);

  // 2) Once authorized, establish the socket connection
  useEffect(() => {
    if (!isAuthorized) return;

    console.log("[Layout] isAuthorized=true, connecting socket...");
    const sock = connectSocket();

    return () => {
      console.log("[Layout] Cleaning up socket...");
      disconnectSocket();
    };
  }, [isAuthorized]);

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  // Don’t render anything until auth is confirmed
  if (!isAuthorized) return null;

  return (
    <div className={styles.container}>
      <div className={styles.menu}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <>
          <div className={styles.sidebarBackdrop} onClick={toggleSidebar} />
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
