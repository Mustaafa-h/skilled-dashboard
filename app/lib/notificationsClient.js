// app/lib/notificationsClient.js
const LS_KEY = "notifications:v1";

/** read all (newest first) */
export function loadNotifications() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

/** save and notify listeners */
function saveNotifications(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  // notify this tab
  window.dispatchEvent(new Event("notifications:updated"));
}

/** add one notification at the top */
export function addNotification(n) {
  const list = loadNotifications();
  list.unshift(n);
  saveNotifications(list);
}

/** clear all (handy while testing) */
export function clearNotifications() {
  saveNotifications([]);
}

/** subscribe to changes (both same-tab + other tabs) */
export function subscribeNotifications(cb) {
  const refresh = () => cb(loadNotifications());
  const onStorage = (e) => {
    if (e.key === LS_KEY) refresh();
  };
  window.addEventListener("notifications:updated", refresh);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("notifications:updated", refresh);
    window.removeEventListener("storage", onStorage);
  };
}
