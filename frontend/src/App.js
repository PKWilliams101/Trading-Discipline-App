import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 
import { Brain, LayoutDashboard, BookOpen, Settings, LogOut, Zap, HelpCircle } from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import BehaviouralFeedbackPanel from './components/BehaviouralFeedbackPanel';
import TradeExecutionWizard from './components/TradeExecutionWizard';
import StrategySettings from './components/StrategySettings';
import { ReflectiveJournal } from './components/ReflectiveJournal';
import Guidebook from './components/Guidebook';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
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
    if (userData.isNewUser) setShowGuide(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setTradeHistory([]);
    setMetrics(null);
  };

  if (!user) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="app-container">
      
      {/* HEADER (Now using pure App.css classes) */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Brain size={20} />
          </div>
          <div style={{ lineHeight: '1.2' }}>
            <span style={{ display: 'block', fontSize: '16px', fontWeight: '900' }}>COGNITIVE</span>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--primary)', letterSpacing: '2px' }}>FIREWALL</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowGuide(true)} className="btn btn-outline">
            <HelpCircle size={16} /> Manual
          </button>

          <button onClick={() => setShowWizard(true)} className="btn btn-primary">
            <Zap size={16} fill="white" /> EXECUTE TRADE
          </button>
          
          <button onClick={handleLogout} className="btn btn-outline">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* NAVIGATION PILLS */}
      <div>
        <nav className="nav-pills">
          <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }}/> Dashboard
          </button>
          <button className={`nav-item ${view === 'strategy' ? 'active' : ''}`} onClick={() => setView('strategy')}>
            <Settings size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }}/> Strategy
          </button>
          <button className={`nav-item ${view === 'journal' ? 'active' : ''}`} onClick={() => setView('journal')}>
            <BookOpen size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }}/> Journal
          </button>
        </nav>
      </div>

      <main className="app-content">
        {view === 'dashboard' && <BehaviouralFeedbackPanel user={user} data={metrics} trades={tradeHistory} />}
        {view === 'strategy' && <StrategySettings user={user} onUpdate={setUser} />}
        {view === 'journal' && <ReflectiveJournal trades={tradeHistory} userId={user._id} onTradeLogged={() => fetchTradeHistory(user._id)} />}
      </main>

      {/* MODALS */}
      {showWizard && (
        <div className="wizard-overlay">
          <TradeExecutionWizard userId={user._id} user={user} onClose={() => setShowWizard(false)} onTradeSuccess={() => fetchTradeHistory(user._id)} />
        </div>
      )}

      {showGuide && <Guidebook onClose={() => setShowGuide(false)} />}
    </div>
  );
}

export default App;