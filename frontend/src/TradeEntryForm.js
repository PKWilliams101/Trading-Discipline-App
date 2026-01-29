import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TradeEntryForm from './TradeEntryForm'; 

function App() {
  const [data, setData] = useState(null);
  const [trades, setTrades] = useState([]); // State to store the list of trades
  
  // ⚠️ REPLACE WITH YOUR REAL USER ID
  const USER_ID = "696aac2d47874eb0502de66c"; 

  // Function to fetch both Metrics and Trade History
  const fetchData = () => {
    // 1. Get Behavioural Metrics
    axios.get(`http://localhost:5000/api/metrics/${USER_ID}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching metrics:", err));

    // 2. Get Trade History (Feature 6)
    axios.get(`http://localhost:5000/api/trades/user/${USER_ID}`)
      .then(res => setTrades(res.data))
      .catch(err => console.error("Error fetching trades:", err));
  };

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <h1 style={{ textAlign: 'center', color: '#333' }}>Trader Psychology Dashboard</h1>

        {/* --- SECTION 1: METRICS DASHBOARD (Feature 4) --- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          
          {/* Card 1: Discipline Score */}
          <div style={cardStyle}>
            <h4 style={{ margin: 0, color: '#666' }}>Discipline Score</h4>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: data?.disciplineScore < 70 ? '#d93025' : '#188038' }}>
              {data ? data.disciplineScore : '--'}%
            </div>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Target: &gt;90%</p>
          </div>

          {/* Card 2: Disposition Ratio */}
          <div style={cardStyle}>
            <h4 style={{ margin: 0, color: '#666' }}>Disposition Ratio</h4>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a73e8' }}>
              {data ? data.dispositionRatio : '--'}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              {data && data.dispositionRatio > 2 ? "⚠️ Holding losses too long" : "✅ Balanced risk"}
            </p>
          </div>
        </div>

        {/* --- SECTION 2: TRADE LOGGING (Feature 2) --- */}
        <div style={{ marginBottom: '40px' }}>
          <TradeEntryForm userId={USER_ID} onTradeSuccess={fetchData} />
        </div>

        {/* --- SECTION 3: TRADE HISTORY TABLE (Feature 6) --- */}
        <div style={cardStyle}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Recent Trade History</h3>
          
          {trades.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left', fontSize: '0.9rem', color: '#555' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Symbol</th>
                  <th style={thStyle}>Direction</th>
                  <th style={thStyle}>Result</th>
                  <th style={thStyle}>PnL ($)</th>
                  <th style={thStyle}>Plan Followed?</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{new Date(trade.entryTime).toLocaleDateString()}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{trade.instrument}</td>
                    <td style={tdStyle}>{trade.direction.toUpperCase()}</td>
                    <td style={{ ...tdStyle, color: trade.result === 'win' ? 'green' : 'red', fontWeight: 'bold' }}>
                      {trade.result.toUpperCase()}
                    </td>
                    <td style={{ ...tdStyle, color: trade.pnl > 0 ? 'green' : 'red' }}>
                      {trade.pnl > 0 ? '+' : ''}{trade.pnl}
                    </td>
                    <td style={tdStyle}>
                      {trade.followedPlan ? 
                        <span style={{background: '#e6fffa', color: '#006d75', padding: '2px 8px', borderRadius: '10px', fontSize: '12px'}}>Yes</span> : 
                        <span style={{background: '#fff1f0', color: '#cf1322', padding: '2px 8px', borderRadius: '10px', fontSize: '12px'}}>No</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No trades logged yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}

// --- CSS STYLES ---
const cardStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  textAlign: 'center'
};

const thStyle = { padding: '12px', fontWeight: '600' };
const tdStyle = { padding: '12px', fontSize: '0.95rem' };

export default App;