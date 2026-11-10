const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const { authenticateUser } = require("../middlewares/authMiddleware");

// All conversation routes require authentication
router.use(authenticateUser);

// Create or retrieve conversation with a target user
router.post("/", conversationController.createOrGetConversation);

// Get all conversations for current user
router.get("/", conversationController.getUserConversations);

// Get single conversation details by conversation ID
router.get("/:id", conversationController.getConversationById);

module.exports = router;
