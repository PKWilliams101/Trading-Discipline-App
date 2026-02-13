import React from 'react';
import { Target, Activity, Brain, TrendingUp, Shield, ShieldAlert, Clock, ChevronRight, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export default function BehaviouralFeedbackPanel({ user, data, trades }) {
    // 1. DATA MAPPING
    const metrics = {
        discipline: data?.disciplineScore ?? 0,
        impulsivity: data?.overtradingIndex ?? "0.00",
        disposition: data?.dispositionRatio ?? "0.00",
        revenge: data?.revengeRisk ?? 0,
    };

    const username = user?.username || 'Trader';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // 2. EQUITY CURVE LOGIC
    const TARGET_PER_TRADE = 50; 
    const chartData = trades?.length > 0 ? trades
        .slice()
        .sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime))
        .reduce((acc, trade, index) => {
            const prevActual = index === 0 ? 0 : acc[index - 1].actual;
            const prevPlan = index === 0 ? 0 : acc[index - 1].planned;
            acc.push({
                date: new Date(trade.entryTime).toLocaleDateString(),
                actual: prevActual + trade.pnl,
                planned: prevPlan + TARGET_PER_TRADE
            });
            return acc;
        }, []) : [];

    const isStable = metrics.discipline >= 80;

    return (
        <div style={containerStyle}>
            
            {/* --- BRAND HEADER & WELCOME --- */}
            <div style={{ marginBottom: '40px' }}>
                {/* 1. THE NEW LOGO LOCKUP */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
    <div style={{ background: '#0F172A', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)' }}>
        {/* Changed Shield to Brain for "Cognitive" context */}
        <Brain size={24} color="#3B82F6" />
    </div>
    <div>
        <span style={{ display: 'block', fontSize: '16px', fontWeight: '900', color: '#0F172A', letterSpacing: '2px', lineHeight: '1' }}>COGNITIVE</span>
        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '3px' }}>FIREWALL</span>
    </div>
</div>

                {/* 2. WELCOME MESSAGE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-1px' }}>
                            Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {username}
                        </h1>
                        <p style={{ margin: '8px 0 0 0', color: '#64748B', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ height: '8px', width: '8px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
                            System Operational • {today}
                        </p>
                    </div>
                    
                    {/* PRO BADGE */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '30px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>
                        <Zap size={14} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFF', letterSpacing: '0.5px' }}>PRO TIER</span>
                    </div>
                </div>
            </div>

            {/* --- SYSTEM INTEGRITY BANNER --- */}
            <div style={{ 
                ...statusHeader, 
                backgroundColor: isStable ? '#10B981' : '#EF4444',
                boxShadow: isStable ? '0 10px 20px -5px rgba(16, 185, 129, 0.3)' : '0 10px 20px -5px rgba(239, 68, 68, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <ShieldAlert size={32} color="#FFF" />
                    <div>
                        <h2 style={headerTitleStyle}>SYSTEM INTEGRITY: {isStable ? 'STABLE' : 'COMPROMISED'}</h2>
                        <p style={headerSubStyle}>
                            {isStable ? 'Psychology within parameters. Edge is protected.' : 'High emotional risk detected. Immediate pause recommended.'}
                        </p>
                    </div>
                </div>
                <div style={headerScoreStyle}>{metrics.discipline}%</div>
            </div>

            {/* --- METRICS GRID --- */}
            <div style={metricsGrid}>
                <MetricCard 
                    icon={<Target size={18} color="#10B981" />} 
                    label="DISCIPLINE SCORE" 
                    value={`${metrics.discipline}%`} 
                    desc="Plan adherence rate"
                    progress={metrics.discipline}
                />
                <MetricCard 
                    icon={<Activity size={18} color="#3B82F6" />} 
                    label="IMPULSIVITY INDEX" 
                    value={`${metrics.impulsivity}x`} 
                    desc="Daily limit utilization"
                />
                <MetricCard 
                    icon={<Brain size={18} color="#F59E0B" />} 
                    label="REVENGE RISK" 
                    value={`${metrics.revenge}%`} 
                    desc="Tilt probability"
                    color={metrics.revenge > 20 ? '#EF4444' : '#1E293B'}
                />
                <MetricCard 
                    icon={<TrendingUp size={18} color="#8B5CF6" />} 
                    label="DISPOSITION RATIO" 
                    value={metrics.disposition} 
                    desc="Avg Win / Avg Loss"
                />
            </div>

            {/* --- ACTIVITY & CHARTS --- */}
            <div style={bottomSection}>
                <div style={journalPreviewCard}>
                    <div style={cardHeaderStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={18} color="#64748B" />
                            <h3 style={labelStyle}>RECENT ACTIVITY</h3>
                        </div>
                        <span style={entryCountStyle}>{trades?.length || 0} Total Entries</span>
                    </div>
                    
                    <div style={tableWrapper}>
                        {(!trades || trades.length === 0) ? (
                            <div style={emptyStateStyle}>No recent trades detected.</div>
                        ) : (
                            trades.slice(0, 5).map((trade, i) => (
                                <div key={i} style={tradeRowStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 2 }}>
                                        <div style={{ 
                                            ...sideBadge, 
                                            backgroundColor: trade.direction === 'buy' ? '#ECFDF5' : '#FEF2F2',
                                            color: trade.direction === 'buy' ? '#10B981' : '#EF4444'
                                        }}>
                                            {trade.direction?.toUpperCase()}
                                        </div>
                                        <span style={instrumentStyle}>{trade.instrument}</span>
                                    </div>
                                    <div style={{ flex: 1, color: '#64748B', fontSize: '12px' }}>
                                        {new Date(trade.entryTime).toLocaleDateString()}
                                    </div>
                                    <div style={{ 
                                        flex: 1, 
                                        fontWeight: '800', 
                                        textAlign: 'right',
                                        color: trade.pnl >= 0 ? '#10B981' : '#EF4444'
                                    }}>
                                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                                    </div>
                                    <ChevronRight size={16} color="#CBD5E1" style={{ marginLeft: '10px' }} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={miniChartCard}>
                    <h3 style={labelStyle}>EQUITY CURVE vs PLAN</h3>
                    <div style={{ height: '250px', marginTop: '15px', width: '100%' }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" hide />
                                    <YAxis fontSize={10} fontWeight={700} tickFormatter={(val) => `$${val}`} stroke="#94a3b8" width={40}/>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(val, name) => [`$${val}`, name === 'actual' ? 'Actual Equity' : 'Planned Target']}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                                    <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Plan"/>
                                    <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name="Actual"/>
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={chartPlaceholder}>
                                <p style={{ color: '#94A3B8', fontSize: '12px' }}>Insufficient data to plot curve...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS & STYLES ---
function MetricCard({ icon, label, value, desc, progress, color }) {
    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                {icon}
                <span style={labelStyle}>{label}</span>
            </div>
            <div style={{ ...valueStyle, color: color || '#1E293B' }}>{value}</div>
            {progress !== undefined && (
                <div style={progressBg}>
                    <div style={{ ...progressFill, width: `${progress}%` }}></div>
                </div>
            )}
            <p style={descStyle}>{desc}</p>
        </div>
    );
}
// --- STYLES ---
const containerStyle = { padding: '30px', maxWidth: '1200px', margin: '0 auto' };
const statusHeader = { padding: '30px', borderRadius: '16px', color: '#FFF', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const headerTitleStyle = { margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '1.5px' };
const headerSubStyle = { margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8, fontWeight: '500' };
const headerScoreStyle = { fontSize: '42px', fontWeight: '900', opacity: 0.9 };

const metricsGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' };
const cardStyle = { background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '1px' };
const valueStyle = { fontSize: '32px', fontWeight: '900', marginBottom: '8px' };
const descStyle = { fontSize: '12px', color: '#94A3B8', margin: 0, fontWeight: '500' };
const progressBg = { height: '6px', background: '#F1F5F9', borderRadius: '10px', marginBottom: '10px', overflow: 'hidden' };
const progressFill = { height: '100%', background: '#10B981', borderRadius: '10px' };

const bottomSection = { display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '25px' };
const journalPreviewCard = { background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' };
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '15px' };
const entryCountStyle = { fontSize: '12px', fontWeight: '700', color: '#94A3B8', background: '#F8FAFC', padding: '4px 10px', borderRadius: '20px' };
const tableWrapper = { display: 'flex', flexDirection: 'column' };
const tradeRowStyle = { display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' };
const instrumentStyle = { fontWeight: '700', color: '#1E293B', fontSize: '14px' };
const sideBadge = { padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' };
const emptyStateStyle = { textAlign: 'center', padding: '40px', color: '#CBD5E1', fontSize: '14px', fontStyle: 'italic' };

const miniChartCard = { background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' };
const chartPlaceholder = { height: '220px', background: '#F8FAFC', border: '1px dashed #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' };