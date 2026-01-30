/**
 * Behavioural Metrics Service
 * All metrics are derived from observable trading behaviour
 * (No subjective inputs required)
 */

// ===============================
// 1. DISCIPLINE SCORE (PER TRADE)
// ===============================
// Measures plan adherence + risk control
exports.calculateDisciplineScore = (trade) => {
  let score = 100;

  // Broke trading plan
  if (!trade.followedPlan) score -= 40;

  // Excessive risk-taking penalty
  if (trade.riskPercentage > 2) score -= 30;

  // Emotional proxy: large loss + rule break
  if (!trade.followedPlan && trade.pnl < 0) score -= 20;

  return Math.max(score, 0);
};

// =====================================
// 2. AVERAGE DISCIPLINE SCORE (AGGREGATE)
// =====================================
exports.calculateAverageDisciplineScore = (trades) => {
  if (!trades || trades.length === 0) return 0;

  const total = trades.reduce(
    (sum, trade) => sum + exports.calculateDisciplineScore(trade),
    0
  );

  return Math.round(total / trades.length);
};

// =================================
// 3. OVERTRADING INDEX
// =================================
// Impulsivity / over-execution metric
exports.calculateOvertradingIndex = (trades, plannedDailyLimit) => {
  if (!trades || plannedDailyLimit === 0) return 0;
  return Number((trades.length / plannedDailyLimit).toFixed(2));
};

// =================================
// 4. DISPOSITION RATIO
// =================================
// Holding losers longer than winners
exports.calculateDispositionRatio = (trades) => {
  const winners = trades.filter(t => t.pnl > 0);
  const losers = trades.filter(t => t.pnl < 0);

  if (winners.length === 0 || losers.length === 0) return 1;

  const avgWinDuration =
    winners.reduce((sum, t) =>
      sum + (new Date(t.exitTime) - new Date(t.entryTime)), 0
    ) / winners.length;

  const avgLossDuration =
    losers.reduce((sum, t) =>
      sum + (new Date(t.exitTime) - new Date(t.entryTime)), 0
    ) / losers.length;

  return Number((avgLossDuration / avgWinDuration).toFixed(2));
};

// =================================
// 5. HOUSE MONEY EFFECT
// =================================
// Risk increase after wins
exports.calculateHouseMoneyFactor = (trades) => {
  if (!trades || trades.length < 2) return 1;

  const sorted = [...trades].sort(
    (a, b) => new Date(b.entryTime) - new Date(a.entryTime)
  );

  const last = sorted[0];
  const previous = sorted[1];

  if (previous.result === "win") {
    return Number(
      (last.riskPercentage / previous.riskPercentage).toFixed(2)
    );
  }

  return 1;
};

// =================================
// 6. LOSS REACTIVITY
// =================================
// Revenge trading detection
exports.calculateLossReactivity = (trades) => {
  if (!trades || trades.length < 2) return "Stable";

  const sorted = [...trades].sort(
    (a, b) => new Date(a.entryTime) - new Date(b.entryTime)
  );

  const prev = sorted[sorted.length - 2];
  const last = sorted[sorted.length - 1];

  if (prev.result === "loss") {
    const gapMinutes =
      (new Date(last.entryTime) - new Date(prev.exitTime)) / 60000;

    if (gapMinutes < 10) return "High";
  }

  return "Stable";
};
// =================================
// 7. BEHAVIOURAL WARNINGS GENERATOR
// =================================
// Converts raw metrics into human-readable feedback
exports.generateBehaviourWarnings = (metrics) => {
  const warnings = [];

  if (metrics.disciplineScore < 70) {
    warnings.push("Low discipline score detected. Frequent rule violations may be affecting performance.");
  }

  if (metrics.overtradingIndex > 1.2) {
    warnings.push("Overtrading behaviour detected. Trade frequency exceeds planned limits.");
  }

  if (metrics.dispositionRatio > 1.5) {
    warnings.push("Disposition effect detected. Losing trades are being held longer than winning trades.");
  }

  if (metrics.houseMoneyFactor > 1.3) {
    warnings.push("House money effect detected. Risk-taking has increased following winning trades.");
  }

  if (metrics.lossReactivity === "High") {
    warnings.push("High loss reactivity detected. Trades are being placed too quickly after losses.");
  }

  if (warnings.length === 0) {
    warnings.push("No significant behavioural risks detected. Trading behaviour appears stable.");
  }

  return warnings;
};
