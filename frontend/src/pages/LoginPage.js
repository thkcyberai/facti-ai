import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = 'https://api.kycshield.ai';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0f1e 0%, #1a1f3a 50%, #0a0f1e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{width: '100%', maxWidth: '480px'}}>
        
        {/* Logo & Branding */}
        <div style={{textAlign: 'center', marginBottom: '48px'}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
            }}>K</div>
          </div>
          <h1 style={{
            margin: '0 0 12px 0',
            fontSize: '36px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>KYCShield</h1>
          <p style={{
            margin: 0,
            color: '#94a3b8',
            fontSize: '16px',
            fontWeight: '500'
          }}>AI-Powered Identity Verification</p>
        </div>

        {/* Warning Banner */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#fca5a5',
            fontSize: '15px',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong style={{color: '#ef4444'}}>$4.6B+</strong> lost to synthetic identity fraud annually.
            <br/>
            Tools like <strong style={{color: '#ef4444'}}>ProKYC</strong> bypass traditional KYC in seconds.
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            color: 'white',
            margin: '0 0 32px 0',
            fontSize: '24px',
            fontWeight: '600',
            letterSpacing: '-0.3px'
          }}>Sign in to your account</h2>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              color: '#fca5a5',
              fontSize: '14px',
              fontWeight: '500'
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom: '24px'}}>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.3px'
              }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
              />
            </div>

            <div style={{marginBottom: '32px'}}>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.3px'
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading ? '#475569' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isLoading ? 'none' : '0 8px 24px rgba(59, 130, 246, 0.3)',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)')}
              onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)')}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <button
              onClick={handleDemoLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#93c5fd'}
              onMouseLeave={(e) => e.target.style.color = '#60a5fa'}
            >
              Use Demo Credentials →
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '40px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px 16px',
            textAlign: 'center',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <p style={{
              color: '#60a5fa',
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>99.9%</p>
            <p style={{
              color: '#94a3b8',
              fontSize: '13px',
              margin: '6px 0 0 0',
              fontWeight: '500'
            }}>Detection Rate</p>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px 16px',
            textAlign: 'center',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <p style={{
              color: '#a78bfa',
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>&lt;1s</p>
            <p style={{
              color: '#94a3b8',
              fontSize: '13px',
              margin: '6px 0 0 0',
              fontWeight: '500'
            }}>Response Time</p>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px 16px',
            textAlign: 'center',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <p style={{
              color: '#34d399',
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>5+</p>
            <p style={{
              color: '#94a3b8',
              fontSize: '13px',
              margin: '6px 0 0 0',
              fontWeight: '500'
            }}>Attack Types</p>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: '13px',
          marginTop: '40px',
          fontWeight: '500'
        }}>
          © 2025 KYCShield by Trusi.ai · Protecting against synthetic identity fraud
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
