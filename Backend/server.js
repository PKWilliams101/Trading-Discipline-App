const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
require("dotenv").config();

// Create Express app ONCE
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const metricsRoutes = require('./Routes/metricsRoutes');
const tradeRoutes = require("./Routes/tradeRoutes");
const journalRoutes = require("./Routes/journalRoutes");
const userRoutes = require("./Routes/userRoutes");

// Register routes
app.use("/api/trades", tradeRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/metrics", metricsRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
