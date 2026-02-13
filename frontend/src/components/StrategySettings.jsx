import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, LockOpen, AlertTriangle, ShieldCheck, Settings2, Hash, Activity } from 'lucide-react';
import axios from 'axios';

export default function StrategySettings({ user, onUpdate }) {
  const [isLocked, setIsLocked] = useState(true);
  const [rules, setRules] = useState([]);
  const [dailyLimit, setDailyLimit] = useState(3); // New State for Trade Limit
  const [loading, setLoading] = useState(false);
  
  // Terminal State
  const [ruleName, setRuleName] = useState('');
  const [ruleValue, setRuleValue] = useState('');
  const [ruleCategory, setRuleCategory] = useState('soft'); 

  // 1. INITIALIZE DATA FROM USER PROFILE
  useEffect(() => {
    if (user) {
      // Sync Limit
      setDailyLimit(user.plannedDailyLimit || 3);

      // Sync Rules
      if (user.tradingPlanRules) {
        const parsed = user.tradingPlanRules.map((r, i) => {
          const isHard = r.startsWith('[HARD]');
          const cleanLabel = r.replace('[HARD] ', '');
          return { 
            id: i + Date.now(), 
            label: cleanLabel, 
            fullString: r,
            category: isHard ? 'hard' : 'soft' 
          };
        });
        setRules(parsed);
      }
    }
  }, [user]);

  // 2. ADD RULE LOGIC
  const handleAddRule = () => {
    if (!ruleName || !ruleValue) return;
    const displayLabel = `${ruleName}: ${ruleValue}`;
    const backendString = ruleCategory === 'hard' ? `[HARD] ${displayLabel}` : displayLabel;

    setRules(prev => [...prev, { 
      id: Date.now(), 
      label: displayLabel, 
      fullString: backendString, 
      category: ruleCategory 
    }]);
    
    setRuleName('');
    setRuleValue('');
  };

  const handleRemoveRule = (id) => {
    if (isLocked) return;
    setRules(prev => prev.filter(r => r.id !== id));
  };

  // 3. SAVE LOGIC (Includes Daily Limit now)
  const handleSave = async () => {
  setLoading(true);
  try {
    // We map the rules back to simple strings for the database
    const ruleStrings = rules.map(r => r.fullString);
    
    console.log("📡 Sending Update to:", `http://localhost:5000/api/users/${user._id}`);

    const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, {
      tradingPlanRules: ruleStrings,
      plannedDailyLimit: parseInt(dailyLimit)
    });

    // Update the app state and storage
    onUpdate(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
    
    setIsLocked(true);
    alert("✅ Protocols Updated: Risk Limits Enforced.");
  } catch (err) {
    console.error("Save Error:", err.response || err);
    alert(`System Sync Failed: ${err.response?.status || 'Check Connection'}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={layoutContainer}>
      
      {/* --- INDUSTRIAL STATUS BANNER --- */}
      <div style={{ 
        ...statusBanner, 
        backgroundColor: isLocked ? '#0F172A' : '#FFFFFF',
        color: isLocked ? '#F8FAFC' : '#0F172A',
        border: isLocked ? 'none' : '2px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ ...statusIconBox, backgroundColor: isLocked ? '#1E293B' : '#F1F5F9' }}>
            {isLocked ? <Lock size={20} color="#10B981" /> : <LockOpen size={20} color="#F59E0B" />}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '2px', opacity: 0.6 }}>STRATEGY STATUS</div>
            <div style={{ fontSize: '18px', fontWeight: '900' }}>{isLocked ? 'ACTIVE & ENFORCED' : 'CONFIGURATION MODE'}</div>
          </div>
        </div>
        <button 
          onClick={isLocked ? () => setIsLocked(false) : handleSave}
          style={{ ...actionBtn, backgroundColor: isLocked ? '#10B981' : '#0F172A', color: '#FFF' }}
        >
          {loading ? 'SYNCING...' : isLocked ? 'UNLOCK PARAMETERS' : 'SEAL & DEPLOY'}
        </button>
      </div>

      {/* --- NEW: RISK CONFIGURATION SECTION --- */}
      <div style={{ marginBottom: '30px' }}>
        <div style={riskCard}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                 <Activity size={24} color="#EF4444" />
                 <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', letterSpacing: '1px', color: '#0F172A' }}>MAXIMUM DAILY TRADES</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                       Hard stop trigger for Impulsivity Index.
                    </p>
                 </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <button 
                    disabled={isLocked || dailyLimit <= 1} 
                    onClick={() => setDailyLimit(prev => prev - 1)}
                    style={counterBtn}
                 >-</button>
                 <div style={counterDisplay}>
                    {dailyLimit}
                 </div>
                 <button 
                    disabled={isLocked} 
                    onClick={() => setDailyLimit(prev => parseInt(prev) + 1)}
                    style={counterBtn}
                 >+</button>
              </div>
           </div>
        </div>
      </div>

      <div style={dualGrid}>
        {/* --- SYSTEM CRITICAL (HARD) RULES --- */}
        <div style={sectionCard}>
          <div style={sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="#EF4444" />
              <span style={headerText}>SYSTEM CRITICAL (HARD)</span>
            </div>
            <div style={ruleCounter}>{rules.filter(r => r.category === 'hard').length}</div>
          </div>
          <div style={ruleScrollArea}>
            {rules.filter(r => r.category === 'hard').map(rule => (
              <div key={rule.id} style={hardRuleItem}>
                <div style={ruleContent}>
                  <Hash size={14} style={{ opacity: 0.3 }} />
                  <span style={{ fontWeight: '700' }}>{rule.label}</span>
                </div>
                {!isLocked && <Trash2 size={16} style={deleteIcon} onClick={() => handleRemoveRule(rule.id)} />}
              </div>
            ))}
            {rules.filter(r => r.category === 'hard').length === 0 && <div style={emptyState}>NO CRITICAL CONSTRAINTS LOADED</div>}
          </div>
        </div>

        {/* --- OPERATIONAL (SOFT) GUIDELINES --- */}
        <div style={sectionCard}>
          <div style={sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings2 size={18} color="#3B82F6" />
              <span style={headerText}>OPERATIONAL (SOFT)</span>
            </div>
            <div style={ruleCounter}>{rules.filter(r => r.category === 'soft').length}</div>
          </div>
          <div style={ruleScrollArea}>
            {rules.filter(r => r.category === 'soft').map(rule => (
              <div key={rule.id} style={softRuleItem}>
                <div style={ruleContent}>
                  <div style={softBullet}></div>
                  <span>{rule.label}</span>
                </div>
                {!isLocked && <Trash2 size={16} style={deleteIcon} onClick={() => handleRemoveRule(rule.id)} />}
              </div>
            ))}
            {rules.filter(r => r.category === 'soft').length === 0 && <div style={emptyState}>NO GUIDELINES LOADED</div>}
          </div>
        </div>
      </div>

      {/* --- COMMAND INPUT TERMINAL --- */}
      {!isLocked && (
        <div style={terminalCard}>
          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plus size={20} color="#0F172A" />
            <span style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '1px' }}>RULE BUILDER TERMINAL</span>
          </div>
          <div style={terminalGrid}>
            <div style={{ flex: 2 }}>
              <label style={terminalLabel}>PARAMETER NAME</label>
              <input style={terminalInput} placeholder="e.g. LIQUIDITY DRAW" value={ruleName} onChange={e => setRuleName(e.target.value)} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={terminalLabel}>EXPECTED CONDITION</label>
              <input style={terminalInput} placeholder="e.g. DAILY HIGH SWEPT" value={ruleValue} onChange={e => setRuleValue(e.target.value)} />
            </div>
            <div style={{ flex: 1.2 }}>
              <label style={terminalLabel}>ENFORCEMENT LEVEL</label>
              <div style={modeToggle}>
                <button onClick={() => setRuleCategory('soft')} style={ruleCategory === 'soft' ? activeMode('#3B82F6') : inactiveMode}>SOFT</button>
                <button onClick={() => setRuleCategory('hard')} style={ruleCategory === 'hard' ? activeMode('#EF4444') : inactiveMode}>HARD</button>
              </div>
            </div>
            <button style={terminalAddBtn} onClick={handleAddRule}>INITIALIZE RULE</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- INDUSTRIAL DESIGN SYSTEM STYLES ---
const layoutContainer = { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' };
const statusBanner = { borderRadius: '12px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' };
const statusIconBox = { padding: '15px', borderRadius: '12px' };
const actionBtn = { border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: '900', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer', transition: 'transform 0.1s' };

// Risk Section Styles
const riskCard = { background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
const counterBtn = { width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '18px', fontWeight: '700', color: '#64748B' };
const counterDisplay = { width: '60px', textAlign: 'center', fontSize: '24px', fontWeight: '900', color: '#0F172A' };

const dualGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' };
const sectionCard = { background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' };
const sectionHeader = { padding: '20px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' };
const headerText = { fontWeight: '900', fontSize: '12px', letterSpacing: '1px', color: '#475569' };
const ruleCounter = { background: '#0F172A', color: '#FFF', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' };
const ruleScrollArea = { padding: '20px', minHeight: '220px' };
const hardRuleItem = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', marginBottom: '10px', fontSize: '13px', color: '#991B1B' };
const softRuleItem = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px', marginBottom: '10px', fontSize: '13px', color: '#1E40AF' };
const ruleContent = { display: 'flex', alignItems: 'center', gap: '12px' };
const softBullet = { height: '6px', width: '6px', borderRadius: '50%', background: '#3B82F6' };
const deleteIcon = { cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' };
const emptyState = { textAlign: 'center', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginTop: '80px', letterSpacing: '1px' };
const terminalCard = { background: '#F1F5F9', padding: '40px', borderRadius: '16px', border: '2px solid #E2E8F0' };
const terminalGrid = { display: 'flex', gap: '20px', alignItems: 'flex-end' };
const terminalLabel = { display: 'block', fontSize: '10px', fontWeight: '900', color: '#64748B', marginBottom: '10px', letterSpacing: '1.5px' };
const terminalInput = { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #CBD5E1', fontSize: '13px', fontWeight: '600', outline: 'none', backgroundColor: '#FFF' };
const modeToggle = { display: 'flex', background: '#CBD5E1', borderRadius: '8px', padding: '4px' };
const activeMode = (color) => ({ flex: 1, border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '900', backgroundColor: color, color: '#FFF' });
const inactiveMode = { flex: 1, border: 'none', padding: '10px', background: 'transparent', cursor: 'pointer', fontSize: '11px', fontWeight: '800', color: '#475569' };
const terminalAddBtn = { background: '#0F172A', color: '#FFF', border: 'none', padding: '14px 25px', borderRadius: '8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' };