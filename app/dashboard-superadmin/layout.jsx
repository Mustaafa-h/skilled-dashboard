"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/ui/dashboard/sidebar/superAdminSidebar";
import Topbar from "@/app/ui/dashboard/navbar/navbar";
import styles from "@/app/ui/superadmin/dashboard/superAdminLayout.module.css";
import { getUserFromLocalStorage } from "@/app/lib/auth";

export default function SuperAdminLayout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const user = getUserFromLocalStorage();
        if (!user || user.role.toLowerCase() !== "superadmin") {
            router.push("/login");
        }
    }, [router]);

    const closeSidebar = () => setMenuOpen(false);

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
