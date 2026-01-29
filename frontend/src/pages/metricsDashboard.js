import { useState } from "react";
import { getUserMetrics } from "../services/metricsService";

const MetricsDashboard = () => {
  const [userId, setUserId] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    if (!userId) {
      setError("Please enter a User ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getUserMetrics(userId);
      setMetrics(data);
    } catch (err) {
      setError("Failed to fetch metrics. Check User ID or server.");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const scoreColour =
    metrics?.disciplineScore >= 80
      ? "green"
      : metrics?.disciplineScore >= 50
      ? "orange"
      : "red";

  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>
      <h2>Behavioural Metrics Dashboard</h2>

      <input
        type="text"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <button onClick={fetchMetrics}>Fetch Metrics</button>

      {loading && <p>Loading metrics...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {metrics && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ color: scoreColour }}>
            Discipline Score: {metrics.disciplineScore}
          </h3>

          <p><strong>Total Trades:</strong> {metrics.totalTrades}</p>
          <p><strong>Overtrading Index:</strong> {metrics.overtradingIndex}</p>
          <p><strong>Disposition Ratio:</strong> {metrics.dispositionRatio}</p>
          <p><strong>House Money Factor:</strong> {metrics.houseMoneyFactor}</p>
          <p><strong>Loss Reactivity:</strong> {metrics.lossReactivity}</p>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
