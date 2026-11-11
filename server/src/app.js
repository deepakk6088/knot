const express = require("express");
const cors = require("cors");

const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true
  })
);

app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KNOT backend is running!"
  });
});

// Member 2 Routes: Conversations & Messages
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

module.exports = app;
