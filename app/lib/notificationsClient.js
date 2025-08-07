// app/lib/notificationsClient.js

const LS_KEY = "notifications:v1";

/** read all (newest first) */
export function loadNotifications() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list = JSON.parse(raw) || [];
    console.log("[notificationsClient] Loaded notifications:", list);
    return list;
  } catch (e) {
    console.error("[notificationsClient] loadNotifications parse error:", e);
    return [];
  }
}

/** save and notify listeners */
function saveNotifications(list) {
  console.log("[notificationsClient] Saving notifications:", list);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  // notify this tab
  window.dispatchEvent(new Event("notifications:updated"));
}

/** add one notification at the top */
export function addNotification(n) {
  console.log("[notificationsClient] addNotification:", n);
  const list = loadNotifications();
  list.unshift(n);
  saveNotifications(list);
}

/** clear all notifications (e.g., on bell-click) */
export function clearNotifications() {
  console.log("[notificationsClient] clearNotifications()");
  saveNotifications([]);
}

/** subscribe to changes (both same-tab + other tabs) */
export function subscribeNotifications(cb) {
  const refresh = () => {
    const list = loadNotifications();
    console.log("[notificationsClient] subscribeNotifications → new list:", list);
    cb(list);
  };

  const onStorage = (e) => {
    if (e.key === LS_KEY) {
      console.log("[notificationsClient] storage event for key:", e.key);
      refresh();
    }
  };

  // same-tab notifications
  window.addEventListener("notifications:updated", refresh);
  // cross-tab notifications
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("notifications:updated", refresh);
    window.removeEventListener("storage", onStorage);
  };
}
