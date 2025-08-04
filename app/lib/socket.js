// app/lib/socket.js
import { io } from 'socket.io-client';

let socket = null;

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

  // Derive root URL for chat (remove /api/v1 if present)
  let rootUrl = '';
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    rootUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  } else if (typeof window !== 'undefined') {
    rootUrl = window.location.origin;
  }
  const chatUrl = `${rootUrl}/chat`;
  console.log('[Socket] connectSocket: attempting connection to', chatUrl);

  socket = io(chatUrl, {
    transports: ['websocket'],
    auth: { token },
    extraHeaders: { Authorization: `Bearer ${token}` },
  });

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

  return socket;
}

/**
 * Disconnect the current Socket.IO client.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    console.log('[Socket] disconnectSocket: socket manually disconnected');
    socket = null;
  } else {
    console.warn('[Socket] disconnectSocket: no socket to disconnect');
  }
}

/**
 * Subscribe to a Socket.IO event.
 */
export function onEvent(event, callback) {
  if (!socket) {
    console.warn('[Socket] onEvent: called before socket is initialized', event);
    return;
  }
  socket.on(event, callback);
}

/**
 * Emit a Socket.IO event with payload.
 */
export function emitEvent(event, payload) {
  if (!socket) {
    console.warn('[Socket] emitEvent: called before socket is initialized', event, payload);
    return;
  }
  socket.emit(event, payload);
}
