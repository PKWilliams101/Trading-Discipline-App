const mongoose = require ("mongoose");

const TradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    instrument: {
        type: String,
        required: true
    },

    direction: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },

    riskPercentage: {
        type: Number,
        required: true  
    },

    result: {
        type: String,
        enum: ['win', 'loss', 'breakeven'],
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

    Timestamp: {
        type: Date,
        default: Date.now
    }
}); 

module.exports = mongoose.model('Trade', TradeSchema);