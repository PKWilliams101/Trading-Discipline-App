const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Prevents duplicate test accounts
    },
    experienceLevel: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        required: true
    },
    // CRUCIAL: Used for Overtrading Index calculation
    plannedDailyLimit: {
        type: Number,
        default: 3,
        required: true
    },
    tradingPlanRules: {
        type: [String],
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model("User", UserSchema);