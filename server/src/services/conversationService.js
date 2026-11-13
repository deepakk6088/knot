const prisma = require("../config/prisma");

// Deterministic ordering prevents duplicate conversations (userOneId < userTwoId)
function normalizeParticipants(userAId, userBId) {
  if (!userAId || !userBId) {
    throw new Error("Both user IDs are required to form a conversation");
  }
  if (userAId === userBId) {
    throw new Error("Cannot create a conversation with yourself");
  }

  const [userOneId, userTwoId] = [userAId, userBId].sort();
  return { userOneId, userTwoId };
}

// Surface otherUser relative to current user
function formatConversation(conversation, currentUserId) {
  if (!conversation) return null;

  const isUserOne = conversation.userOneId === currentUserId;
  const otherUser = isUserOne ? conversation.userTwo : conversation.userOne;
  const currentUser = isUserOne ? conversation.userOne : conversation.userTwo;

  const lastMessage = Array.isArray(conversation.messages) && conversation.messages.length > 0
    ? conversation.messages[0]
    : null;

  return {
    id: conversation.id,
    userOneId: conversation.userOneId,
    userTwoId: conversation.userTwoId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    otherUser: otherUser || null,
    currentUser: currentUser || null,
    lastMessage
  };
}

// Find existing conversation or create a new one
async function getOrCreateConversation(currentUserId, targetUserId) {
  const { userOneId, userTwoId } = normalizeParticipants(currentUserId, targetUserId);

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
  });

  if (!targetUser) {
    const error = new Error("Target user not found");
    error.statusCode = 404;
    throw error;
  }

  let conversation = await prisma.conversation.findUnique({
    where: {
      userOneId_userTwoId: {
        userOneId,
        userTwoId
      }
    },
    include: {
      userOne: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
      },
      userTwo: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userOneId,
        userTwoId
      },
      include: {
        userOne: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
        },
        userTwo: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  return formatConversation(conversation, currentUserId);
}

// Fetch all conversations for user ordered by last activity
async function getUserConversations(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { userOneId: userId },
        { userTwoId: userId }
      ]
    },
    include: {
      userOne: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
      },
      userTwo: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return conversations.map((conv) => formatConversation(conv, userId));
}

// Fetch single conversation with participant validation
async function getConversationById(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      userOne: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
      },
      userTwo: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, lastSeenAt: true }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  // Reject unauthorized users
  if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
    const error = new Error("Access denied: You are not a participant in this conversation");
    error.statusCode = 403;
    throw error;
  }

  return formatConversation(conversation, userId);
}

module.exports = {
  normalizeParticipants,
  formatConversation,
  getOrCreateConversation,
  getUserConversations,
  getConversationById
};
