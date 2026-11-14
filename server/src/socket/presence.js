const prisma = require("../config/prisma");

/**
 * In-memory presence tracker:
 * Map<userId, Set<socketId>>
 * Tracks all active socket connections for each user to support multiple
 * simultaneous tabs/devices per user.
 */
const userSockets = new Map();

/**
 * Checks if a specific user is currently online.
 *
 * @param {string} userId - User UUID
 * @returns {boolean}
 */
function isUserOnline(userId) {
  const sockets = userSockets.get(userId);
  return Boolean(sockets && sockets.size > 0);
}

/**
 * Returns an array of all currently online user IDs.
 *
 * @returns {string[]}
 */
function getOnlineUserIds() {
  const onlineIds = [];
  for (const [userId, sockets] of userSockets.entries()) {
    if (sockets && sockets.size > 0) {
      onlineIds.push(userId);
    }
  }
  return onlineIds;
}

/**
 * Returns the number of active socket connections for a user.
 *
 * @param {string} userId - User UUID
 * @returns {number}
 */
function getUserSocketCount(userId) {
  const sockets = userSockets.get(userId);
  return sockets ? sockets.size : 0;
}

/**
 * Retrieves the presence status (online/offline & lastSeenAt) for a list of user IDs.
 *
 * @param {string[]} userIds - Array of user UUIDs
 * @returns {Promise<Record<string, { isOnline: boolean, lastSeenAt: string | null }>>}
 */
async function getPresenceStatus(userIds) {
  const result = {};
  const offlineUserIds = [];

  for (const id of userIds) {
    if (typeof id !== "string") continue;
    const online = isUserOnline(id);

    if (online) {
      result[id] = { isOnline: true, lastSeenAt: null };
    } else {
      offlineUserIds.push(id);
    }
  }

  if (offlineUserIds.length > 0) {
    try {
      const users = await prisma.user.findMany({
        where: { id: { in: offlineUserIds } },
        select: { id: true, lastSeenAt: true }
      });

      for (const user of users) {
        result[user.id] = {
          isOnline: false,
          lastSeenAt: user.lastSeenAt ? user.lastSeenAt.toISOString() : null
        };
      }
    } catch (err) {
      console.error("[Presence] Error querying lastSeenAt for offline users:", err.message);
    }

    // Default any users not found in database
    for (const id of offlineUserIds) {
      if (!result[id]) {
        result[id] = { isOnline: false, lastSeenAt: null };
      }
    }
  }

  return result;
}

/**
 * Handles online presence tracking when an authenticated socket connects.
 * Marks the user online and broadcasts `presence:online` to other connected users
 * only if this is the user's first active connection.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Authenticated client socket
 */
function handleUserConnected(io, socket) {
  const userId = socket.user?.id;
  if (!userId) return;

  let sockets = userSockets.get(userId);
  const isFirstConnection = !sockets || sockets.size === 0;

  if (isFirstConnection) {
    sockets = new Set();
    userSockets.set(userId, sockets);
  }

  sockets.add(socket.id);

  if (isFirstConnection) {
    console.log(`[Presence] User ${userId} is now ONLINE (Socket: ${socket.id})`);
    // Broadcast to other users that this user has come online
    socket.broadcast.emit("presence:online", { userId });
  } else {
    console.log(`[Presence] User ${userId} connected additional socket (Total: ${sockets.size})`);
  }
}

/**
 * Handles offline presence tracking when an authenticated socket disconnects.
 * Updates connection tracking. Only when the last socket connection closes,
 * marks the user offline, updates `lastSeenAt` in the database, and broadcasts `presence:offline`.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Disconnected client socket
 * @param {string} reason - Socket disconnection reason
 */
async function handleUserDisconnected(io, socket, reason) {
  const userId = socket.user?.id;
  if (!userId) return;

  const sockets = userSockets.get(userId);
  if (!sockets) return;

  sockets.delete(socket.id);

  if (sockets.size === 0) {
    // Last active connection disconnected - user is genuinely offline
    userSockets.delete(userId);
    const lastSeenAt = new Date();

    console.log(`[Presence] User ${userId} is now OFFLINE (Reason: ${reason})`);

    // Persist lastSeenAt in PostgreSQL
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt }
      });
    } catch (err) {
      console.error(`[Presence] Failed to update lastSeenAt for user ${userId}:`, err.message);
    }

    // Broadcast offline status to all remaining connected users
    io.emit("presence:offline", {
      userId,
      lastSeenAt: lastSeenAt.toISOString()
    });
  } else {
    console.log(`[Presence] Socket ${socket.id} closed for user ${userId}. Still online with ${sockets.size} active connection(s).`);
  }
}

/**
 * Registers presence event listeners on an authenticated socket.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Authenticated client socket
 */
function registerPresenceHandlers(io, socket) {
  // Client requests presence status for specific user IDs or all online users
  socket.on("presence:get", async (data, callback) => {
    try {
      const userIds = Array.isArray(data)
        ? data
        : Array.isArray(data?.userIds)
        ? data.userIds
        : null;

      if (userIds && userIds.length > 0) {
        const statuses = await getPresenceStatus(userIds);

        if (typeof callback === "function") {
          return callback({ success: true, statuses });
        }
        return socket.emit("presence:status", { statuses });
      }

      // Return list of all currently online user IDs
      const onlineUserIds = getOnlineUserIds();
      const payload = { onlineUserIds };

      if (typeof callback === "function") {
        return callback({ success: true, ...payload });
      }
      return socket.emit("presence:status", payload);
    } catch (error) {
      console.error("[Presence] Error handling presence:get:", error);
      if (typeof callback === "function") {
        return callback({ success: false, error: error.message });
      }
    }
  });
}

module.exports = {
  isUserOnline,
  getOnlineUserIds,
  getUserSocketCount,
  getPresenceStatus,
  handleUserConnected,
  handleUserDisconnected,
  registerPresenceHandlers
};
