const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { registerSocketHandlers } = require("./handlers");
const { handleUserConnected, handleUserDisconnected } = require("./presence");
const { handleTypingCleanupOnDisconnect } = require("./typing");

let io = null;

/**
 * Initializes Socket.IO on the provided HTTP server.
 * Configures CORS, JWT authentication middleware, and connection lifecycle.
 *
 * @param {import("http").Server} httpServer - Node HTTP server instance
 * @returns {Server} Initialized Socket.IO server instance
 */
function initSocket(httpServer) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true
    }
  });

  // JWT socket authentication middleware
  io.use((socket, next) => {
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!rawToken || typeof rawToken !== "string") {
      const err = new Error("Authentication error: Token is required");
      return next(err);
    }

    let token = rawToken.trim();
    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    if (!process.env.JWT_SECRET) {
      const err = new Error("Server error: JWT_SECRET is not configured");
      return next(err);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.userId) {
        const err = new Error("Authentication error: Invalid token payload");
        return next(err);
      }

      // Attach authenticated identity extracted from verified token
      socket.user = {
        id: decoded.userId
      };

      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const err = new Error("Authentication error: Token expired");
        return next(err);
      }
      const err = new Error("Authentication error: Invalid token");
      return next(err);
    }
  });

  // Connection lifecycle
  io.on("connection", (socket) => {
    const userId = socket.user?.id;

    if (userId) {
      // Join user's personal room using their authenticated ID
      socket.join(userId);
      console.log(`Socket connected: ${socket.id} (User ID: ${userId})`);

      // Track online presence (broadcasts presence:online if first connection)
      handleUserConnected(io, socket);
    }

    // Register modular socket event handlers (conversation rooms, real-time messaging, presence)
    registerSocketHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (User ID: ${userId}, Reason: ${reason})`);

      // Clean up stale typing indicators before presence update
      handleTypingCleanupOnDisconnect(io, socket);

      // Track offline presence and update lastSeenAt if last socket connection
      handleUserDisconnected(io, socket, reason);
    });
  });

  return io;
}

/**
 * Returns the initialized Socket.IO server instance.
 * Throws an error if initSocket has not yet been invoked.
 *
 * @returns {Server}
 */
function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Please call initSocket first.");
  }
  return io;
}

module.exports = initSocket;
module.exports.initSocket = initSocket;
module.exports.getIO = getIO;
