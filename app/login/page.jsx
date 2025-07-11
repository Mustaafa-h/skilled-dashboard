"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/lib/api";

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

    try {
        console.log("🚀 Attempting login with:", { email, password });

        const response = await login(email, password);
        console.log("✅ Login API response:", response.data);

        if (response.data.success && response.data.data.accessToken) {
            const token = response.data.data.accessToken;
            localStorage.setItem("token", token);
            console.log("✅ Saved JWT to localStorage:", token);

            // Decode token to get role
            const tokenPayload = JSON.parse(atob(token.split(".")[1]));
            console.log("✅ Decoded token payload:", tokenPayload);

            const role = tokenPayload.role?.toLowerCase();
            console.log("✅ User role:", role);

            if (role === "superadmin") {
                console.log("✅ Redirecting to /dashboard-superadmin");
                router.push("/dashboard-superadmin");
            } else if (role === "admin") {
                console.log("✅ Redirecting to /dashboard");
                router.push("/dashboard");
            } else {
                console.error("❌ Unauthorized role:", role);
                setError("Unauthorized role.");
            }
        } else {
            console.error("❌ Invalid credentials or missing token:", response.data);
            setError(response.data.message || "Invalid credentials");
        }
    } catch (err) {
        console.error("❌ Login error:", err);
        setError(err.response?.data?.message || "An error occurred. Please try again.");
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
