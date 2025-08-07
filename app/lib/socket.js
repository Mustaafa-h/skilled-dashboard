// app/lib/socket.js
import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize and return a singleton Socket.IO client, authenticated via JWT.
 */
export function connectSocket() {
  if (socket) {
    console.log('[Socket] connectSocket: socket already initialized');
    return socket;
  }

  let token = null;
  try {
    token = localStorage.getItem('token');
    console.log('[Socket] Retrieved token from localStorage');
  } catch (err) {
    console.error('[Socket] Error reading token from localStorage', err);
  }
  if (!token) {
    console.warn('[Socket] No auth token found in localStorage');
  }

  // Derive root URL for chat (strip /api/v1 if present in base URL)
  let rootUrl = '';
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base) {
    rootUrl = base.replace(/\/api\/v1\/?$/, '');
  } else if (typeof window !== 'undefined') {
    rootUrl = window.location.origin;
  }
  const chatUrl = `${rootUrl}/chat`;
  console.log('[Socket] connectSocket: attempting connection to', chatUrl);

  socket = io(chatUrl, {
    transports: ['websocket'],
    auth: { token },
    extraHeaders: { Authorization: token ? `Bearer ${token}` : undefined },
  });

  // Core events
  socket.on('connect', () => {
    console.log('[Socket] on connect:', socket.id);
  });
  socket.on('disconnect', (reason) => {
    console.log('[Socket] on disconnect:', reason);
  });
  socket.on('connect_error', (error) => {
    console.error('[Socket] on connect_error:', error);
  });
  socket.on('connection_established', (payload) => {
    console.log('[Socket] on connection_established:', payload);
  });

  // Debug: log every event
  socket.onAny((event, ...args) => {
    console.log(`[Socket] event received: ${event}`, ...args);
  });

  return socket;
}

/**
 * Manually disconnect and clear the singleton.
 */
export function disconnectSocket() {
  if (!socket) {
    console.warn('[Socket] disconnectSocket: no socket to disconnect');
    return;
  }
  socket.disconnect();
  console.log('[Socket] disconnectSocket: socket manually disconnected');
  socket = null;
}

/**
 * Listen for a specific socket event.
 */
export function onEvent(event, callback) {
  if (!socket) {
    console.warn('[Socket] onEvent: socket not initialized for event', event);
    return;
  }
  socket.on(event, callback);
}

/**
 * Stop listening for a specific socket event.
 */
export function offEvent(event, callback) {
  if (!socket) {
    console.warn('[Socket] offEvent: socket not initialized for event', event);
    return;
  }
  socket.off(event, callback);
}

/**
 * Emit an event with an optional payload.
 */
export function emitEvent(event, payload) {
  if (!socket) {
    console.warn('[Socket] emitEvent: socket not initialized for event', event, payload);
    return;
  }
  console.log('[Socket] emitEvent:', event, payload);
  socket.emit(event, payload);
}

/**
 * Listen to all socket events (firehose mode).
 */
export function onAnyEvent(listener) {
  if (!socket) {
    console.warn('[Socket] onAnyEvent: socket not initialized');
    return;
  }
  socket.onAny(listener);
}
