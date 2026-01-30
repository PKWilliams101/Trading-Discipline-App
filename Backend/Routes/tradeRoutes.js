const express = require("express");
const router = express.Router();
const Trade = require("../Models/Trade"); // ✅ Keeps your original Capital M

// 1. CREATE TRADE (Your Original Code)
router.post("/", async (req, res) => {
    try {
        const newTrade = new Trade(req.body);
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }   
});

// 2. GET TRADES (Your Original Code)
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

// 3. GET METRICS
// This is the logic that calculates the 50% / 100% score
router.get("/metrics/:userId", async (req, res) => {
    try {
        console.log("🧮 Calculating Metrics for:", req.params.userId);
        const trades = await Trade.find({ userId: req.params.userId });
        
        // Safety check for 0 trades
        if (trades.length === 0) {
            return res.json({ disciplineScore: 0, dispositionRatio: 0, warnings: [] });
        }

        // --- MATH LOGIC ---
        // A. Discipline Score
        const disciplinedCount = trades.filter(t => t.followedPlan === true).length;
        const disciplineScore = Math.round((disciplinedCount / trades.length) * 100);

        // B. Disposition Ratio
        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl <= 0);
        const avgWin = wins.length > 0 ? (wins.reduce((a, b) => a + b.pnl, 0) / wins.length) : 0;
        const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b.pnl, 0) / losses.length) : 1;
        const dispositionRatio = (avgWin / avgLoss).toFixed(2);

        // Send results back to Frontend
        res.json({ 
            disciplineScore, 
            dispositionRatio,
            warnings: disciplineScore < 50 ? ["Low Discipline Detected"] : []
        });

    } catch (err) {
        console.error("Metrics Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;