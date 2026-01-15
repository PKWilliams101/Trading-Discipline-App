const mongoose = require("mongoose");

const JournalEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    emotionalState: {
        type: String,
        enum: ['CALM', 'CONFIDENT', 'ANXIOUS', 'FRUSTRATED', 'IMPULSIVE', 'FOCUSED'],
        required: true
    },

    confidenceLevel: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },

    notes: {
        type: String,
    },

    Timestamp: {
        type: Date,
        default: Date.now
    }
}); 
module.exports = mongoose.model("JournalEntry", JournalEntrySchema);