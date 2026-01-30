import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

import TradeExecutionWizard from './components/TradeExecutionWizard'; 
import BehaviouralFeedbackPanel from './components/BehaviouralFeedbackPanel';
import StrategySettings from './components/StrategySettings';

function App() {
  // 1. INITIALIZE STATE FROM LOCAL STORAGE (The "Remember Me" Logic)
  const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('trading_user');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  const [view, setView] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [tradeHistory, setTradeHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // 2. AUTO-SAVE TO LOCAL STORAGE
  // Whenever 'user' changes (Login, Update Strategy, or Logout), save it!
  useEffect(() => {
      if (user) {
          localStorage.setItem('trading_user', JSON.stringify(user));
      } else {
          localStorage.removeItem('trading_user');
      }
  }, [user]);

  // 3. FETCH DATA (Only if user exists)
  const fetchData = async () => {
    if (!user) return;
    try {
        const historyRes = await axios.get(`http://localhost:5000/api/trades/user/${user._id}`);
        setTradeHistory(historyRes.data);
        const metricsRes = await axios.get(`http://localhost:5000/api/trades/metrics/${user._id}`);
        setMetrics(metricsRes.data);
    } catch (err) { console.error(err); }
  };

  // Run fetch when user loads (including on refresh!)
  useEffect(() => { 
      if(user) fetchData(); 
  }, [user]);

  // LOGIN HANDLER
  const handleLogin = async (e) => {
      e.preventDefault();
      try {
          const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
          setUser(res.data); // This triggers the useEffect above to save to localStorage
      } catch (err) {
          alert("Login Failed: " + (err.response?.data?.message || err.message));
      }
  };

  // REGISTER HANDLER
  const handleRegister = async () => {
      try {
          const res = await axios.post('http://localhost:5000/api/users/register', { email, password, username: "Trader" });
          alert("Registered! Now Login.");
      } catch (err) { alert(err.message); }
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
      if(window.confirm("Are you sure you want to logout?")) {
          setUser(null); // This triggers useEffect to remove from localStorage
          setView('dashboard');
          setTradeHistory([]);
          setMetrics(null);
      }
  };

  // --- IF NOT LOGGED IN, SHOW LOGIN PAGE ---
  if (!user) {
      return (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f4f5f7' }}>
              <div className="card" style={{ width: '300px', textAlign: 'center' }}>
                  <h2>🔐 Trader Login</h2>
                  <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%', marginBottom:'10px'}}/>
                  <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', marginBottom:'20px'}}/>
                  <button onClick={handleLogin} className="btn-primary" style={{width:'100%', marginBottom:'10px'}}>Login</button>
                  <button onClick={handleRegister} style={{background:'none', border:'none', color:'blue', cursor:'pointer'}}>No account? Register</button>
              </div>
          </div>
      );
  }

  // --- LOGGED IN APP ---
  return (
    <div className="dashboard-container">
      <header className="header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
            <h1 style={{margin:0}}>Welcome, {user.username}</h1>
            <p style={{margin:0}}>Strategy: <strong>{user.tradingStrategy?.name || "Default"}</strong></p>
        </div>
        <div>
            <button onClick={() => setView('dashboard')} style={{ marginRight:'10px', padding:'8px', cursor:'pointer' }}>Dashboard</button>
            <button onClick={() => setView('settings')} style={{ marginRight:'10px', padding:'8px', cursor:'pointer' }}>Strategy Settings</button>
            <button onClick={handleLogout} style={{ padding:'8px', background:'#ffebe6', color:'red', border:'1px solid red', cursor:'pointer' }}>Logout</button>
        </div>
      </header>

      {/* VIEW SWITCHER */}
      {view === 'settings' ? (
          <StrategySettings user={user} onUpdateUser={setUser} />
      ) : (
          <>
            <BehaviouralFeedbackPanel data={metrics} />
            <div className="form-container">
                {/* ⚠️ PASS USER SO WIZARD DOESN'T CRASH */}
                <TradeExecutionWizard 
                    userId={user._id} 
                    onTradeSuccess={fetchData} 
                    currentHistory={tradeHistory}
                    user={user} 
                />
            </div>
            
            {/* TABLE */}
            <div className="table-container">
                <table className="trade-table">
                  <thead><tr><th>Date</th><th>Asset</th><th>Result</th><th>PnL</th><th>Plan</th></tr></thead>
                  <tbody>
                    {tradeHistory.map(t => (
                      <tr key={t._id}>
                        <td>{new Date(t.entryTime).toLocaleDateString()}</td>
                        <td>{t.instrument}</td>
                        <td><span className={`badge ${t.result==='win'?'badge-win':'badge-loss'}`}>{t.result}</span></td>
                        <td>{t.pnl}</td>
                        <td>{t.followedPlan ? '✅' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </>
      )}
    </div>
  );
}

export default App;