const Trade = require('../Models/Trade');
const User = require('../Models/User');
const metricsService = require('../Services/metricsService');

exports.getUserMetrics = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1️⃣ Fetch all trades for this user
        const trades = await Trade.find({ userId });

        // 2️⃣ Fetch user profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3️⃣ Calculate behavioural metrics FIRST
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

        // 4️⃣ Generate warnings USING the metrics
        const warnings = metricsService.generateBehaviourWarnings(metrics);

        // 5️⃣ Return everything
        res.status(200).json({
            ...metrics,
            warnings
        });

    } catch (error) {
        res.status(500).json({
            message: "Error calculating metrics",
            error: error.message
        });
    }
};
