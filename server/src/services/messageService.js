const prisma = require("../config/prisma");

const VALID_STATUSES = ["SENT", "DELIVERED", "READ"];

// Save message in PostgreSQL and update conversation updatedAt
async function createMessage({ conversationId, senderId, content }) {
  if (!conversationId) {
    throw new Error("conversationId is required");
  }
  if (!senderId) {
    throw new Error("senderId is required");
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    throw new Error("Message content cannot be empty");
  }

  // Validate conversation existence and participant membership
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (conversation.userOneId !== senderId && conversation.userTwoId !== senderId) {
    const error = new Error("Access denied: You are not a participant in this conversation");
    error.statusCode = 403;
    throw error;
  }

  // Atomic message creation and conversation timestamp update
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        status: "SENT"
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        }
      }
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })
  ]);

  return message;
}

// Retrieve message history with cursor/timestamp pagination and chronological ordering
async function getConversationMessages({ conversationId, userId, limit = 30, cursor = null, before = null }) {
  if (!conversationId) {
    throw new Error("conversationId is required");
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
    const error = new Error("Access denied: You are not a participant in this conversation");
    error.statusCode = 403;
    throw error;
  }

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

  const whereClause = {
    conversationId
  };

  if (before) {
    whereClause.createdAt = {
      lt: new Date(before)
    };
  }

  const queryOptions = {
    where: whereClause,
    take: parsedLimit + 1,
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: { id: true, username: true, displayName: true, avatarUrl: true }
      }
    }
  };

  if (cursor && !before) {
    queryOptions.cursor = { id: cursor };
    queryOptions.skip = 1;
  }

  const messagesDesc = await prisma.message.findMany(queryOptions);

  const hasMore = messagesDesc.length > parsedLimit;
  if (hasMore) {
    messagesDesc.pop();
  }

  const nextCursor = hasMore && messagesDesc.length > 0 ? messagesDesc[messagesDesc.length - 1].id : null;
  const oldestCreatedAt = hasMore && messagesDesc.length > 0 ? messagesDesc[messagesDesc.length - 1].createdAt : null;

  // Reverse descending query to return chronological order (oldest to newest)
  const messagesChronological = messagesDesc.reverse();

  return {
    messages: messagesChronological,
    pagination: {
      hasMore,
      nextCursor,
      oldestCreatedAt,
      limit: parsedLimit,
      count: messagesChronological.length
    }
  };
}

// Update status (DELIVERED, READ) and record timestamps
async function updateMessageStatus({ messageId, userId, status }) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid message status: ${status}. Must be one of ${VALID_STATUSES.join(", ")}`);
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true }
  });

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  if (message.conversation.userOneId !== userId && message.conversation.userTwoId !== userId) {
    const error = new Error("Access denied: You are not a participant in this conversation");
    error.statusCode = 403;
    throw error;
  }

  const updateData = { status };
  const now = new Date();

  if (status === "DELIVERED" && !message.deliveredAt) {
    updateData.deliveredAt = now;
  } else if (status === "READ") {
    updateData.readAt = now;
    if (!message.deliveredAt) {
      updateData.deliveredAt = now;
    }
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: updateData,
    include: {
      sender: {
        select: { id: true, username: true, displayName: true, avatarUrl: true }
      }
    }
  });

  return updated;
}

// Mark all incoming messages in a conversation as READ
async function markConversationAsRead({ conversationId, userId }) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
    const error = new Error("Access denied: You are not a participant in this conversation");
    error.statusCode = 403;
    throw error;
  }

  const now = new Date();
  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      status: { not: "READ" }
    },
    data: {
      status: "READ",
      readAt: now,
      deliveredAt: now
    }
  });

  return { updatedCount: result.count };
}

module.exports = {
  createMessage,
  getConversationMessages,
  updateMessageStatus,
  markConversationAsRead
};
