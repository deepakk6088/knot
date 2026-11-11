const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KNOT backend is running!"
  });
});

// Authentication routes (Member 1)
app.use("/api/auth", authRoutes);

// Conversation & Message routes (Member 2)
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error("API Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error." : err.message
  });
});

module.exports = app;
