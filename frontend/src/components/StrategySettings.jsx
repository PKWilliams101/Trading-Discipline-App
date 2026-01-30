import React, { useState } from 'react';
import axios from 'axios';

const StrategySettings = ({ user, onUpdateUser }) => {
  // 1. Initialize State using the DATABASE Field Names
  const [settings, setSettings] = useState({
    // MATCHES BACKEND EXACTLY:
    plannedDailyLimit: user.plannedDailyLimit || 3,
    tradingPlanRules: user.tradingPlanRules || [] 
  });

  const [newRule, setNewRule] = useState("");

  // Add rule to local state
  const handleAddRule = () => {
    if (newRule.trim()) {
      setSettings({ 
        ...settings, 
        tradingPlanRules: [...settings.tradingPlanRules, newRule] 
      });
      setNewRule("");
    }
  };

  // Remove rule from local state
  const handleRemoveRule = (index) => {
    const updatedRules = settings.tradingPlanRules.filter((_, i) => i !== index);
    setSettings({ ...settings, tradingPlanRules: updatedRules });
  };

  // Save to Backend
  const handleSave = async () => {
    try {
      // Now we send 'settings' directly because the names match perfectly
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}/strategy`, settings);
      
      alert("✅ Strategy Updated!");
      
      // Update App.js immediately so Dashboard sees the change
      onUpdateUser(res.data); 
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  return (
    <div className="card">
      <h2>⚙️ Personalise Your Strategy</h2>
      
      {/* 1. DAILY LIMITS */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Max Trades Per Day</label>
        <p style={{fontSize:'12px', color:'#666', marginTop:0}}>Used to calculate Overtrading Index</p>
        <input 
            type="number"
            value={settings.plannedDailyLimit} 
            onChange={(e) => setSettings({...settings, plannedDailyLimit: Number(e.target.value)})}
            style={{ width: '100px', padding:'10px' }}
        />
      </div>

      {/* 2. DYNAMIC CHECKLIST RULES */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{marginBottom:'10px'}}>✅ Your Entry Criteria (Confluences)</h4>
        <p style={{fontSize:'12px', color:'#666', marginTop:0}}>You must tick these before the app lets you trade.</p>
        
        <ul style={{ paddingLeft: '20px' }}>
            {settings.tradingPlanRules.map((rule, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                    {rule} 
                    <button 
                        onClick={() => handleRemoveRule(idx)} 
                        style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold' }}
                    >
                        ✕
                    </button>
                </li>
            ))}
        </ul>

        {/* Add New Rule Input */}
        <div style={{ display: 'flex', gap: '10px' }}>
            <input 
                placeholder="Add new rule (e.g. 'RSI below 30')" 
                value={newRule} 
                onChange={e => setNewRule(e.target.value)}
                style={{ flex: 1 }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
            />
            <button onClick={handleAddRule} className="btn-primary" style={{ padding: '8px 20px' }}>Add</button>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary" style={{ width: '100%', backgroundColor: '#36b37e', marginTop:'20px' }}>
        SAVE STRATEGY PROFILE
      </button>
    </div>
  );
};

export default StrategySettings;