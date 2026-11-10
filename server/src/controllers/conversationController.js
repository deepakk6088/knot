const conversationService = require("../services/conversationService");

// POST /api/conversations
async function createOrGetConversation(req, res) {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.body.targetUserId || req.body.recipientId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: "targetUserId (or recipientId) is required"
      });
    }

    const conversation = await conversationService.getOrCreateConversation(currentUserId, targetUserId);

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message
    });
  }
}

// GET /api/conversations
async function getUserConversations(req, res) {
  try {
    const currentUserId = req.user.id;
    const conversations = await conversationService.getUserConversations(currentUserId);

    return res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message
    });
  }
}

// GET /api/conversations/:id
async function getConversationById(req, res) {
  try {
    const currentUserId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await conversationService.getConversationById(conversationId, currentUserId);

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  createOrGetConversation,
  getUserConversations,
  getConversationById
};
