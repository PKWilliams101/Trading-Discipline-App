const express = require("express");
const router = express.Router();
const Trade = require("../Models/Trade");

// 1. Create a new trade
router.post("/", async (req, res) => {
    try {
        const newTrade = new Trade(req.body);
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }   
});

// 2. Get trades for a specific user
router.get("/user/:userId", async (req, res) => {
    try {
        console.log("Fetching trades for user:", req.params.userId);
        const trades = await Trade.find({ userId: req.params.userId }).sort({ entryTime: -1 });
        res.json(trades);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
