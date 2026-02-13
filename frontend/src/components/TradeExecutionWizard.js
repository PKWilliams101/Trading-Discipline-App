import React, { useState } from 'react';
import axios from 'axios';

const TradeExecutionWizard = ({ userId, onTradeSuccess, currentHistory, user, onClose }) => {
    const [phase, setPhase] = useState('PRE_FLIGHT');
    const [instrument, setInstrument] = useState('');
    const [direction, setDirection] = useState('buy');
    const [checkedRules, setCheckedRules] = useState({});
    const [entryTime, setEntryTime] = useState(null);
    const [pnl, setPnl] = useState('');
    const [mood, setMood] = useState('Neutral');
    const [followedPlan, setFollowedPlan] = useState(true);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false); // New: Prevent double submission

    if (!user) return null;

    // --- LOGIC: CALCULATE LIMITS ---
    const MAX_TRADES = Number(user.plannedDailyLimit || 3);
    const rulesList = user.tradingPlanRules || [];
    const history = currentHistory || [];

    const todayStr = new Date().toDateString();
    const tradesToday = history.filter(t => 
        new Date(t.entryTime || t.timestamp).toDateString() === todayStr
    ).length;

    const tradesRemaining = MAX_TRADES - tradesToday;

    // --- HANDLERS ---
    const handleStartTrade = () => {
        if (!instrument) return alert("Please enter an asset");

        const ticks = Object.values(checkedRules).filter(val => val === true).length;
        if (rulesList.length > 0 && ticks < rulesList.length) {
            const confirmRules = window.confirm(`⚠️ CONFLUENCE WARNING: You only checked ${ticks}/${rulesList.length} rules.\n\nTrading without full confluence reduces your edge. Force trade anyway?`);
            if (!confirmRules) return;
        }

        if (tradesRemaining <= 0) {
            const confirmOvertrade = window.confirm(`🛑 OVERTRADE WARNING: You have used all ${MAX_TRADES} daily trades.\n\nThis will spike your Impulsivity Index. Are you sure you want to proceed?`);
            if (!confirmOvertrade) return;
        }

        setEntryTime(new Date());
        setPhase('LIVE');
    };

    const handleCloseTrade = async () => {
        if (!pnl) return alert("Please enter the final PnL");
        
        setLoading(true);
        const numPnL = Number(pnl);
        
        const tradeData = {
            userId: user._id,
            instrument,
            direction,
            entryTime,
            exitTime: new Date(),
            pnl: numPnL,
            result: numPnL > 0 ? 'win' : numPnL < 0 ? 'loss' : 'breakeven',
            followedPlan,
            mood,
            notes,
            riskPercentage: 1 
        };

        try {
            await axios.post('http://localhost:5000/api/trades', tradeData);
            
            // --- THE FIX: TRIGGER BOTH SUCCESS AND CLOSE ---
            if (onTradeSuccess) onTradeSuccess(); // Refreshes Dashboard
            if (onClose) onClose();               // Physically closes the modal
            
        } catch (err) {
            console.error("Save Error:", err);
            alert("Save failed. Please check your database connection.");
        } finally {
            setLoading(false);
        }
    };

    // --- MODERN UI STYLES ---
    const styles = {
        overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        card: { backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' },
        closeX: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8', lineHeight: '1' },
        header: { fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' },
        banner: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '13px' },
        label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
        input: { width: '100%', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#1e293b', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' },
        btnNavy: { backgroundColor: '#0f172a', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', width: '100%', opacity: loading ? 0.7 : 1 },
        btnGhost: { backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#475569', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' },
        checkItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '8px', cursor: 'pointer' }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <button style={styles.closeX} onClick={onClose}>&times;</button>

                {phase === 'PRE_FLIGHT' && (
                    <>
                        <div style={styles.header}>✈️ Pre-Trade Checklist</div>
                        <div style={styles.banner}>
                            <span>Daily Limit: <strong>{MAX_TRADES}</strong></span>
                            <span style={{ color: tradesRemaining <= 0 ? '#ef4444' : '#10b981' }}>
                                Remaining: <strong>{tradesRemaining}</strong>
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={styles.label}>Asset / Symbol</label>
                                <input style={styles.input} placeholder="e.g. BTC/USD" value={instrument} onChange={e => setInstrument(e.target.value)} />
                            </div>
                            <div>
                                <label style={styles.label}>Side</label>
                                <select style={styles.input} value={direction} onChange={e => setDirection(e.target.value)}>
                                    <option value="buy">Long (Buy)</option>
                                    <option value="sell">Short (Sell)</option>
                                </select>
                            </div>
                        </div>
                        <label style={styles.label}>Check Your Rules</label>
                        <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '24px' }}>
                            {rulesList.map((rule, i) => (
                                <label key={i} style={styles.checkItem}>
                                    <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#0f172a' }} checked={!!checkedRules[i]} onChange={e => setCheckedRules({...checkedRules, [i]: e.target.checked})} />
                                    <span style={{ fontSize: '14px', color: '#334155' }}>{rule}</span>
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={styles.btnGhost} onClick={onClose}>Cancel</button>
                            <button style={styles.btnNavy} onClick={handleStartTrade}>Enter Trade</button>
                        </div>
                    </>
                )}

                {phase === 'LIVE' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'inline-block', marginBottom: '16px' }}>POSITION ACTIVE</div>
                        <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}>{instrument}</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px', fontStyle: 'italic' }}>"Stick to the plan. Markets reward discipline."</p>
                        <button style={{ ...styles.btnNavy, backgroundColor: '#ef4444' }} onClick={() => setPhase('POST_MORTEM')}>🛑 Close Position</button>
                    </div>
                )}

                {phase === 'POST_MORTEM' && (
                    <>
                        <div style={styles.header}>📝 Trade Debrief</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                            <div>
                                <label style={styles.label}>PnL ($)</label>
                                <input style={styles.input} type="number" placeholder="e.g. 150" value={pnl} onChange={e => setPnl(e.target.value)} autoFocus />
                            </div>
                            <div>
                                <label style={styles.label}>Emotion</label>
                                <select style={styles.input} value={mood} onChange={e => setMood(e.target.value)}>
                                    <option value="Neutral">😐 Neutral</option>
                                    <option value="Anxious">😰 Anxious</option>
                                    <option value="Greedy">🤑 Greedy</option>
                                    <option value="Angry">😡 Angry</option>
                                </select>
                            </div>
                        </div>
                        <label style={styles.label}>Reflective Notes</label>
                        <textarea 
                            style={{ ...styles.input, height: '80px', resize: 'none', paddingTop: '12px' }} 
                            placeholder="Why did you exit?" 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                        />
                        <label style={{ ...styles.checkItem, backgroundColor: '#f8fafc' }}>
                            <input type="checkbox" checked={followedPlan} onChange={e => setFollowedPlan(e.target.checked)} />
                            <span style={{ fontSize: '14px', fontWeight: '700' }}>I followed my rules</span>
                        </label>
                        <button 
                            style={styles.btnNavy} 
                            onClick={handleCloseTrade}
                            disabled={loading}
                        >
                            {loading ? 'SAVING TO JOURNAL...' : 'Save Journal Entry'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TradeExecutionWizard;