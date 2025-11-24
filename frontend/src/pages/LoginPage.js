import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:8000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(API_BASE + '/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      localStorage.setItem('kycshield_token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('test@test.com');
    setPassword('test123');
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif'}}>
      <div style={{width: '100%', maxWidth: '450px', padding: '20px'}}>
        
        {/* Logo */}
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: '15px'}}>
            <div style={{width: '60px', height: '60px', borderRadius: '15px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'white'}}>K</div>
            <div style={{textAlign: 'left'}}>
              <h1 style={{margin: 0, fontSize: '32px', background: 'linear-gradient(to right, #22d3ee, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>KYCShield</h1>
              <p style={{margin: 0, color: '#666', fontSize: '14px'}}>AI-Powered Fraud Detection</p>
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '15px', padding: '20px', marginBottom: '30px', textAlign: 'center'}}>
          <p style={{color: '#f87171', margin: 0, fontSize: '14px'}}>
            <strong>$4.6B+</strong> lost to synthetic identity fraud annually.<br/>
            Tools like <strong>ProKYC</strong> bypass traditional KYC in seconds.
          </p>
        </div>

        {/* Login Card */}
        <div style={{background: 'rgba(30,30,50,0.7)', border: '1px solid #333', borderRadius: '20px', padding: '40px'}}>
          <h2 style={{color: 'white', margin: '0 0 30px 0', textAlign: 'center', fontSize: '24px'}}>Sign In</h2>
          
          {error && (
            <div style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '10px', padding: '12px', marginBottom: '20px', textAlign: 'center', color: '#f87171'}}>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', color: '#888', marginBottom: '8px', fontSize: '14px'}}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '10px', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box'}}
              />
            </div>

            <div style={{marginBottom: '30px'}}>
              <label style={{display: 'block', color: '#888', marginBottom: '8px', fontSize: '14px'}}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '10px', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box'}}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{width: '100%', padding: '16px', background: 'linear-gradient(to right, #06b6d4, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <button
              onClick={handleDemoLogin}
              style={{background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'}}
            >
              Use Demo Credentials
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '30px', textAlign: 'center'}}>
          <div style={{background: 'rgba(30,30,50,0.5)', borderRadius: '12px', padding: '15px'}}>
            <p style={{color: '#22d3ee', fontSize: '24px', fontWeight: 'bold', margin: 0}}>99.9%</p>
            <p style={{color: '#666', fontSize: '12px', margin: '5px 0 0 0'}}>Detection Rate</p>
          </div>
          <div style={{background: 'rgba(30,30,50,0.5)', borderRadius: '12px', padding: '15px'}}>
            <p style={{color: '#a855f7', fontSize: '24px', fontWeight: 'bold', margin: 0}}>&lt;1s</p>
            <p style={{color: '#666', fontSize: '12px', margin: '5px 0 0 0'}}>Response Time</p>
          </div>
          <div style={{background: 'rgba(30,30,50,0.5)', borderRadius: '12px', padding: '15px'}}>
            <p style={{color: '#4ade80', fontSize: '24px', fontWeight: 'bold', margin: 0}}>5+</p>
            <p style={{color: '#666', fontSize: '12px', margin: '5px 0 0 0'}}>Attack Types</p>
          </div>
        </div>

        {/* Footer */}
        <p style={{textAlign: 'center', color: '#444', fontSize: '12px', marginTop: '30px'}}>
          © 2025 KYCShield by Trusi.ai
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
