// app/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 Checking auth & role...");

    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");

    if (!token) {
      console.log("❌ No token found, redirecting to login...");
      router.replace("/login");
      return;
    }

    if (role === "superadmin") {
      console.log("✅ Superadmin detected, redirecting...");
      router.replace("/dashboard-superadmin");
    } else if (role === "company_admin") {
      console.log("✅ Company admin detected, redirecting...");
      router.replace("/dashboard");
    } else {
      console.log("⚠️ Unknown role, redirecting to login...");
      router.replace("/login");
    }
  }, [router]);

  return <div>Redirecting...</div>;
}
