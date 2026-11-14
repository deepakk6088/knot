const conversationService = require("../services/conversationService");

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
 * To be implemented in Task 3.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Authenticated client socket
 * @param {object} data - Payload containing conversationId
 * @param {Function} [callback] - Optional acknowledgment callback
 */
function handleTypingStop(io, socket, data, callback) {
  // To be implemented in Task 3
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

module.exports = {
  handleTypingStart,
  handleTypingStop,
  registerTypingHandlers
};
