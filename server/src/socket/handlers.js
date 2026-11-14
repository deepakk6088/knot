const { registerMessagingHandlers } = require("./messaging");

/**
 * Registers all socket event handlers for an authenticated client socket.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Connected client socket
 */
function registerSocketHandlers(io, socket) {
  // Register conversation rooms & real-time messaging
  registerMessagingHandlers(io, socket);
}

module.exports = {
  registerSocketHandlers
};
