const express = require('express');
const router = express.Router();
const User = require('../Models/User');

// --- THE FIX FOR "SYSTEM SYNC FAILED" ---
// This path MUST match your axios.put URL
router.put('/:id', async (req, res) => {
  try {
    const { tradingPlanRules, plannedDailyLimit } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { tradingPlanRules, plannedDailyLimit },
      { new: true } // This ensures the frontend gets the NEW data back
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Strategy Synchronized for:", updatedUser.username);
    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Sync Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;