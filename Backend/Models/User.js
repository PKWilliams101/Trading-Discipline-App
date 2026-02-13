const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tier:     { type: String, default: 'Beginner' },
  tradingPlanRules: { type: [String], default: [] },
  plannedDailyLimit: { type: Number, default: 3 }
});

module.exports = mongoose.model('User', UserSchema);