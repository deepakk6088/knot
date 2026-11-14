const messageService = require("../services/messageService");
const conversationService = require("../services/conversationService");
const prisma = require("../config/prisma");
const { isUserOnline } = require("./presence");

// In-memory deduplication cache to prevent duplicate persistence (e.g. rapid network retries)
const recentMessagesCache = new Map();
const DEDUP_TTL_MS = 60 * 1000; // 60 seconds

function setCachedMessage(key, message) {
  recentMessagesCache.set(key, message);
  setTimeout(() => {
    recentMessagesCache.delete(key);
  }, DEDUP_TTL_MS);
}

/**
 * Registers Socket.IO event listeners for conversation rooms and real-time messaging.
 *
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {import("socket.io").Socket} socket - Authenticated client socket
 */
function registerMessagingHandlers(io, socket) {
  const userId = socket.user?.id;

  // 1. Join Conversation Room
  socket.on("conversation:join", async (data, callback) => {
    const currentUserId = socket.user?.id;

    if (!currentUserId) {
      const errorResponse = { success: false, error: "Unauthorized: Authentication required" };
      if (typeof callback === "function") return callback(errorResponse);
      return socket.emit("conversation:error", errorResponse);
    }

    const conversationId = typeof data === "string" ? data : data?.conversationId;

    if (!conversationId || typeof conversationId !== "string" || !conversationId.trim()) {
      const errorResponse = { success: false, error: "conversationId is required" };
      if (typeof callback === "function") return callback(errorResponse);
      return socket.emit("conversation:error", errorResponse);
    }

    const trimmedConvId = conversationId.trim();

    try {
      // Authorize: Verify that the conversation exists and that the user is a participant
      await conversationService.getConversationById(trimmedConvId, currentUserId);

      // Join the conversation room
      socket.join(trimmedConvId);
      console.log(`[Socket] User ${currentUserId} (${socket.id}) joined room: ${trimmedConvId}`);

      if (typeof callback === "function") {
        return callback({ success: true, conversationId: trimmedConvId });
      }
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        success: false,
        error: error.message || "Failed to join conversation room",
        statusCode
      };

      console.warn(`[Socket] Room join denied for user ${currentUserId} on ${trimmedConvId}: ${error.message}`);
      if (typeof callback === "function") {
        return callback(errorResponse);
      }
      return socket.emit("conversation:error", errorResponse);
    }
  });

  // 2. Leave Conversation Room
  socket.on("conversation:leave", (data, callback) => {
    const conversationId = typeof data === "string" ? data : data?.conversationId;

    if (!conversationId || typeof conversationId !== "string" || !conversationId.trim()) {
      const errorResponse = { success: false, error: "conversationId is required" };
      if (typeof callback === "function") return callback(errorResponse);
      return socket.emit("conversation:error", errorResponse);
    }

    const trimmedConvId = conversationId.trim();
    socket.leave(trimmedConvId);
    console.log(`[Socket] Socket ${socket.id} left room: ${trimmedConvId}`);

    if (typeof callback === "function") {
      return callback({ success: true, conversationId: trimmedConvId });
    }
  });

  // 3. Send Message
  socket.on("message:send", async (data, callback) => {
    const senderId = socket.user?.id;

    if (!senderId) {
      const errorResponse = { success: false, error: "Unauthorized: Authentication required" };
      if (typeof callback === "function") return callback(errorResponse);
      return socket.emit("message:error", errorResponse);
    }

    const { conversationId, content, tempId, clientTempId } = data || {};
    const messageTempId = tempId || clientTempId || null;

    if (!conversationId || typeof conversationId !== "string" || !conversationId.trim()) {
      const errorResponse = {
        success: false,
        error: "conversationId is required",
        tempId: messageTempId
      };
      if (typeof callback === "function") return callback(errorResponse);
      return socket.emit("message:error", errorResponse);
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      const errorResponse = {
        success: false,
        error: "Message content cannot be empty",
        tempId: messageTempId
      };
      if (typeof callback === "function") return callback(errorResponse);
      return socket.emit("message:error", errorResponse);
    }

    const trimmedConvId = conversationId.trim();
    const trimmedContent = content.trim();

    // Deduplication check: prevent duplicate DB insertion if client retries with the same clientTempId
    const dedupKey = messageTempId
      ? `${senderId}:${trimmedConvId}:${messageTempId}`
      : `${senderId}:${trimmedConvId}:${trimmedContent}`;

    if (recentMessagesCache.has(dedupKey)) {
      const cachedMessage = recentMessagesCache.get(dedupKey);
      console.log(`[Socket] Duplicate message prevented for key: ${dedupKey}`);
      if (typeof callback === "function") {
        return callback({
          success: true,
          data: cachedMessage,
          tempId: messageTempId
        });
      }
      return;
    }

    try {
      // Reuse existing message persistence service (validates participants & saves in PostgreSQL)
      const message = await messageService.createMessage({
        conversationId: trimmedConvId,
        senderId,
        content: trimmedContent
      });

      // Cache the persisted message to prevent duplicates
      setCachedMessage(dedupKey, message);

      // Find recipient user ID to also emit to recipient's personal room (for users on other views/sidebar)
      const conv = await prisma.conversation.findUnique({
        where: { id: trimmedConvId },
        select: { userOneId: true, userTwoId: true }
      });

      const recipientId = conv
        ? (conv.userOneId === senderId ? conv.userTwoId : conv.userOneId)
        : null;

      // Broadcast message:receive to the conversation room and recipient personal room
      // Socket.IO chaining .to() automatically deduplicates sockets present in both rooms
      if (recipientId) {
        io.to(trimmedConvId).to(recipientId).emit("message:receive", message);
      } else {
        io.to(trimmedConvId).emit("message:receive", message);
      }

      console.log(`[Socket] Message ${message.id} broadcast to conversation ${trimmedConvId} by user ${senderId}`);

      // Emit a targeted 'message:sent' acknowledgement to the sender socket only.
      // This confirms successful DB persistence and carries the authoritative server
      // message state (id, conversationId, senderId, status = SENT).
      // Sent only to this socket — never to the room — so the sender can correlate
      // the persisted message with any optimistic/temp UI state using tempId.
      socket.emit("message:sent", {
        success: true,
        messageId: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        status: message.status,       // "SENT" — set by DB at creation
        createdAt: message.createdAt,
        tempId: messageTempId         // echoed back so the client can reconcile temp messages
      });

      // ── DELIVERED receipt ────────────────────────────────────────────────────
      // A message is DELIVERED when it reaches an actively connected recipient.
      // We know the recipient has at least one live socket (checked via the
      // existing presence tracker) because message:receive was just broadcast.
      // This avoids marking messages delivered for offline recipients who will
      // receive the message only when they reconnect.
      //
      // The DB update runs asynchronously — it must not block the sender's ack.
      // Guard: skip if the recipient is offline or not identifiable.
      if (recipientId && isUserOnline(recipientId)) {
        // Fire-and-forget: errors are logged but must not surface to the sender
        // as a failure of the send operation itself.
        (async () => {
          try {
            const delivered = await messageService.updateMessageStatus({
              messageId: message.id,
              userId: recipientId,          // authorization: recipient must be a participant
              status: "DELIVERED"
            });

            // Notify the sender (all their tabs) that the message was delivered.
            // Skip if deliveredAt was already set (updateMessageStatus is idempotent;
            // the returned object reflects the actual DB state).
            io.to(senderId).emit("message:delivered", {
              messageId: delivered.id,
              conversationId: delivered.conversationId,
              recipientId,
              status: delivered.status,          // "DELIVERED"
              deliveredAt: delivered.deliveredAt  // timestamptz from DB
            });

            console.log(`[Socket] Message ${delivered.id} marked DELIVERED for recipient ${recipientId}`);
          } catch (err) {
            // Non-fatal: log but do not propagate. The message was persisted and
            // broadcast; delivery status will be reconciled on next connection.
            console.error(`[Socket] Failed to mark message ${message.id} as DELIVERED:`, err.message);
          }
        })();
      }
      // ────────────────────────────────────────────────────────────────────────

      // Return success acknowledgement to sender (callback path, if provided)
      if (typeof callback === "function") {
        return callback({
          success: true,
          data: message,
          tempId: messageTempId
        });
      }
    } catch (error) {
      console.error(`[Socket] Error sending message in conversation ${trimmedConvId}:`, error);
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        success: false,
        error: error.message || "Failed to persist message",
        statusCode,
        tempId: messageTempId
      };

      if (typeof callback === "function") {
        return callback(errorResponse);
      }
      return socket.emit("message:error", errorResponse);
    }
  });
}

module.exports = {
  registerMessagingHandlers
};

//// Implemented real time messaging