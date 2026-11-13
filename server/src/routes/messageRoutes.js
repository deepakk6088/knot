const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { authenticateUser } = require("../middlewares/authMiddleware");

// All message routes require authentication
router.use(authenticateUser);

// Send / persist message
router.post("/", messageController.sendMessage);

// Get message history for a conversation with pagination
router.get("/conversation/:conversationId", messageController.getConversationMessages);

// Update status of a message (DELIVERED, READ)
router.patch("/:id/status", messageController.updateMessageStatus);

// Mark conversation messages as read
router.post("/conversation/:conversationId/read", messageController.markConversationAsRead);

module.exports = router;
