const { registerMessagingHandlers } = require("./messaging");
const { registerPresenceHandlers } = require("./presence");
const { registerTypingHandlers } = require("./typing");

/**
 * Registers all socket event handlers for an authenticated client socket.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Connected client socket
 */
function registerSocketHandlers(io, socket) {
  // Register conversation rooms & real-time messaging
  registerMessagingHandlers(io, socket);

  // Register online/offline presence handlers
  registerPresenceHandlers(io, socket);

  // Register typing indicator handlers
  registerTypingHandlers(io, socket);
}

module.exports = {
  registerSocketHandlers
};
