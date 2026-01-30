import React from 'react';
// Import the helper we just made to process the warnings locally
import { generateBehaviourWarnings } from '../services/metricsService'; 

const BehaviouralFeedbackPanel = ({ data }) => {
  if (!data) return <div className="card">Loading Advanced Analytics...</div>;

  // 1. GENERATE WARNINGS USING YOUR FRONTEND LOGIC
  const warnings = generateBehaviourWarnings(data);
  const hasHighSeverity = warnings.some(w => w.severity === "High");

  // Helper for status colors
  const getStatusColor = (isGood) => isGood ? '#36b37e' : '#ff5630';

  return (
    <div style={{ marginBottom: '30px' }}>
      
      {/* --- DYNAMIC WARNING BANNER --- */}
      {warnings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {warnings.map((warning, index) => (
                <div key={index} style={{ 
                    backgroundColor: warning.severity === 'High' ? '#ffebe6' : '#fffae6', 
                    border: warning.severity === 'High' ? '1px solid #ff5630' : '1px solid #ffab00', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <span style={{ fontSize: '24px' }}>
                        {warning.severity === 'High' ? '🛑' : '⚠️'}
                    </span>
                    <div>
                        <strong style={{ 
                            color: warning.severity === 'High' ? '#bf2600' : '#7a4100',
                            textTransform: 'uppercase',
                            fontSize: '12px'
                        }}>
                            {warning.type} ({warning.severity} Risk)
                        </strong>
                        <div style={{ color: '#172b4d', fontWeight: '500' }}>
                            {warning.message}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#e3fcef', border: '1px solid #36b37e', borderRadius: '8px', 
          padding: '15px', marginBottom: '20px', color: '#006644', display:'flex', alignItems:'center', gap:'10px'
        }}>
          <span>✅</span>
          <strong>PSYCHOLOGY CHECK:</strong> Trading behaviour is stable. No risks detected.
        </div>
      )}

      {/* --- THE METRICS GRID --- */}
      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        <MetricCard 
          title="Discipline Score" 
          value={`${data.disciplineScore || 0}%`} 
          status={data.disciplineScore >= 60 ? "Good" : "Poor"} 
          color={getStatusColor(data.disciplineScore >= 60)}
        />
        <MetricCard 
          title="Overtrading Index" 
          value={data.overtradingIndex || 0} 
          status={data.overtradingIndex <= 1.2 ? "Stable" : "High"} 
          color={getStatusColor(data.overtradingIndex <= 1.2)}
          desc="Target: < 1.2"
        />
        <MetricCard 
          title="Disposition Ratio" 
          value={data.dispositionRatio || 1} 
          status={data.dispositionRatio > 1.5 ? "Healthy" : "Inverted"} 
          color={getStatusColor(data.dispositionRatio > 1.5)}
          desc="Target: > 1.5"
        />
        <MetricCard 
          title="House Money Effect" 
          value={data.houseMoneyFactor || 1} 
          status={data.houseMoneyFactor <= 1.3 ? "Stable" : "Risk Detected"} 
          color={getStatusColor(data.houseMoneyFactor <= 1.3)}
          desc="Risk increase after wins"
        />
        <MetricCard 
          title="Loss Reactivity" 
          value={data.lossReactivity || "Stable"} 
          status={data.lossReactivity === "Stable" ? "Calm" : "Impulsive"} 
          color={getStatusColor(data.lossReactivity === "Stable")}
          desc="Re-entry speed"
        />
        
        {/* SYSTEM STATUS CARD */}
        <div className="card" style={{ 
            background: hasHighSeverity ? '#ff5630' : '#36b37e', 
            color: 'white',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            textAlign: 'center'
        }}>
           <h4 style={{ margin: 0, textTransform:'uppercase', opacity: 0.8, fontSize:'12px' }}>System Status</h4>
           <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop:'5px' }}>
               {hasHighSeverity ? "STOP TRADING" : "ACTIVE"}
           </div>
        </div>

      </div>
    </div>
  );
};

// Reusable Sub-component
const MetricCard = ({ title, value, status, color, desc }) => (
  <div className="card" style={{ borderTop: `4px solid ${color}` }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#6b778c', fontSize: '12px', textTransform:'uppercase' }}>{title}</h4>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <span style={{ fontSize: '28px', fontWeight: '700', color: '#172b4d' }}>{value}</span>
      <span style={{ fontSize: '14px', fontWeight: '600', color: color }}>{status}</span>
    </div>
    {desc && <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>{desc}</div>}
  </div>
);

export default BehaviouralFeedbackPanel;