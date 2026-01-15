const express = require("express");
const router = express.Router();
const Trade = require("../Models/Trade");

// Create a new trade
router.post("/", async (req, res) => {
    try {
        const newTrade = new Trade(req.body);
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }   

});

// Get all trades for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const trades = await Trade.find({ userId: req.params.userId });
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); 
module.exports = router;