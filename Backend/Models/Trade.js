const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instrument: {
        type: String,
        required: true,
        trim: true 
    },
    direction: {
        type: String,
        enum: ['buy', 'sell'],
        lowercase: true,
        required: true
    },
    riskPercentage: {
        type: Number,
        required: true,
        min: 0 // Prevents invalid math in House Money Factor
    },
    result: {
        type: String,
        enum: ['win', 'loss', 'breakeven'],
        lowercase: true,
        required: true
    },
    pnl: {
        type: Number,
        required: true
    },
    followedPlan: {
        type: Boolean,
        required: true
    },
    // --- ESSENTIAL FOR BEHAVIOURAL METRICS ---
    entryTime: {
        type: Date,
        required: true
    },
    exitTime: {
        type: Date,
        required: true,
        // Validation: Exit cannot be before Entry
        validate: {
            validator: function(value) {
                return value >= this.entryTime;
            },
            message: "Exit time must be after entry time."
        }
    },
    notes: {
        type: String,
        maxLength: 500
    }
}, { 
    timestamps: true 
}); 

module.exports = mongoose.model('Trade', TradeSchema);