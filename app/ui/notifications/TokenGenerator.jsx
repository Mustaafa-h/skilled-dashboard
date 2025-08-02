"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { app, messaging, getToken, onMessage } from "@/app/lib/firebaseInit";
import { getInstallations, getId } from "firebase/installations";
import { pushFcmAndFid, getDevice } from "@/app/lib/api";
import toast from "react-hot-toast";

const VAPID_PUBLIC_KEY =
  "BN8xZHedJu_bwri5G6VcRQ2j9oRMhNf9ovaUHXsRPeThGv3OZiQYkEo4d2Qqg_xwwAMs3mN2UMimllKO0qrNYQg";

const TokenGenerator = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const unsubRef = useRef(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        if (!messaging) {
          console.log("[TokenGenerator] messaging unavailable (SSR/unsupported browser).");
          return;
        }

        // 1) Service Worker
        let swReg;
        try {
          console.log("[TokenGenerator] Registering service worker…");
          swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          console.log("[TokenGenerator] SW scope:", swReg.scope);
        } catch (e) {
          console.error("[TokenGenerator] SW registration failed:", e);
          toast.error("SW registration failed (see console)");
          return;
        }

        // 2) FID (deviceId)
        let fid = "";
        try {
          console.log("[TokenGenerator] Getting FID using getInstallations/getId…");
          fid = await getId(getInstallations(app));
          console.log("[TokenGenerator] FID (deviceId):", fid);
        } catch (e) {
          console.error("[TokenGenerator] Getting FID failed:", e);
          toast.error("Failed to get FID (see console)");
          return;
        }

        // 3) FCM token
        if (Notification.permission === "denied") {
          console.warn("[TokenGenerator] Notification permission is denied by the user.");
          toast.error("Notifications are blocked in the browser.");
          return;
        }

        let currentToken = "";
        try {
          console.log("[TokenGenerator] Requesting FCM token with VAPID…");
          currentToken = await getToken(messaging, {
            vapidKey: VAPID_PUBLIC_KEY,
            serviceWorkerRegistration: swReg,
          });
          if (!currentToken) {
            console.warn("[TokenGenerator] No FCM token (permission not granted).");
            toast.error("No FCM token (permission not granted).");
            return;
          }
          setToken(currentToken);
          console.log("[TokenGenerator] FCM token:", String(currentToken));
        } catch (e) {
          console.error("[TokenGenerator] getToken failed:", e);
          toast.error("getToken failed (see console)");
          return;
        }

        // 4) Check backend and send only if needed
        try {
          console.log("[TokenGenerator] Fetching devices from backend…");
          const res = await getDevice(); // Axios response
          console.log("[TokenGenerator] Devices response:", res);

          // Your endpoint returns an array (per Swagger screenshot)
          const list = Array.isArray(res?.data) ? res.data : [];
          const existing = list[0] || null;

          const needCreateOrUpdate =
            !existing || // nothing saved
            existing.deviceId !== fid || // different deviceId (new browser/profile)
            existing.fcmToken !== currentToken; // token rotated

          if (needCreateOrUpdate) {
            console.log(
              "[TokenGenerator] CHANGED → calling pushFcmAndFid()",
              { backendDevice: existing, newDeviceId: fid, newFcmToken: currentToken }
            );
            toast("Sending device to backend…");
            await pushFcmAndFid(fid, currentToken);
            console.log("[TokenGenerator] pushFcmAndFid SUCCESS");
            toast.success("Device saved/updated on backend");
          } else {
            console.log("[TokenGenerator] Device & token match backend; NOT posting.");
          }
        } catch (e) {
          console.error("[TokenGenerator] Backend check/post failed:", e);
          toast.error("Failed contacting backend (see console)");
        }

        // 5) Foreground messages: toast + alert
        try {
          unsubRef.current = onMessage(messaging, (payload) => {
            console.log("[TokenGenerator] Foreground message:", payload);

            // Prefer the notification fields; fall back to data if needed
            const title = payload.notification?.title || payload.data?.title || "Notification";
            const body = payload.notification?.body || payload.data?.body || "";

            // Useful data you can route with
            const { type, bookingId, companyId, messageId } = payload.data || {};

            toast.custom((t) => (
              <div
                onClick={() => {
                  if (bookingId) router.push(`dashboard/orders/${bookingId}`);
                  toast.dismiss(t.id);
                }}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  width: 360,
                  cursor: "pointer",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #384456ff",
                  background: "#cbccceff",
                  color: "#000000ff",
                  boxShadow: "0 10px 15px rgba(0,0,0,.15)",
                }}
                role="alert"
              >
                <div style={{ fontSize: 25, lineHeight: "20px" }}>🔔</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{title}</div>
                  {body && (
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{body}</div>
                  )}
                  {bookingId && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#93c5fd",
                        textDecoration: "underline",
                      }}
                    >
                      Open order
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  aria-label="Dismiss"
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "#9CA3AF",
                    fontSize: 18,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ), { duration: 6000, position: "top-right" });


          });

        } catch (e) {
          console.error("[TokenGenerator] onMessage listener failed:", e);
        }
      } catch (err) {
        console.error("[TokenGenerator] FCM init error (outer catch):", err);
        toast.error("FCM init error (see console)");
      }
    })();

    return () => {
      if (unsubRef.current) {
        console.log("[TokenGenerator] Unsubscribing foreground listener");
        unsubRef.current();
      }
    };
  }, []);

  return <div style={{ padding: 20 }} />;
};

export default TokenGenerator;
