import React from 'react';
import { Target, Activity, Brain, TrendingUp, ShieldCheck, AlertTriangle, DollarSign, Percent } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import PageWrapper from './PageWrapper';

export default function BehaviouralFeedbackPanel({ user, trades = [] }) {
  
  // --- 1. CLEAN SLATE PROTOCOL ---
  const hasTrades = trades && trades.length > 0;

  // --- 2. CALCULATE METRICS ---
  let disciplineScore = 100, revengeRisk = 0, impulsivityIndex = 0, dispositionRatio = "0.00", systemIntegrity = 100;
  let netPnl = 0, winRate = 0;

  if (hasTrades) {
    // A. Discipline (Followed Plan %)
    const adherentTrades = trades.filter(t => t.followedPlan).length;
    disciplineScore = Math.round((adherentTrades / trades.length) * 100);

    // B. Revenge Risk (Spikes on recent loss)
    const sortedTrades = [...trades].sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    const lastTrade = sortedTrades[0];
    const isRecentLoss = lastTrade && lastTrade.pnl < 0;
    revengeRisk = isRecentLoss ? 45 : 0; 

    // C. Impulsivity (Trades vs Limit)
    const dailyLimit = user?.plannedDailyLimit || 3;
    const todayStr = new Date().toDateString();
    const tradesToday = trades.filter(t => new Date(t.entryTime).toDateString() === todayStr).length;
    impulsivityIndex = (tradesToday / dailyLimit).toFixed(2);

    // D. Disposition (Avg Win / Avg Loss)
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const avgWin = wins.length ? wins.reduce((acc, t) => acc + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0) / losses.length) : 1; 
    dispositionRatio = (avgWin / avgLoss).toFixed(2);

    // E. Extra Info: Net PnL & Win Rate
    netPnl = trades.reduce((acc, curr) => acc + (Number(curr.pnl) || 0), 0);
    winRate = Math.round((wins.length / trades.length) * 100);

    // F. System Integrity (Average of Discipline & (100 - Risk))
    systemIntegrity = Math.round((disciplineScore + (100 - revengeRisk)) / 2);
  }

  // --- 3. CHART DATA GENERATION ---
  const chartData = hasTrades ? trades.map((t, i) => ({
    name: `Trade ${i + 1}`,
    cumulative: trades.slice(0, i + 1).reduce((acc, curr) => acc + (Number(curr.pnl) || 0), 0)
  })) : [];

  // --- 4. DYNAMIC STYLING ---
  const isOptimal = systemIntegrity >= 70;
  const integrityColor = isOptimal ? 'var(--primary)' : 'var(--danger)';
  const integrityLabel = isOptimal ? 'SYSTEM INTEGRITY: OPERATIONAL' : 'SYSTEM INTEGRITY: COMPROMISED';

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER SECTION */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
            Good Afternoon, {user?.username || 'Trader'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: integrityColor }}></div>
            <span>System Operational • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* HERO BANNER - SYSTEM INTEGRITY */}
        <div className="card" style={{ 
          background: isOptimal ? 'rgba(54, 179, 126, 0.1)' : 'rgba(255, 86, 48, 0.1)', 
          border: `1px solid ${integrityColor}`, 
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: integrityColor, color: 'white', padding: '12px', borderRadius: '12px' }}>
              {isOptimal ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: integrityColor, letterSpacing: '1px' }}>{integrityLabel}</h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}>
                {isOptimal ? "Cognitive state optimal. Execution protocols active." : "High emotional risk detected. Immediate pause recommended."}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '900', color: integrityColor }}>{systemIntegrity}%</div>
        </div>

        {/* METRICS GRID (Top Row - Behavioral) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
          <MetricCard title="DISCIPLINE SCORE" value={`${disciplineScore}%`} sub="Plan adherence rate" icon={<Target size={18} />} color="var(--primary)" />
          <MetricCard title="IMPULSIVITY INDEX" value={`${impulsivityIndex}x`} sub="Daily limit utilization" icon={<Activity size={18} />} color="#0052CC" />
          <MetricCard title="REVENGE RISK" value={`${revengeRisk}%`} sub="Tilt probability" icon={<Brain size={18} />} color={revengeRisk > 50 ? "var(--danger)" : "var(--warning)"} />
          <MetricCard title="DISPOSITION RATIO" value={dispositionRatio} sub="Avg Win / Avg Loss" icon={<TrendingUp size={18} />} color="#6554C0" />
        </div>

        {/* EXTRA INFO GRID (Bottom Row - Financial) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <MetricCard title="NET PROFIT / LOSS" value={`$${netPnl.toFixed(2)}`} sub="Total cumulative outcome" icon={<DollarSign size={18} />} color={netPnl >= 0 ? "var(--primary)" : "var(--danger)"} />
          <MetricCard title="WIN RATE" value={`${winRate}%`} sub="Overall trade success" icon={<Percent size={18} />} color="#0052CC" />
        </div>

        {/* BOTTOM SECTION: CHART & LIST */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Equity Curve Chart */}
          <div className="card" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} color="var(--text-muted)" /> EQUITY CURVE</span>
            </div>
            <div style={{ flexGrow: 1, width: '100%', height: '280px' }}>
              {!hasTrades ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data to plot.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)' }} />
                    <Line type="monotone" dataKey="cumulative" stroke="#0052CC" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '400px', overflowY: 'auto' }}>
            <div className="card-header">
              <span className="card-title">RECENT ACTIVITY</span>
              <span style={{ fontSize: '11px', fontWeight: '700', background: 'var(--background)', color: 'var(--text-main)', padding: '4px 8px', borderRadius: '6px' }}>{trades.length} Entries</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!hasTrades ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontStyle: 'italic', fontSize: '14px' }}>No recent trades.</div>
              ) : (
                trades.slice().reverse().slice(0, 5).map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: i === 4 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontSize: '10px', fontWeight: '800', 
                        background: t.direction === 'buy' || t.direction === 'Long' ? '#ECFDF5' : '#FEF2F2', 
                        color: t.direction === 'buy' || t.direction === 'Long' ? '#059669' : '#DC2626',
                        padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' 
                      }}>
                        {t.direction}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{t.instrument}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontWeight: '800', fontSize: '14px', color: t.pnl > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                        {t.pnl > 0 ? '+' : ''}${t.pnl}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

// Sub-component for consistent cards
const MetricCard = ({ title, value, sub, icon, color }) => (
  <div className="card" style={{ borderBottom: `4px solid ${color}`, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <div style={{ color: color }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px' }}>{title}</span>
    </div>
    <div className="big-metric" style={{ fontSize: '32px' }}>{value}</div>
    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 'auto' }}>{sub}</div>
  </div>
);