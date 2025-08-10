"use client";
// app/login/page.jsx

import { useState }  from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting login with:", { email, password });

      // ▶️ 1. Log in
      const response = await fetch("/api/login", {
        method:      "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept:        "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("🔑 Login response:", result);

      if (!response.ok || !result.success) {
        console.error("❌ Login failed:", result.message);
        throw new Error(result.message || "Login failed");
      }

      const { user, accessToken } = result;
      console.log("👤 User from login:", user);
      console.log("🛡️ Access token:", accessToken);

      if (!user || !accessToken) {
        throw new Error("Invalid login response structure");
      }

      const role = user.role;
      console.log("📋 Role:", role);

      // ▶️ 2. Fetch profile to get companyId & pick up any rotated token
      console.log("🔍 Fetching profile for companyId…");
      const profileRes  = await fetch("/api/profile", {
        method:      "GET",
        credentials: "include",
      });
      const profileJson = await profileRes.json();
      console.log("💼 Profile fetched:", profileJson);

      // 2.a) If the server rotated the token, update localStorage
      if (profileJson.newAccessToken) {
        console.log("🔄 Server rotated token, updating localStorage");
        localStorage.setItem("token", profileJson.newAccessToken);
      } else {
        localStorage.setItem("token", accessToken);
      }

      const companyId = profileJson.data?.companyId || null;
      console.log("🏢 Company ID:", companyId);

      // ▶️ 3. Persist role & companyId
      localStorage.setItem("role", role);
      if (role === "company_admin" && companyId) {
        localStorage.setItem("companyId", companyId);
      }

      // ▶️ 4. Redirect
      if (role === "superadmin" || "admin") {
        router.push("/dashboard-superadmin");
      } else if (role === "company_admin") {
        router.push("/dashboard");
      } else {
        throw new Error("Unauthorized role");
      }
    } catch (err) {
      console.error("🔥 Login exception:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
        maxWidth:    "400px",
        margin:      "80px auto",
        padding:     "20px",
        border:      "1px solid #ddd",
        borderRadius:"8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width:        "100%",
              padding:      "10px",
              borderRadius: "4px",
              border:       "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width:        "100%",
              padding:      "10px",
              borderRadius: "4px",
              border:       "1px solid #ccc",
            }}
          />
        </div>
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width:        "100%",
            padding:      "10px",
            borderRadius: "4px",
            background:   "#0070f3",
            color:        "white",
            border:       "none",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
