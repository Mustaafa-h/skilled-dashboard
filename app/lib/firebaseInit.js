import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB1LrlzgzrqDJZnX6pKxeFknCtSsJ_tp_o",
  authDomain: "push-test-4ec2a.firebaseapp.com",
  projectId: "push-test-4ec2a",
  storageBucket: "push-test-4ec2a.firebasestorage.app",
  messagingSenderId: "783184967499",
  appId: "1:783184967499:web:a543f7f1a4bb089e211ace"
};
const app = initializeApp(firebaseConfig);

let messaging = null;
if (typeof window !== "undefined" && "Notification" in window) {
  messaging = getMessaging(app);
}

export { messaging, onMessage, getToken };
