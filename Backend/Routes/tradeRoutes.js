const User = require("../Models/User");
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

// GET /api/trades/metrics/:userId
router.get("/metrics/:userId", async (req, res) => {
    try {
        const trades = await Trade.find({ userId: req.params.userId });
        const user = await User.findById(req.params.userId); // This was causing the error

        if (!trades || !user) {
            return res.json({ disciplineScore: 0, overtradingIndex: "0.00", dispositionRatio: "0.00" });
        }

        // 1. Discipline Score
        const disciplinedCount = trades.filter(t => t.followedPlan === true).length;
        const disciplineScore = trades.length > 0 
            ? Math.round((disciplinedCount / trades.length) * 100) 
            : 0;

        // 2. Impulsivity (Overtrading) Index
        const today = new Date().setHours(0, 0, 0, 0);
        const tradesToday = trades.filter(t => new Date(t.entryTime).setHours(0, 0, 0, 0) === today).length;
        const limit = user.plannedDailyLimit || 3;
        const overtradingIndex = (tradesToday / limit).toFixed(2);

        // 3. Disposition Ratio
        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl < 0);
        const avgWin = wins.length > 0 ? (wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length) : 0;
        const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 1;
        const dispositionRatio = (avgWin / avgLoss).toFixed(2);

        res.json({ 
            disciplineScore, 
            overtradingIndex, 
            dispositionRatio,
            revengeRisk: disciplineScore < 50 ? 80 : 10, // Example logic
            houseMoneyFactor: "1.00"
        });

    } catch (err) {
        console.error("Metrics Error:", err);
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;