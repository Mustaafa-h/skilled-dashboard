/* global self */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB1LrlzgzrqDJZnX6pKxeFknCtSsJ_tp_o",
  authDomain: "push-test-4ec2a.firebaseapp.com",
  projectId: "push-test-4ec2a",
  storageBucket: "push-test-4ec2a.firebasestorage.app",
  messagingSenderId: "783184967499",
  appId: "1:783184967499:web:a543f7f1a4bb089e211ace"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
