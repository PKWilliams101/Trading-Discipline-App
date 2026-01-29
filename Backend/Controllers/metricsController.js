const Trade = require('../Models/Trade');
const User = require('../Models/User');
const metricsService = require('../Services/metricsService');

exports.getUserMetrics = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch all trades for this user
        const trades = await Trade.find({ userId });

        // 2. Fetch user profile (planned daily limit)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Calculate behavioural metrics
        const metrics = {
            disciplineScore: metricsService.calculateAverageDisciplineScore(trades),
            overtradingIndex: metricsService.calculateOvertradingIndex(
                trades,
                user.plannedDailyLimit || 3
            ),
            dispositionRatio: metricsService.calculateDispositionRatio(trades),
            houseMoneyFactor: metricsService.calculateHouseMoneyFactor(trades),
            lossReactivity: metricsService.calculateLossReactivity(trades),
            totalTrades: trades.length
        };

        res.status(200).json(metrics);

    } catch (error) {
        res.status(500).json({
            message: "Error calculating metrics",
            error: error.message
        });
    }
};
