"use client";

export default function UserDashboard() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            backgroundColor: "var(--bgSoft)",
            color: "var(--text)",
            fontFamily: "sans-serif"
        }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Welcome!</h1>
            <p style={{ fontSize: "1.2rem" }}>This is the User&apos;s Dashboard.</p>

        </div>
    );
}
