const mongoose = require("mongoose");
const { create } = require("./Trade");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    experienceLevel: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        required: true
    },

    tradingPlanRules: {
        type: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("User", UserSchema);