import { io } from "socket.io-client";

/**
 * Socket.IO URL configuration.
 * Uses VITE_SOCKET_URL if explicitly provided, or strips '/api' from VITE_API_URL,
 * defaulting to 'http://localhost:5001'.
 */
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5001");

/**
 * Default Socket.IO client options with built-in reconnection configuration.
 */
const DEFAULT_OPTIONS = {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"],
  withCredentials: true
};

// Singleton socket instance and active token reference
let socket = null;
let currentToken = null;

/**
 * Connects to the backend Socket.IO server using the authenticated JWT token.
 * Reuses existing active socket connection to avoid duplicate sockets.
 *
 * @param {string} [explicitToken] - Optional JWT token; falls back to localStorage 'knot_token'
 * @returns {import("socket.io-client").Socket | null} Active socket instance or null if unauthenticated
 */
export function connect(explicitToken = null) {
  const token = explicitToken || (typeof localStorage !== "undefined" ? localStorage.getItem("knot_token") : null);

  // Connection is strictly created only when a valid authenticated session exists
  if (!token || typeof token !== "string" || !token.trim()) {
    console.warn("[SocketService] Connection aborted: No valid authentication token available");
    return null;
  }

  const cleanToken = token.trim();

  // If a socket instance already exists
  if (socket) {
    // If the token hasn't changed, reuse the existing connection
    if (currentToken === cleanToken) {
      if (!socket.connected) {
        socket.connect();
      }
      return socket;
    }

    // Token has changed (e.g. user switched account): disconnect the stale socket cleanly
    disconnect();
  }

  currentToken = cleanToken;

  socket = io(SOCKET_URL, {
    ...DEFAULT_OPTIONS,
    auth: {
      token: cleanToken
    }
  });

  socket.on("connect", () => {
    console.log(`[SocketService] Connected to ${SOCKET_URL} (Socket ID: ${socket.id})`);
  });

  socket.on("connect_error", (error) => {
    console.error("[SocketService] Connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[SocketService] Disconnected: ${reason}`);

    // Socket.IO client auto-reconnects for transient drops (transport close, ping timeout).
    // However, if the SERVER explicitly disconnected this socket (e.g., after a server
    // restart or forced eviction), Socket.IO client stops reconnecting by default.
    // In that case, attempt manual reconnection — but only while a valid token is
    // still present, so unauthenticated users are never accidentally reconnected.
    if (reason === "io server disconnect") {
      const tokenStillValid =
        currentToken && typeof localStorage !== "undefined"
          ? localStorage.getItem("knot_token") === currentToken
          : Boolean(currentToken);

      if (tokenStillValid) {
        console.log("[SocketService] Server-initiated disconnect — attempting reconnect");
        socket.connect();
      }
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`[SocketService] Reconnected after ${attemptNumber} attempt(s)`);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`[SocketService] Reconnect attempt #${attemptNumber}…`);
  });

  socket.on("reconnect_error", (error) => {
    console.error("[SocketService] Reconnect error:", error.message);
  });

  socket.on("reconnect_failed", () => {
    console.error("[SocketService] All reconnection attempts exhausted");
  });

  return socket;
}

/**
 * Disconnects the socket connection cleanly and resets the singleton instance.
 */
export function disconnect() {
  if (socket) {
    console.log("[SocketService] Disconnecting socket cleanly");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}

/**
 * Returns the current active socket instance, or null if not connected.
 *
 * @returns {import("socket.io-client").Socket | null}
 */
export function getSocket() {
  return socket;
}

/**
 * Returns true if the socket is currently connected.
 *
 * @returns {boolean}
 */
export function isConnected() {
  return Boolean(socket && socket.connected);
}

/**
 * Returns a string describing the current connection state:
 *   "connected"    — socket is active and connected
 *   "reconnecting" — socket is in the reconnection backoff loop
 *   "disconnected" — socket is not connected and not attempting to reconnect
 *
 * @returns {"connected" | "reconnecting" | "disconnected"}
 */
export function getConnectionState() {
  if (!socket) return "disconnected";
  if (socket.connected) return "connected";
  if (socket.active) return "reconnecting"; // socket.active is true during auto-reconnect
  return "disconnected";
}

/**
 * Registers an event listener on the active socket.
 *
 * @param {string} event - Event name to listen for
 * @param {Function} callback - Event handler function
 */
export function on(event, callback) {
  if (!socket) {
    console.warn(`[SocketService] Attempted to listen for "${event}" but socket is not initialized`);
    return;
  }
  socket.on(event, callback);
}

/**
 * Removes an event listener from the active socket.
 *
 * @param {string} event - Event name
 * @param {Function} [callback] - Specific handler to remove; if omitted, removes all for event
 */
export function off(event, callback) {
  if (!socket) return;
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
}

/**
 * Registers a one-time event listener on the active socket.
 *
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function
 */
export function once(event, callback) {
  if (!socket) {
    console.warn(`[SocketService] Attempted once("${event}") but socket is not initialized`);
    return;
  }
  socket.once(event, callback);
}

/**
 * Emits an event to the backend server with optional acknowledgement callback.
 *
 * @param {string} event - Event name to emit
 * @param {any} data - Event payload
 * @param {Function} [callback] - Optional acknowledgement callback
 */
export function emit(event, data, callback) {
  if (!socket) {
    console.warn(`[SocketService] Cannot emit "${event}": Socket not initialized`);
    if (typeof callback === "function") {
      callback({ success: false, error: "Socket not initialized" });
    }
    return;
  }

  socket.emit(event, data, callback);
}

// Automatically disconnect if the authentication token is removed in another tab
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "knot_token" && !event.newValue) {
      disconnect();
    }
  });
}

const socketService = {
  connect,
  disconnect,
  getSocket,
  isConnected,
  getConnectionState,
  on,
  off,
  once,
  emit
};

export default socketService;
