const express = require("express");
const router = express.Router();
const User = require("../Models/User");

// Create a new user
router.post("/", async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;