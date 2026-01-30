const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // Optimises user-based queries
    },

    instrument: {
      type: String,
      required: true,
      trim: true
    },

    direction: {
      type: String,
      enum: ["buy", "sell"],
      required: true
    },

    riskPercentage: {
      type: Number,
      required: true,
      min: 0.01,
      max: 100
    },

    result: {
      type: String,
      enum: ["win", "loss", "breakeven"],
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

    // === BEHAVIOURAL METRICS FOUNDATION ===
    entryTime: {
      type: Date,
      required: true
    },

    exitTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.entryTime;
        },
        message: "Exit time must be after entry time."
      }
    },

    notes: {
      type: String,
      maxLength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Trade", TradeSchema);
