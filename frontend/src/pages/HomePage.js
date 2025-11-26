import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await fetch(API_BASE + '/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('kycshield_token', data.access_token);
          setIsReady(true);
        }
      } catch (err) {
        console.error('Auto-login failed:', err);
        setIsReady(true);
      }
    };
    autoLogin();
  }, []);

  const handleTryDemo = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#010a13',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      
      {/* Header/Nav */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '28px 100px',
        maxWidth: '1600px',
        margin: '0 auto',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img 
            src="/assets/KYCLogo.png" 
            alt="KYCShield Logo"
            style={{
              height: '44px',
              width: 'auto'
            }}
            />
          <span style={{
            fontSize: '36px',
            fontWeight: '600',
            color: 'white',
            letterSpacing: '-0.5px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>KYCShield</span>
        </div>
        
        <nav style={{display: 'flex', gap: '48px', alignItems: 'center'}}>
          <a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500', transition: 'color 0.2s'}}
             onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
             onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}>Home</a>
          <a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500', transition: 'color 0.2s'}}
             onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
             onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}>About</a>
          <a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500', transition: 'color 0.2s'}}
             onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
             onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}>Use Cases</a>
          <a href="#" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500', transition: 'color 0.2s'}}
             onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
             onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}>Contact</a>
          <button
            onClick={handleTryDemo}
            disabled={!isReady}
            style={{
              padding: '14px 32px',
              background: isReady ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#475569',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '17px',
              fontWeight: '600',
              cursor: isReady ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => isReady && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.4)')}
            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)')}
          >
            {isReady ? 'Demo' : 'Loading...'}
          </button>
        </nav>
      </header>

      {/* Hero Section - Full Screen */}
      <section style={{
        minHeight: '100vh',
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '0 100px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '60px',
        alignItems: 'center',
        position: 'relative'
      }}>
        
        {/* AI Watermark Background */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          fontSize: '220px',
          fontWeight: '900',
          color: 'rgba(59, 130, 246, 0.06)',
          letterSpacing: '-10px',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 0,
          fontFamily: 'Inter, sans-serif'
        }}>AI</div>
        
        {/* KYC Shield Watermark Background */}
        <div style={{
          position: 'absolute',
          bottom: '18%',
          right: '8%',
          fontSize: '140px',
          fontWeight: '900',
          color: 'rgba(59, 130, 246, 0.05)',
          letterSpacing: '-5px',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 0,
          fontFamily: 'Inter, sans-serif',
          whiteSpace: 'nowrap'
        }}>KYC Shield</div>
        
        {/* Left Column - Copy */}
        <div style={{paddingTop: '60px'}}>
          <h1 style={{
            fontSize: '82px',
            fontWeight: '800',
            lineHeight: '1.05',
            margin: '0 0 36px 0',
            letterSpacing: '-3px'
          }}>
            <span style={{color: 'white'}}>Protecting the</span><br/>
            <span style={{color: 'white'}}>World Against</span><br/>
            <span style={{
              background: 'linear-gradient(135deg, #c084fc, #a855f7, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Synthetic Identity</span><br/>
            <span style={{
              background: 'linear-gradient(135deg, #c084fc, #a855f7, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Fraud</span>
          </h1>

          <p style={{
            fontSize: '22px',
            lineHeight: '1.7',
            color: '#94a3b8',
            margin: '0 0 48px 0',
            maxWidth: '580px',
            fontWeight: '400'
          }}>
            We lead the fight against ProKYC attacks by ensuring security in an era of deepfakes and synthetic identities.
          </p>

          <button
            onClick={handleTryDemo}
            disabled={!isReady}
            style={{
              padding: '18px 48px',
              background: 'transparent',
              border: '2px solid #60a5fa',
              borderRadius: '10px',
              color: '#60a5fa',
              fontSize: '20px',
              fontWeight: '600',
              cursor: isReady ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px'
            }}
            onMouseEnter={(e) => isReady && (e.target.style.background = 'rgba(96, 165, 250, 0.15)', e.target.style.borderColor = '#93c5fd')}
            onMouseLeave={(e) => (e.target.style.background = 'transparent', e.target.style.borderColor = '#60a5fa')}
          >
            Try Now <span style={{fontSize: '22px'}}>→</span>
          </button>
        </div>

        {/* Right Column - Shield Animation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          paddingTop: '60px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '850px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            
            transition: 'transform 0.3s ease'
          }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)'
              }}
            >
              <source src="/assets/shield-animation.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

        </div>
      </section>

      {/* What is KYCShield Section */}
      <section style={{
        background: 'linear-gradient(180deg, #010a13 0%, #0a1628 50%, #010a13 100%)',
        padding: '0px 100px',
        marginTop: '-100px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '64px',
          fontWeight: '700',
          margin: '0 0 100px 0',
          letterSpacing: '-2px'
        }}>
          <span style={{color: '#60a5fa'}}>What is</span>
          <span style={{color: 'white'}}> KYCShield?</span>
        </h2>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '48px',
          maxWidth: '1100px',
          margin: '0 auto 100px auto'
        }}>
          <div>
            <div style={{
              fontSize: '56px',
              fontWeight: '800',
              color: '#ef4444',
              marginBottom: '12px',
              letterSpacing: '-2px'
            }}>$4.6B+</div>
            <div style={{
              fontSize: '15px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '600'
            }}>Lost to Fraud Annually</div>
          </div>

          <div>
            <div style={{
              fontSize: '56px',
              fontWeight: '800',
              color: '#60a5fa',
              marginBottom: '12px',
              letterSpacing: '-2px'
            }}>99.9%</div>
            <div style={{
              fontSize: '15px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '600'
            }}>Detection Accuracy</div>
          </div>

          <div>
            <div style={{
              fontSize: '56px',
              fontWeight: '800',
              color: '#a78bfa',
              marginBottom: '12px',
              letterSpacing: '-2px'
            }}>&lt;1s</div>
            <div style={{
              fontSize: '15px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '600'
            }}>Real-time Detection</div>
          </div>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '36px',
          maxWidth: '1300px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '20px',
            padding: '48px 36px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{fontSize: '56px', marginBottom: '20px'}}>📹</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#a78bfa',
              margin: '0 0 16px 0'
            }}>Deepfake Detection</h3>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.7',
              margin: 0
            }}>Catch AI-generated videos with 99.90% accuracy</p>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '20px',
            padding: '48px 36px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{fontSize: '56px', marginBottom: '20px'}}>📄</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#a78bfa',
              margin: '0 0 16px 0'
            }}>Document Fraud</h3>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.7',
              margin: 0
            }}>Detect synthetic and tampered documents instantly</p>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '20px',
            padding: '48px 36px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{fontSize: '56px', marginBottom: '20px'}}>👤</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#a78bfa',
              margin: '0 0 16px 0'
            }}>Face Matching</h3>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.7',
              margin: 0
            }}>Verify identity with advanced biometric analysis</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '48px',
        color: '#64748b',
        fontSize: '15px',
        fontWeight: '500',
        background: '#010a13'
      }}>
        © 2025 KYCShield by Facti.ai
      </footer>
    </div>
  );
}

export default HomePage;
