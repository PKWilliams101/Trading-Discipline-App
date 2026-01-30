import React, { useState } from 'react';
import axios from 'axios';

const TradeExecutionWizard = ({ userId, onTradeSuccess, currentHistory, user }) => {
    // ============================================================
    // 1. DEFINE ALL HOOKS FIRST (Must be at the very top)
    // ============================================================
    const [phase, setPhase] = useState('PRE_FLIGHT'); 
    const [instrument, setInstrument] = useState('');
    const [direction, setDirection] = useState('buy');
    
    // Dynamic Checklist State
    const [checkedRules, setCheckedRules] = useState({});

    const [entryTime, setEntryTime] = useState(null);
    const [pnl, setPnl] = useState('');
    const [mood, setMood] = useState('Neutral');
    const [followedPlan, setFollowedPlan] = useState(true);

    // ============================================================
    // 2. NOW WE DO THE SAFETY CHECK
    // ============================================================
    // If user is null, we return early, but AFTER hooks are defined.
    if (!user) {
        return <div className="card">Loading User Strategy...</div>;
    }

    // ============================================================
    // 3. LOGIC THAT DEPENDS ON 'USER'
    // ============================================================
    const MAX_TRADES = user.plannedDailyLimit || 3;
    const rulesList = user.tradingPlanRules || [];

    // Count today's trades
    // Safely handle currentHistory if it's undefined
    const history = currentHistory || [];
    const tradesToday = history.filter(t => {
        const d = new Date(t.entryTime);
        const n = new Date();
        return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;

    const tradesRemaining = MAX_TRADES - tradesToday;

    // --- STEP 1: START TRADE VALIDATION ---
    const handleStartTrade = () => {
        if (!instrument) { alert("Please enter an asset"); return; }
        
        // 1. Check if all Dynamic Rules are ticked
        const ticks = Object.values(checkedRules).filter(val => val === true).length;
        const totalRules = rulesList.length;

        // "Friction" Logic
        if (totalRules > 0 && ticks < totalRules) { 
            if(!window.confirm(`⚠️ WARNING: You have only checked ${ticks}/${totalRules} of your rules. Are you sure you want to force this trade?`)) {
                return;
            }
        }

        // 2. Overtrading Logic
        if (tradesRemaining <= 0) {
            alert(`🛑 STOP: You have reached your daily limit of ${MAX_TRADES} trades.`);
            return;
        }

        // 3. Go Live
        setEntryTime(new Date());
        setPhase('LIVE');
    };

    // --- STEP 2: CLOSE TRADE ---
    const handleCloseTrade = async () => {
        if (!pnl) { alert("Please enter the result (PnL)"); return; }

        const tradeData = {
            userId: user._id,
            instrument,
            direction,
            entryTime,
            exitTime: new Date(),
            pnl: Number(pnl),
            result: Number(pnl) > 0 ? 'win' : 'loss',
            followedPlan,
            mood,
            riskPercentage: 1
        };

        try {
            await axios.post('http://localhost:5000/api/trades', tradeData);
            alert("✅ Trade Journaled!");
            if (onTradeSuccess) onTradeSuccess();
            
            // Reset Wizard
            setPhase('PRE_FLIGHT');
            setInstrument('');
            setPnl('');
            setCheckedRules({}); 
        } catch (err) {
            alert("Error saving trade: " + err.message);
        }
    };

    // ============================================
    // VIEW 1: PRE-FLIGHT (DYNAMIC)
    // ============================================
    if (phase === 'PRE_FLIGHT') {
        return (
            <div className="card" style={{ borderTop: '4px solid #0052cc' }}>
                <h3 style={{ marginTop: 0 }}>✈️ Pre-Trade Checklist</h3>
                
                {/* STATUS BAR */}
                <div style={{ marginBottom: '15px', padding:'10px', background:'#f4f5f7', borderRadius:'4px', fontSize:'13px' }}>
                    <span style={{marginRight:'15px'}}>Daily Limit: <strong>{MAX_TRADES}</strong></span>
                    <span>Remaining: <strong style={{ color: tradesRemaining > 0 ? 'green' : 'red' }}>{tradesRemaining}</strong></span>
                </div>

                {/* ASSET INPUTS */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input placeholder="Asset (e.g. BTC)" value={instrument} onChange={e => setInstrument(e.target.value)} style={{ flex: 1 }} />
                    <select value={direction} onChange={e => setDirection(e.target.value)}>
                        <option value="buy">Long (Buy)</option>
                        <option value="sell">Short (Sell)</option>
                    </select>
                </div>

                {/* DYNAMIC RULES LIST */}
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b778c' }}>Confirm Your Rules</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {rulesList.length === 0 ? (
                        <p style={{fontStyle:'italic', color:'#999'}}>No rules defined. Go to "Strategy Settings" to add your checklist.</p>
                    ) : (
                        rulesList.map((rule, index) => (
                            <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor:'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={!!checkedRules[index]} 
                                    onChange={(e) => setCheckedRules({ ...checkedRules, [index]: e.target.checked })} 
                                />
                                <span>{rule}</span>
                            </label>
                        ))
                    )}
                </div>

                <button 
                    onClick={handleStartTrade} 
                    className="btn-primary" 
                    style={{ width: '100%', background: tradesRemaining > 0 ? '#0052cc' : '#ccc' }}
                    disabled={tradesRemaining <= 0}
                >
                    ENTER TRADE EXECUTION MODE ➔
                </button>
            </div>
        );
    }

    // ============================================
    // VIEW 2: LIVE TRADE (MONITORING)
    // ============================================
    if (phase === 'LIVE') {
        return (
            <div className="card" style={{ borderTop: '4px solid #36b37e', backgroundColor: '#e3fcef', textAlign: 'center', padding: '40px' }}>
                <h2 style={{ color: '#006644', marginTop: 0 }}>🟢 TRADE IS ACTIVE</h2>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    {instrument} ({direction.toUpperCase()})
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #36b37e', marginBottom: '30px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#6b778c' }}>PSYCHOLOGY ANCHOR</h4>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color:'#172b4d' }}>
                        "Stick to the plan."<br/>
                        "Accept the risk you have taken."
                    </p>
                </div>

                <p style={{ color: '#666', fontSize:'13px' }}>Do not close this window until you exit the trade.</p>
                
                <button 
                    onClick={() => setPhase('POST_MORTEM')} 
                    style={{ 
                        backgroundColor: '#ff5630', color: 'white', border: 'none', 
                        padding: '15px 30px', borderRadius: '6px', fontSize: '16px', 
                        fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    🛑 CLOSE TRADE
                </button>
            </div>
        );
    }

    // ============================================
    // VIEW 3: POST-MORTEM (JOURNALING)
    // ============================================
    if (phase === 'POST_MORTEM') {
        return (
            <div className="card" style={{ borderTop: '4px solid #ff5630' }}>
                <h3>📝 Trade Debrief</h3>
                
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Final PnL ($)</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 100 or -50" 
                        value={pnl} 
                        onChange={e => setPnl(e.target.value)} 
                        style={{ width: '100%', fontSize: '18px', padding: '10px' }}
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Emotion During Trade</label>
                    <select value={mood} onChange={e => setMood(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                        <option value="Neutral">😐 Neutral / Calm</option>
                        <option value="Anxious">😰 Anxious / Scared</option>
                        <option value="Greedy">🤑 Greedy / FOMO</option>
                        <option value="Angry">😡 Angry / Frustrated</option>
                        <option value="Euphoric">🤩 Euphoric / Overconfident</option>
                    </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding:'10px', background:'#f4f5f7', borderRadius:'6px' }}>
                    <input type="checkbox" checked={followedPlan} onChange={e => setFollowedPlan(e.target.checked)} />
                    <span><strong>I followed my exit rules</strong> (regardless of win/loss)</span>
                </label>

                <button onClick={handleCloseTrade} className="btn-primary" style={{ width: '100%' }}>
                    SAVE TO JOURNAL ➔
                </button>
            </div>
        );
    }
};

export default TradeExecutionWizard;