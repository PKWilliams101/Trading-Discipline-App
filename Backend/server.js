const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Create Express app FIRST
const app = express();
app.use(express.json());

// Import routes
const tradeRoutes = require("./Routes/tradeRoutes");
const journalRoutes = require("./Routes/journalRoutes");
const userRoutes = require("./Routes/userRoutes");

// Register routes
app.use("/api/trades", tradeRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/users", userRoutes);

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
