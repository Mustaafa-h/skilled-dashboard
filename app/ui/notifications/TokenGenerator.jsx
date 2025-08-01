"use client";

import { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "@/app/lib/firebaseInit";

const TokenGenerator = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const getFCMToken = async () => {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: "BFK5frAHqQ5UXxoHFdc7PLyrXAE6hJQ8JYMZb9PszYZab4Tra-sLWGdcewjV9RevwUOqoPPo1-M1Op5v2DOm1QE"
        });

        if (currentToken) {
          setToken(currentToken);
          console.log("FCM Token:", currentToken);
        } else {
          console.warn("No token received. Request permission to generate one.");
        }
      } catch (err) {
        console.error("Token error:", err);
      }
    };

    getFCMToken();

    onMessage(messaging, (payload) => {
      console.log("Message received in foreground: ", payload);
      alert(`New Notification: ${payload.notification?.title}`);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>🔐 Your FCM Token</h3>
      {/* <textarea rows={4} cols={70} readOnly value={token} /> */}
    </div>
  );
};

export default TokenGenerator;
