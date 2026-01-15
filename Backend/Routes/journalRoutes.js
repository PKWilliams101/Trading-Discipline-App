const express = require("express");
const router = express.Router();
const journalEntry = require("../Models/JournalEntry");

// Create a new journal entry
router.post("/", async (req, res) => {
    try {
        const newEntry = new journalEntry(req.body);
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }   
});

// Get all journal entries for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const entries = await journalEntry.find({ userId: req.params.userId });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }       
});

module.exports = router;