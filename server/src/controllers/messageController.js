const messageService = require("../services/messageService");

// POST /api/messages - Send and persist message
async function sendMessage(req, res) {
  try {
    const senderId = req.user.id;
    const { conversationId, content } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, error: "conversationId is required" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: "content cannot be empty" });
    }

    const message = await messageService.createMessage({
      conversationId,
      senderId,
      content
    });

    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message
    });
  }
}

// GET /api/messages/conversation/:conversationId - Get paginated history
async function getConversationMessages(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { limit, cursor, before } = req.query;

    const result = await messageService.getConversationMessages({
      conversationId,
      userId,
      limit,
      cursor,
      before
    });

    return res.status(200).json({
      success: true,
      data: result.messages,
      pagination: result.pagination
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message
    });
  }
}

// PATCH /api/messages/:id/status - Update message delivery/read status
async function updateMessageStatus(req, res) {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "status is required" });
    }

    const updated = await messageService.updateMessageStatus({
      messageId,
      userId,
      status
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

// POST /api/messages/conversation/:conversationId/read - Mark incoming messages read
async function markConversationAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const result = await messageService.markConversationAsRead({
      conversationId,
      userId
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  sendMessage,
  getConversationMessages,
  updateMessageStatus,
  markConversationAsRead
};
