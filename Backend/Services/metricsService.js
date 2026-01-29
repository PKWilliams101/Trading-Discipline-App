// DISCIPLINE SCORE (Per Trade)
// Measures rule adherence, emotional control, and risk discipline
exports.calculateDisciplineScore = (trade) => {
    let score = 100;

    if (!trade.followedPlan) score -= 30;
    if (!trade.riskWithinLimit) score -= 25;
    if (trade.revengeTrade) score -= 25;

    const riskyEmotions = ["angry", "frustrated", "anxious"];
    if (riskyEmotions.includes(trade.emotion)) {
        score -= 20;
    }

    return Math.max(score, 0);
};
// Average Discipline Score across all trades
exports.calculateAverageDisciplineScore = (trades) => {
    if (!trades || trades.length === 0) return 0;

    const scores = trades.map(trade =>
        exports.calculateDisciplineScore(trade)
    );

    const average =
        scores.reduce((sum, s) => sum + s, 0) / scores.length;

    return Math.round(average);
};





//OVERTRADING IDEX (Impulsivitity Control)
exports.calculateOvertradingIndex = (trades, plannedDailyLimit) => {
    if (!trades || plannedDailyLimit === 0) return 0;
    return parseFloat((trades.length / plannedDailyLimit).toFixed(2));
};

//DISPOSITION RATIO//
// Measures the tendency to hold onto losing trades versus winning trades
exports.calculateDispositionRatio = (trades) => {
    const winners = trades.filter(t => t.result === 'win' || t.pnl >0);
    const losers = trades.filter(t => t.result === 'loss' || t.pnl <0);

    if (winners.length === 0 || losers.length === 0) return 1.0;

    const avgWinDuration = winners.reduce((acc, t) => acc + (new Date(t.exitTime) - new Date(t.entryTime)), 0) / winners.length;
    const avgLossDuration = losers.reduce((acc, t) => acc + (new Date(t.exitTime) - new Date(t.entryTime)), 0) / losers.length;

    return parseFloat((avgLossDuration / avgWinDuration).toFixed(2));
};

// 4. House Money Factor
exports.calculateHouseMoneyFactor = (trades) => {
    // Check if we have at least 2 trades to compare
    if (!trades || trades.length < 2) return 1.0;
    
    const sorted = [...trades].sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    const lastTrade = sorted[0];
    const previousTrade = sorted[1];

    // Added a check to ensure previousTrade and its result exist
    if (previousTrade && previousTrade.result === 'win') {
        return parseFloat((lastTrade.riskPercentage / previousTrade.riskPercentage).toFixed(2));
    }
    return 1.0;
};

// 5. Loss-Reactivity
exports.calculateLossReactivity = (trades) => {
    if (!trades || trades.length < 2) return "Stable";
    
    const sorted = [...trades].sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    // Added check for 'prev' existence and its 'result'
    if (prev && prev.result === 'loss') {
        const gapInMinutes = (new Date(last.entryTime) - new Date(prev.exitTime)) / 60000;
        if (gapInMinutes < 10) return "High (Potential Revenge Trading)";
    }
    return "Stable";
};

