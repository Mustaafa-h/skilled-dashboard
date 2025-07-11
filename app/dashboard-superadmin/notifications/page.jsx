"use client";

import { useState, useEffect } from "react";

export default function SuperAdminNotificationsPage() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Dummy notifications for now
        const dummyData = [
            { id: 1, title: "New Company Registered", message: "Tech Solutions Inc has registered on the platform.", date: "2025-07-10 14:32" },
            { id: 2, title: "Worker Added", message: "John Doe has been added as a worker to Telemedicine Platform.", date: "2025-07-09 09:15" },
            { id: 3, title: "Service Created", message: "New service 'Data Encryption Services' created by Admin.", date: "2025-07-08 17:48" },
        ];
        setNotifications(dummyData);
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Notifications</h1>
            {notifications.length === 0 ? (
                <p>No notifications found.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {notifications.map((notif) => (
                        <li
                            key={notif.id}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "10px",
                                marginBottom: "10px",
                                background: "#1f2937"
                            }}
                        >
                            <strong>{notif.title}</strong>
                            <p>{notif.message}</p>
                            <small>{notif.date}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
