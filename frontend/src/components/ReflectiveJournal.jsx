import React, { useState } from 'react';
import { FileText, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import axios from 'axios';

export function ReflectiveJournal({ trades, userId, onTradeLogged }) {
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    asset: '', direction: 'Long', pnl: '', 
    followedPlan: 'yes', emotionalState: 'Calm', notes: ''
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        userId,
        instrument: formData.asset.toUpperCase(),
        direction: formData.direction,
        pnl: Number(formData.pnl),
        result: Number(formData.pnl) > 0 ? 'win' : 'loss',
        followedPlan: formData.followedPlan === 'yes',
        mood: formData.emotionalState,
        notes: formData.notes, // New field for backend
        entryTime: new Date(),
        exitTime: new Date(),
        riskPercentage: 1
      };

      await axios.post('http://localhost:5000/api/trades', payload);
      alert("Trade Logged Successfully");
      setShowForm(false);
      onTradeLogged(); 
    } catch (err) {
      alert("Error logging trade: " + err.message);
    }
  };

  // Helper for Emotion Badge Color
  const getEmotionColor = (mood) => {
    const map = {
      'Calm': '#3B82F6', // Blue
      'Confident': '#10B981', // Green
      'Anxious': '#F59E0B', // Yellow
      'Greedy': '#EF4444', // Red
      'Angry': '#EF4444'
    };
    return map[mood] || '#6B778C';
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <div>
          <h2 style={{fontSize:'1.5rem', fontWeight:'700', margin:0}}>Reflective Trading Journal</h2>
          <p style={{color:'#6B778C', margin:'5px 0 0 0'}}>Analyse your emotional state and plan adherence</p>
        </div>
        <button className="btn" style={{background:'black', color:'white'}} onClick={() => setShowForm(!showForm)}>
          <FileText size={16} /> New Entry
        </button>
      </div>

      {/* NEW ENTRY FORM (Toggleable) */}
      {showForm && (
        <div className="card" style={{ borderTop: '4px solid #36B37E', animation: 'slideDown 0.3s' }}>
          <h3 style={{margin:'0 0 20px 0'}}>Log New Trade</h3>
          <div className="grid-3">
            <div><label style={{fontWeight:600}}>Asset</label><input className="input" placeholder="NVDA" value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})} /></div>
            <div><label style={{fontWeight:600}}>PnL ($)</label><input className="input" type="number" placeholder="100" value={formData.pnl} onChange={e => setFormData({...formData, pnl: e.target.value})} /></div>
            <div><label style={{fontWeight:600}}>Direction</label>
              <select className="select" value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value})}>
                <option>Long</option><option>Short</option>
              </select>
            </div>
            <div><label style={{fontWeight:600}}>Plan Adherence</label>
              <select className="select" value={formData.followedPlan} onChange={e => setFormData({...formData, followedPlan: e.target.value})}>
                <option value="yes">Followed Plan</option><option value="no">Broke Rules</option>
              </select>
            </div>
            <div><label style={{fontWeight:600}}>Emotion</label>
              <select className="select" value={formData.emotionalState} onChange={e => setFormData({...formData, emotionalState: e.target.value})}>
                <option>Calm</option><option>Confident</option><option>Anxious</option><option>Greedy</option><option>Angry</option>
              </select>
            </div>
            <div><label style={{fontWeight:600}}>Notes</label><input className="input" placeholder="Why did you take this trade?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
          </div>
          <div style={{marginTop:'20px', textAlign:'right'}}>
            <button className="btn btn-primary" onClick={handleSubmit}>Save Trade Log</button>
          </div>
        </div>
      )}

      <h4 style={{margin:'10px 0', color:'#6B778C'}}>Trade History ({trades.length})</h4>

      {/* TRADE LIST */}
      <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        {trades.length === 0 ? <div className="card" style={{textAlign:'center', color:'#999'}}>No trades recorded yet.</div> : 
         trades.slice().reverse().map((t) => (
          <div key={t._id} className="card" style={{ 
            padding: '20px', 
            borderLeft: `6px solid ${t.pnl > 0 ? '#10B981' : '#EF4444'}`, // Green/Red Border
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '20px',
            alignItems: 'start'
          }}>
            {/* Left Col: Asset & Stats */}
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div>
                   <h3 style={{margin:0, fontSize:'1.2rem', fontWeight:'800'}}>{t.instrument || 'ASSET'}</h3>
                   <div style={{color:'#6B778C', fontSize:'0.85rem', marginTop:'4px'}}>
                     {t.direction} • {new Date(t.entryTime).toLocaleDateString()}
                   </div>
                </div>
                <div style={{textAlign:'right'}}>
                   <div style={{fontWeight:'700', fontSize:'1.2rem', color: t.pnl > 0 ? '#10B981' : '#EF4444', display:'flex', alignItems:'center', gap:'5px'}}>
                     {t.pnl > 0 ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                     {t.pnl > 0 ? '+' : ''}{t.pnl.toFixed(2)}
                   </div>
                   <div style={{fontSize:'0.75rem', color:'#999', textTransform:'uppercase'}}>P&L</div>
                </div>
              </div>

              <div style={{marginTop:'15px'}}>
                <div style={{fontSize:'0.85rem', color:'#666'}}>Risk: <span style={{fontWeight:'600', color:'#172B4D'}}>$100</span></div>
              </div>
              
              <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
                 <span style={{background:'#172B4D', color:'white', padding:'4px 10px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'600'}}>
                   {t.followedPlan ? 'Followed Plan' : 'Rule Break'}
                 </span>
                 <span style={{background: getEmotionColor(t.mood), color:'white', padding:'4px 10px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'600'}}>
                   {t.mood || 'Neutral'}
                 </span>
              </div>
            </div>

            {/* Right Col: Reflection Notes */}
            <div style={{borderLeft:'1px solid #EBECF0', paddingLeft:'20px', height:'100%'}}>
              <h4 style={{margin:'0 0 8px 0', fontSize:'0.9rem', color:'#6B778C'}}>Reflection Notes</h4>
              <p style={{margin:0, fontSize:'0.95rem', lineHeight:'1.5', color:'#172B4D'}}>
                {t.notes || "No reflection notes added for this trade."}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}