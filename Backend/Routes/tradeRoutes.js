const User = require("../Models/User");
const express = require("express");
const router = express.Router();
const Trade = require("../Models/Trade"); 

// 1. CREATE TRADE
router.post("/", async (req, res) => {
    try {
        const newTrade = new Trade(req.body);
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }   
});

// 2. GET TRADES
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

// 3. GET METRICS (Calculates Revenge Risk, Discipline, etc.)
router.get("/metrics/:userId", async (req, res) => {
    try {
        const trades = await Trade.find({ userId: req.params.userId }).sort({ entryTime: 1 }); 
        const user = await User.findById(req.params.userId);

        if (!trades || !user) {
            return res.json({ disciplineScore: 100, overtradingIndex: "0.00", dispositionRatio: "0.00", revengeRisk: 0 });
        }

        // --- Discipline Score ---
        const disciplinedCount = trades.filter(t => t.followedPlan === true).length;
        const disciplineScore = trades.length > 0 
            ? Math.round((disciplinedCount / trades.length) * 100) 
            : 100;

        // --- Impulsivity (Overtrading) Index ---
        const today = new Date().setHours(0, 0, 0, 0);
        const tradesToday = trades.filter(t => new Date(t.entryTime).setHours(0, 0, 0, 0) === today).length;
        const limit = user.plannedDailyLimit || 3;
        const overtradingIndex = (tradesToday / limit).toFixed(2);

        // --- REVENGE RISK LOGIC ---
        let revengeRisk = 0;
        const recentTrades = [...trades].slice(-5); 

        recentTrades.forEach((trade, index) => {
            if (trade.pnl < 0) {
                let heat = 20; 
                const previousTrade = recentTrades[index - 1];
                if (previousTrade) {
                    const timeDiff = (new Date(trade.entryTime) - new Date(previousTrade.entryTime)) / 60000;
                    if (timeDiff < 15) { 
                        heat *= 2; // Rapid fire penalty
                    }
                }
                revengeRisk += heat;
            } else if (trade.pnl > 0) {
                revengeRisk -= 10; // Success cools the tilt
            }
        });

        revengeRisk = Math.max(0, Math.min(100, revengeRisk));

        // --- Disposition Ratio ---
        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl < 0);
        const avgWin = wins.length > 0 ? (wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length) : 0;
        const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 1;
        const dispositionRatio = (avgWin / avgLoss).toFixed(2);

        res.json({ 
            disciplineScore, 
            overtradingIndex, 
            dispositionRatio,
            revengeRisk, 
            houseMoneyFactor: "1.00"
        });

    } catch (err) {
        console.error("Metrics Error:", err);
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;