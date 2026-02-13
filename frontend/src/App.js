import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 
import { Brain, LayoutDashboard, BookOpen, Settings, LogOut, Zap } from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import BehaviouralFeedbackPanel from './components/BehaviouralFeedbackPanel';
import TradeExecutionWizard from './components/TradeExecutionWizard';
import StrategySettings from './components/StrategySettings';
import { ReflectiveJournal } from './components/ReflectiveJournal';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTradeHistory(parsedUser._id);
    }
  }, []);

  const fetchTradeHistory = async (userId) => {
    if (!userId) return;
    try {
      const [tradesRes, metricsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/trades/user/${userId}`),
        axios.get(`http://localhost:5000/api/trades/metrics/${userId}`)
      ]);
      setTradeHistory(tradesRes.data || []); 
      setMetrics(metricsRes.data || {});
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    fetchTradeHistory(userData._id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setTradeHistory([]);
    setMetrics(null);
  };

  if (!user) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="app-container" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <header style={{ background: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0F172A', padding: '8px', borderRadius: '10px' }}>
            <Brain size={22} color="#3B82F6" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>COGNITIVE</span>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', letterSpacing: '2px' }}>FIREWALL</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowWizard(true)} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} fill="white" /> EXECUTE TRADE
          </button>
          <button onClick={handleLogout} style={{ background: '#FFF', color: '#64748B', border: '1px solid #E2E8F0', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div style={{ padding: '30px 32px 0 32px' }}>
        <nav style={{ display: 'flex', gap: '10px', background: '#F1F5F9', padding: '5px', borderRadius: '12px', width: 'fit-content' }}>
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={16}/>} label="Dashboard" />
          <NavButton active={view === 'strategy'} onClick={() => setView('strategy')} icon={<Settings size={16}/>} label="Strategy" />
          <NavButton active={view === 'journal'} onClick={() => setView('journal')} icon={<BookOpen size={16}/>} label="Journal" />
        </nav>
      </div>

      <main style={{ padding: '32px' }}>
        {view === 'dashboard' && <BehaviouralFeedbackPanel user={user} data={metrics} trades={tradeHistory} />}
        {view === 'strategy' && <StrategySettings user={user} onUpdate={setUser} />}
        {view === 'journal' && <ReflectiveJournal trades={tradeHistory} userId={user._id} onTradeLogged={() => fetchTradeHistory(user._id)} />}
      </main>

      {showWizard && (
        <div className="wizard-overlay">
          <TradeExecutionWizard userId={user._id} user={user} onClose={() => setShowWizard(false)} onTradeSuccess={() => fetchTradeHistory(user._id)} />
        </div>
      )}
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: active ? '#FFF' : 'transparent', color: active ? '#0F172A' : '#64748B', fontWeight: active ? '700' : '600', boxShadow: active ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>
    {icon} {label}
  </button>
);

export default App;