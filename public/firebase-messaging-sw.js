/* global self */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// --- Firebase config (company project) ---
firebase.initializeApp({
  apiKey: "AIzaSyDFynNZFUf1-uxtNJHqsnZMiq4S_Oy3SiU",
  authDomain: "barq-38a57.firebaseapp.com",
  databaseURL: "https://barq-38a57-default-rtdb.firebaseio.com",
  projectId: "barq-38a57",
  storageBucket: "barq-38a57.firebasestorage.app",
  messagingSenderId: "1032193218712",
  appId: "1:1032193218712:web:a9b8dd08fd6c692d1498ed",
  measurementId: "G-Z2ZVVJQBTZ",
});

const messaging = firebase.messaging();

// Optional: keep SW up to date immediately
self.addEventListener("install", (event) => {
  console.log("[SW] Installed");
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(self.clients.claim());
});

// Handle background messages delivered via FCM
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  // Support both notification and data-only payloads
  const title =
    (payload && payload.notification && payload.notification.title) ||
    (payload && payload.data && payload.data.title) ||
    "New notification";

  const body =
    (payload && payload.notification && payload.notification.body) ||
    (payload && payload.data && payload.data.body) ||
    "";

  // Optional deep-link/route if you send one in data
  const clickUrl =
    (payload && payload.data && (payload.data.url || payload.data.route)) || "/";

  const notificationOptions = {
    body,
    icon: "/firebase-logo.png", // optional; replace if you have a brand icon
    data: { clickUrl },         // keep context for click handler
    // tag: "barq",             // uncomment to collapse notifications by tag
  };

  self.registration.showNotification(title, notificationOptions);
});

// Focus/open the app when user clicks the notification
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click:", event.notification);
  event.notification.close();

  const urlToOpen =
    (event.notification && event.notification.data && event.notification.data.clickUrl) ||
    "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Try to focus an existing tab
      for (const client of allClients) {
        if ("focus" in client) {
          // If you want to check URL, you can compare client.url here
          try {
            return client.focus();
          } catch (e) {
            // ignore
          }
        }
      }

      // Or open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })()
  );
});
