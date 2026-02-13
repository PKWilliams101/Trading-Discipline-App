// Backend Service Logic
exports.generateUserMetrics = (user, trades) => {
    // 1. ISOLATE TODAY'S DATA
    const todayStr = new Date().toDateString();
    const todayTrades = trades.filter(t => 
        new Date(t.entryTime || t.timestamp).toDateString() === todayStr
    );

    // 2. FORCE CLEAN SLATE IF NO TRADES
    if (todayTrades.length === 0) {
        return {
            disciplineScore: 100,
            revengeRisk: 0,
            overtradingIndex: 0,
            totalTradesToday: 0
        };
    }

    // 3. CALCULATION IF TRADES EXIST
    const followed = todayTrades.filter(t => t.followedPlan === true).length;
    const disciplineScore = Math.round((followed / todayTrades.length) * 100);
    
    // Check most recent for revenge risk
    const latestTrade = todayTrades[todayTrades.length - 1];
    const revengeRisk = latestTrade.pnl < 0 ? 75 : 10;

    return {
        disciplineScore,
        revengeRisk,
        overtradingIndex: todayTrades.length / (user.plannedDailyLimit || 3),
        totalTradesToday: todayTrades.length
    };
};