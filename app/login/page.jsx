"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

      if (password.length < 6) {
    setError("Password must be at least 6 characters long");
    return;
  }

    try {
      console.log("🔐 Attempting login with:", { email, password });

      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Login failed:", errorData.message);
        throw new Error(errorData.message || "Login failed");
      }

            // Step 2: Fetch /api/profile to get user data
      const profileRes = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      } );
      console.log("prfRes==",profileRes)
      if (!profileRes.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profile = await profileRes.json(); 

      console.log("prof==",profile)

      const result = await response.json();
      console.log("✅ Login result:", result);

      const user = result.data?.user || result.user || result.data || {};
      const role = user.role?.toLowerCase?.();
      const companyId = profile.data.companyId|| null;

      console.log("loginpage user-==",user)
      console.log(" user == ",user,"🧾", "Role:", role, "| Company ID:", companyId);

      if (!role) {
        throw new Error("No role returned from login.");
      }

      //  store in localStorage
      localStorage.setItem("role", role);
      localStorage.setItem("token", result.data.token)
      if (role === "company_admin" && companyId) {
        localStorage.setItem("companyId", companyId);
      }

      // Redirect based on role
      if (role === "superadmin") {
        router.push("/dashboard-superadmin");
      } else if (role === "company_admin") {
        router.push("/dashboard");
      } else {
        setError("Unauthorized role.");
      }
    } catch (err) {
      console.error("🔥 Login exception:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", borderRadius: "4px", background: "#0070f3", color: "white", border: "none" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
