const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/user.routes");

const app = express();

// CORS configuration (allow both localhost and 127.0.0.1 frontend origins)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
  })
);

// Allow small base64 profile image uploads.
app.use(express.json({ limit: "8mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KNOT backend is running!"
  });
});

// Authentication routes (Member 1)
app.use("/api/auth", authRoutes);

// User routes (Member 1)
app.use("/api/users", userRoutes);

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

  const statusCode = err.statusCode || err.status || 500;

  let message = statusCode === 500
    ? "Internal server error."
    : err.message;

  if (err.type === "entity.too.large") {
    message = "Request is too large. Please use an image smaller than 5 MB.";
  }

  res.status(statusCode).json({
    success: false,
    message
  });
});

module.exports = app;
