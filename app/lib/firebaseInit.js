// app/lib/firebaseInit.js
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import { getInstallations } from "firebase/installations";

// ===== Firebase (COMPANY PROJECT) – hardcoded for testing =====
const firebaseConfig = {
  apiKey: "AIzaSyDFynNZFUf1-uxtNJHqsnZMiq4S_Oy3SiU",
  authDomain: "barq-38a57.firebaseapp.com",
  databaseURL: "https://barq-38a57-default-rtdb.firebaseio.com",
  projectId: "barq-38a57",
  storageBucket: "barq-38a57.firebasestorage.app",
  messagingSenderId: "1032193218712",
  appId: "1:1032193218712:web:a9b8dd08fd6c692d1498ed",
  measurementId: "G-Z2ZVVJQBTZ",
};

console.log("[firebaseInit] Initializing Firebase with project:", firebaseConfig.projectId);
export const app = initializeApp(firebaseConfig);

// messaging can be null on SSR/unsupported
let messaging = null;
if (typeof window !== "undefined" && "Notification" in window) {
  try {
    messaging = getMessaging(app);
    console.log("[firebaseInit] Messaging initialized");
  } catch (e) {
    console.warn("[firebaseInit] Messaging not supported or failed to init:", e);
  }
} else {
  console.log("[firebaseInit] Messaging skipped (SSR or Notification not in window)");
}

// export commonly used things
export { messaging, onMessage, getToken, getInstallations };
