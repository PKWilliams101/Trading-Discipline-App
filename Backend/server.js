const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Route imports
const metricsRoutes = require("./Routes/metricsRoutes"); 
const tradeRoutes = require("./Routes/tradeRoutes");
const journalRoutes = require("./Routes/journalRoutes");
const userRoutes = require("./Routes/userRoutes");

const app = express();

// --- FIXED MIDDLEWARE ---
// MIDDLEWARE
app.use(cors()); // Standard cors first
app.use(express.json());

// API ROUTES (Only mount each once!)
app.use("/api/users", userRoutes); 
app.use("/api/trades", tradeRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/metrics", metricsRoutes);

const dbOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 
};

mongoose
  .connect(process.env.MONGO_URI, dbOptions)
  .then(() => console.log("✅ MongoDB connected (Hotspot Mode)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});