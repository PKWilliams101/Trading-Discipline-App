import React, { useState } from 'react';
import axios from 'axios';
import { Brain, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin 
      ? 'http://localhost:5000/api/users/login' 
      : 'http://localhost:5000/api/users/register';

    try {
      const res = await axios.post(endpoint, formData);
      onLoginSuccess(res.data);
    } catch (err) {
      console.error("Connection Error:", err);
      setError(err.response?.data?.message || 'Connection failed. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ background: '#FFF', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Brain color="#3B82F6" size={32} />
          <h1 style={{ fontSize: '20px', fontWeight: '900' }}>COGNITIVE FIREWALL</h1>
        </div>

        <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>{isLogin ? 'Sign In' : 'Register'}</h2>
        
        {error && <div style={{ color: '#B91C1C', background: '#FEF2F2', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input 
              type="text" placeholder="Username" required 
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} 
              style={inputStyle} 
            />
          )}
          <input 
            type="email" placeholder="Email" required 
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
            style={inputStyle} 
          />
          <input 
            type="password" placeholder="Password" required 
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
            style={inputStyle} 
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }} 
          style={{ background: 'none', border: 'none', color: '#10B981', marginTop: '20px', cursor: 'pointer', fontWeight: '600' }}
        >
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { background: '#10B981', color: '#FFF', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };