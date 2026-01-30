const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    
    // 🔐 NEW: Auth Fields (Required for Login)
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // In a real app, we'd hash this!

    // 📊 Your Original Fields (Keep these!)
    experienceLevel: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER" // Added default so registration doesn't crash
    },

    // 🛑 Used for Overtrading Logic
    plannedDailyLimit: {
      type: Number,
      required: true,
      min: 1,
      default: 3
    },

    // ✅ Used for the "Pre-Trade Checklist" in the Wizard
    tradingPlanRules: {
      type: [String],
      default: [
        "Trend aligns with Higher Timeframe",
        "Risk/Reward is at least 1:2",
        "No major news events in next 30 mins"
      ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);