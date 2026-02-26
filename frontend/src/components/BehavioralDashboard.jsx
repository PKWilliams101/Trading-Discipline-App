import React from 'react';
import { Target, Activity, Brain, Shield } from 'lucide-react';
import PageWrapper from './PageWrapper';

export function BehavioralDashboard({ trades = [], user }) {
  
  // --- 1. STRICT DATE FILTERING ---
  const todayStr = new Date().toDateString();
  const todayTrades = trades.filter(t => 
    new Date(t.entryTime || t.timestamp).toDateString() === todayStr
  );

  // --- 2. THE "CLEAN SLATE" FORCE RESET ---
  if (todayTrades.length === 0) {
    return (
      <PageWrapper>
        <DashboardInfoCard />
        <div style={gridStyle}>
          <MetricCard title="DISCIPLINE" value="100%" color="#69F0AE" />
          <MetricCard title="IMPULSIVITY" value="0.00x" color="#4FC3F7" />
          <MetricCard title="REVENGE RISK" value="0%" color="#69F0AE" />
        </div>
      </PageWrapper>
    );
  }

  // --- 3. ACTIVE SESSION CALCULATIONS ---
  const calculateDiscipline = () => {
    const adherent = todayTrades.filter(t => t.followedPlan === true).length;
    return Math.round((adherent / todayTrades.length) * 100);
  };

  const calculateRevenge = () => {
    const sorted = [...todayTrades].sort((a, b) => 
      new Date(b.entryTime || b.timestamp) - new Date(a.entryTime || a.timestamp)
    );
    const latest = sorted[0];
    if (latest.pnl < 0) return 85; 
    return 10; 
  };

  const impulsivityIndex = todayTrades.length / (user?.plannedDailyLimit || 3);

  return (
    <PageWrapper>
      <DashboardInfoCard />
      <div style={gridStyle}>
        <MetricCard title="DISCIPLINE" value={`${calculateDiscipline()}%`} color="#69F0AE" />
        <MetricCard title="IMPULSIVITY" value={`${impulsivityIndex.toFixed(2)}x`} color="#4FC3F7" />
        <MetricCard title="REVENGE RISK" value={`${calculateRevenge()}%`} color="#FF5252" />
      </div>
    </PageWrapper>
  );
}

// --- NEW INFO CARD COMPONENT ---
const DashboardInfoCard = () => (
  <div style={{ background: '#1E1E1E', padding: '24px', borderRadius: '12px', border: '1px solid #333', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
    <div style={{ background: '#2A2A2A', padding: '16px', borderRadius: '12px' }}>
      <Shield size={32} color="#4FC3F7" />
    </div>
    <div>
      <h3 style={{ margin: '0 0 8px 0', color: '#E0E0E0', fontSize: '18px' }}>Cognitive Firewall Active</h3>
      <p style={{ margin: 0, color: '#A0A0A0', fontSize: '14px', lineHeight: '1.5' }}>
        This terminal monitors your execution telemetry to detect emotional tilt and impulsivity. 
        Adhere to your pre-flight checklist. The system will escalate 'Positive Friction' if Revenge Risk exceeds critical thresholds.
      </p>
    </div>
  </div>
);

// --- UPDATED DARK MODE STYLING ---
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' };

const MetricCard = ({ title, value, color }) => (
  <div style={{ background: '#1E1E1E', padding: '24px', borderRadius: '12px', borderBottom: `4px solid ${color}`, border: '1px solid #333', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
    <p style={{ fontSize: '12px', fontWeight: '800', color: '#888', margin: '0 0 10px 0', letterSpacing: '1px' }}>{title}</p>
    <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: '#FFF' }}>{value}</h2>
  </div>
);