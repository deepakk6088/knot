const conversationService = require("../services/conversationService");

// Map<socketId, Set<conversationId>> — per-socket typing state tracker.
// Keyed by socket.id so multiple simultaneous connections for the same user
// are tracked independently; disconnecting one socket never clears another's state.
const socketTypingState = new Map();

/**
 * Handler for 'typing:start' event.
 * Validates conversation membership and broadcasts typing start to the room
 * excluding the sending socket.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Authenticated client socket
 * @param {object|string} data - Payload containing conversationId
 * @param {Function} [callback] - Optional acknowledgment callback
 */
async function handleTypingStart(io, socket, data, callback) {
  // Obtain userId strictly from the authenticated socket handshake identity
  const userId = socket.user?.id;

  if (!userId) {
    const errorResponse = { success: false, error: "Unauthorized: Authentication required" };
    if (typeof callback === "function") return callback(errorResponse);
    return socket.emit("typing:error", errorResponse);
  }

  const conversationId = typeof data === "string" ? data : data?.conversationId;

  if (!conversationId || typeof conversationId !== "string" || !conversationId.trim()) {
    const errorResponse = { success: false, error: "conversationId is required" };
    if (typeof callback === "function") return callback(errorResponse);
    return socket.emit("typing:error", errorResponse);
  }

  const trimmedConvId = conversationId.trim();

  try {
    // Reuses existing conversation authorization logic (verifies existence & participant membership)
    await conversationService.getConversationById(trimmedConvId, userId);

    const payload = {
      conversationId: trimmedConvId,
      userId
    };

    // Broadcast to the conversation room excluding the sender socket
    socket.to(trimmedConvId).emit("typing:start", payload);

    // Record that this socket is actively typing in this conversation
    let conversations = socketTypingState.get(socket.id);
    if (!conversations) {
      conversations = new Set();
      socketTypingState.set(socket.id, conversations);
    }
    conversations.add(trimmedConvId);

    if (typeof callback === "function") {
      return callback({ success: true, conversationId: trimmedConvId });
    }
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      success: false,
      error: error.message || "Failed to broadcast typing indicator",
      statusCode
    };

    if (typeof callback === "function") {
      return callback(errorResponse);
    }
    return socket.emit("typing:error", errorResponse);
  }
}

/**
 * Handler for 'typing:stop' event.
 * Validates conversation membership and broadcasts typing stop to the room
 * excluding the sending socket.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Authenticated client socket
 * @param {object|string} data - Payload containing conversationId
 * @param {Function} [callback] - Optional acknowledgment callback
 */
async function handleTypingStop(io, socket, data, callback) {
  // Obtain userId strictly from the authenticated socket handshake identity
  const userId = socket.user?.id;

  if (!userId) {
    const errorResponse = { success: false, error: "Unauthorized: Authentication required" };
    if (typeof callback === "function") return callback(errorResponse);
    return socket.emit("typing:error", errorResponse);
  }

  const conversationId = typeof data === "string" ? data : data?.conversationId;

  if (!conversationId || typeof conversationId !== "string" || !conversationId.trim()) {
    const errorResponse = { success: false, error: "conversationId is required" };
    if (typeof callback === "function") return callback(errorResponse);
    return socket.emit("typing:error", errorResponse);
  }

  const trimmedConvId = conversationId.trim();

  try {
    // Reuses existing conversation authorization logic (verifies existence & participant membership)
    await conversationService.getConversationById(trimmedConvId, userId);

    const payload = {
      conversationId: trimmedConvId,
      userId
    };

    // Broadcast to the conversation room excluding the sender socket
    socket.to(trimmedConvId).emit("typing:stop", payload);

    // Clear this conversation from the socket's typing state
    const conversations = socketTypingState.get(socket.id);
    if (conversations) {
      conversations.delete(trimmedConvId);
      if (conversations.size === 0) {
        socketTypingState.delete(socket.id);
      }
    }

    if (typeof callback === "function") {
      return callback({ success: true, conversationId: trimmedConvId });
    }
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      success: false,
      error: error.message || "Failed to broadcast typing stop indicator",
      statusCode
    };

    if (typeof callback === "function") {
      return callback(errorResponse);
    }
    return socket.emit("typing:error", errorResponse);
  }
}

/**
 * Registers typing indicator event listeners for an authenticated socket.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Authenticated client socket
 */
function registerTypingHandlers(io, socket) {
  socket.on("typing:start", (data, callback) => {
    handleTypingStart(io, socket, data, callback);
  });

  socket.on("typing:stop", (data, callback) => {
    handleTypingStop(io, socket, data, callback);
  });
}

/**
 * Cleans up typing state for a disconnecting socket.
 * Broadcasts 'typing:stop' to every conversation room the socket was
 * actively typing in, then removes the socket entry from the state map.
 *
 * Uses per-socket tracking so that disconnecting one socket for a user
 * never incorrectly clears another active socket's typing state.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Disconnecting client socket
 */
function handleTypingCleanupOnDisconnect(io, socket) {
  const userId = socket.user?.id;
  if (!userId) return;

  const conversations = socketTypingState.get(socket.id);
  if (!conversations || conversations.size === 0) {
    socketTypingState.delete(socket.id);
    return;
  }

  for (const conversationId of conversations) {
    socket.to(conversationId).emit("typing:stop", { conversationId, userId });
  }

  console.log(
    `[Typing] Cleanup on disconnect for socket ${socket.id} (User: ${userId}), cleared ${conversations.size} conversation(s)`
  );

  socketTypingState.delete(socket.id);
}

module.exports = {
  handleTypingStart,
  handleTypingStop,
  registerTypingHandlers,
  handleTypingCleanupOnDisconnect
};
