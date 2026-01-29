function calculateDisciplineScore(trade) {
  let score = 100;

  if (!trade.followedPlan) score -= 30;
  if (!trade.riskWithinLimit) score -= 25;
  if (trade.revengeTrade) score -= 25;

  const riskyEmotions = ["angry", "frustrated", "anxious"];
  if (riskyEmotions.includes(trade.emotion)) {
    score -= 20;
  }

  return Math.max(score, 0);
}

module.exports = calculateDisciplineScore;
