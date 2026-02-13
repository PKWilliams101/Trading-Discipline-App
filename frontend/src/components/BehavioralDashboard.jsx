import React from 'react';
import { Target, Activity, Brain } from 'lucide-react';

export function BehavioralDashboard({ trades = [], user }) {
  
  // --- 1. STRICT DATE FILTERING ---
  const todayStr = new Date().toDateString();
  const todayTrades = trades.filter(t => 
    new Date(t.entryTime || t.timestamp).toDateString() === todayStr
  );

  // --- 2. THE "CLEAN SLATE" FORCE RESET ---
  // If no trades are detected for TODAY, we stop and show 100% Discipline / 0% Risk
  if (todayTrades.length === 0) {
    return (
      <div style={gridStyle}>
        <MetricCard title="DISCIPLINE" value="100%" color="#10B981" />
        <MetricCard title="IMPULSIVITY" value="0.00x" color="#3B82F6" />
        <MetricCard title="REVENGE RISK" value="0%" color="#10B981" />
      </div>
    );
  }

  // --- 3. ACTIVE SESSION CALCULATIONS ---
  const calculateDiscipline = () => {
    const adherent = todayTrades.filter(t => t.followedPlan === true).length;
    return Math.round((adherent / todayTrades.length) * 100);
  };

  const calculateRevenge = () => {
    // Sort Newest First to check the latest result
    const sorted = [...todayTrades].sort((a, b) => 
      new Date(b.entryTime || b.timestamp) - new Date(a.entryTime || a.timestamp)
    );
    const latest = sorted[0];

    // Risk only spikes if you actually have a loss today
    if (latest.pnl < 0) return 85; 
    return 10; 
  };

  const impulsivityIndex = todayTrades.length / (user?.plannedDailyLimit || 3);

  return (
    <div style={gridStyle}>
      <MetricCard title="DISCIPLINE" value={`${calculateDiscipline()}%`} color="#10B981" />
      <MetricCard title="IMPULSIVITY" value={`${impulsivityIndex.toFixed(2)}x`} color="#3B82F6" />
      <MetricCard title="REVENGE RISK" value={`${calculateRevenge()}%`} color="#EF4444" />
    </div>
  );
}

// Styling Helper
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' };
const MetricCard = ({ title, value, color }) => (
  <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', borderBottom: `4px solid ${color}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
    <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 10px 0' }}>{title}</p>
    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{value}</h2>
  </div>
);