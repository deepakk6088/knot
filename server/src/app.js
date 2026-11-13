
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Allow both localhost and 127.0.0.1 frontend origins.
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
}));

// Parse incoming JSON requests
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "KNOT backend is running!"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

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
        message: statusCode === 500
            ? "Internal server error."
            : err.message
    });
});

module.exports = app;
