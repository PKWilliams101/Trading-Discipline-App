const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Route imports
const metricsRoutes = require("./Routes/metricsRoutes"); 
const tradeRoutes = require("./Routes/tradeRoutes");
const journalRoutes = require("./Routes/journalRoutes");
const userRoutes = require("./Routes/userRoutes");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/metrics", metricsRoutes);

// ⏳ HOTSPOT FIX: Settings for slow connections
const dbOptions = {
    serverSelectionTimeoutMS: 60000, // Wait 60s instead of 30s
    socketTimeoutMS: 60000,
    family: 4 // Force IPv4 (helps with mobile hotspots)
};

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, dbOptions)
  .then(() => console.log("✅ MongoDB connected (Hotspot Mode)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});