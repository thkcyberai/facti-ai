import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [isReady, setIsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const API_BASE = 'https://api.kycshield.ai';

  // Responsive hook
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

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
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflowX: 'hidden'
    }}>

      {/* Header/Nav */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '16px 20px' : isTablet ? '20px 40px' : '28px 100px',
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
              height: isMobile ? '40px' : '44px',
              width: 'auto'
            }}
          />
          <span style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '600',
            color: 'white',
            letterSpacing: '-0.5px'
          }}>KYCShield</span>
        </div>

        {/* Demo Button + Hamburger Menu */}
        {(isMobile || isTablet) && (
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <button
              onClick={handleTryDemo}
              disabled={!isReady}
              style={{
                padding: '10px 24px',
                background: isReady ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#475569',
                border: 'none',
                borderRadius: '30px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isReady ? 'pointer' : 'not-allowed'
              }}
            >
              Demo
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}
            >
              <span style={{width: '28px', height: '3px', background: 'white', borderRadius: '2px'}}></span>
              <span style={{width: '28px', height: '3px', background: 'white', borderRadius: '2px'}}></span>
              <span style={{width: '28px', height: '3px', background: 'white', borderRadius: '2px'}}></span>
            </button>
          </div>
        )}

        {/* Desktop Nav */}
        {!isMobile && !isTablet && (
          <nav style={{display: 'flex', gap: '48px', alignItems: 'center'}}>
            <a href="/" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>Home</a>
            <a href="/about" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>About</a>
            <a href="/use-cases" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>Use Cases</a>
            <a href="/contact" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>Contact</a>
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
                cursor: isReady ? 'pointer' : 'not-allowed'
              }}
            >
              {isReady ? 'Demo' : 'Loading...'}
            </button>
          </nav>
        )}

        {/* Mobile/Tablet Menu Dropdown */}
        {(isMobile || isTablet) && menuOpen && (
          <nav style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            right: 0,
            background: '#0c1222',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <a href="/" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>Home</a>
            <a href="/about" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>About</a>
            <a href="/use-cases" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>Use Cases</a>
            <a href="/contact" style={{color: '#e2e8f0', textDecoration: 'none', fontSize: '17px', fontWeight: '500'}}>Contact</a>
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
                width: 'fit-content'
              }}
            >
              {isReady ? 'Demo' : 'Loading...'}
            </button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        maxWidth: '1600px',
        margin: '0 auto',
        padding: isMobile ? '80px 20px 30px' : isTablet ? '100px 40px 50px' : '0 100px',
        display: 'grid',
        gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1.2fr',
        gap: isMobile ? '0px' : '60px',
        alignItems: 'center',
        position: 'relative'
      }}>

        {/* AI Watermark Background */}
        {!isMobile && (
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '5%',
            fontSize: isTablet ? '150px' : '220px',
            fontWeight: '900',
            color: 'rgba(59, 130, 246, 0.06)',
            letterSpacing: '-10px',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0
          }}>AI</div>
        )}

        {/* KYC Shield Watermark Background */}
        {!isMobile && (
          <div style={{
            position: 'absolute',
            bottom: '18%',
            right: '8%',
            fontSize: isTablet ? '80px' : '140px',
            fontWeight: '900',
            color: 'rgba(59, 130, 246, 0.05)',
            letterSpacing: '-5px',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0
          }}>KYC Shield</div>
        )}

        {/* Left Column - Text */}
        <div style={{
          paddingTop: isMobile ? '0' : '20px',
          textAlign: isMobile ? 'center' : 'left',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{
            fontSize: isMobile ? '42px' : isTablet ? '56px' : '82px',
            fontWeight: '800',
            lineHeight: '1.0',
            margin: isMobile ? '0 0 16px 0' : '0 0 28px 0',
            letterSpacing: isMobile ? '-1px' : '-3px'
          }}>
            <span style={{color: 'white'}}>Protecting the</span><br />
            <span style={{color: 'white'}}>World Against</span><br />
            <span style={{
              background: 'linear-gradient(135deg, #c084fc, #a855f7, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Synthetic Identity</span><br />
            <span style={{
              background: 'linear-gradient(135deg, #c084fc, #a855f7, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Fraud</span>
          </h1>

          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            color: '#94a3b8',
            lineHeight: '1.7',
            marginBottom: '40px',
            maxWidth: '500px',
            margin: isMobile ? '0 auto 20px' : '0 0 40px 0'
          }}>
            We lead the fight against ProKYC attacks by ensuring security in an era of deepfakes and synthetic identities.
          </p>

          <button
            onClick={handleTryDemo}
            disabled={!isReady}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '18px 36px',
              background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '17px',
              fontWeight: '500',
              cursor: isReady ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            Try Demo <span>→</span>
          </button>
        </div>

        {/* Right Column - Video */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          marginTop: isMobile ? '-20px' : isTablet ? '-40px' : '-220px',
          order: 0
        }}>
          <div style={{
            width: '100%',
            maxWidth: isMobile ? '380px' : isTablet ? '500px' : '850px',
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
            </video>
          </div>
        </div>
      </section>

      {/* What is KYCShield Section */}
      <section style={{
        padding: isMobile ? '30px 20px' : isTablet ? '40px' : '0px 100px',
        maxWidth: '1400px',
        margin: '0 auto',
        marginTop: isMobile ? '0' : '-100px'
      }}>
        <h2 style={{
          fontSize: isMobile ? '28px' : isTablet ? '36px' : '42px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <span style={{color: '#60a5fa'}}>What is </span>
          <span style={{color: 'white'}}>KYCShield?</span>
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: isMobile ? '16px' : '18px',
          maxWidth: '800px',
          margin: '0 auto 48px',
          lineHeight: '1.7'
        }}>
          Facti.ai is an innovative technology company that focuses on delivering state-of-the-art solutions to detect and prevent deepfake media in KYC (Know Your Customer), AML (Anti-Money Laundering), and fraud prevention processes.
        </p>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '24px' : '48px',
          marginBottom: '64px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{fontSize: isMobile ? '36px' : '48px', fontWeight: '800', color: '#ef4444'}}>$4.6B+</div>
            <div style={{color: '#64748b', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginTop: '8px'}}>LOST TO FRAUD ANNUALLY</div>
          </div>
          <div>
            <div style={{fontSize: isMobile ? '36px' : '48px', fontWeight: '800', color: '#60a5fa'}}>99.9%</div>
            <div style={{color: '#64748b', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginTop: '8px'}}>DETECTION ACCURACY</div>
          </div>
          <div>
            <div style={{fontSize: isMobile ? '36px' : '48px', fontWeight: '800', color: '#94a3b8'}}>&lt;1s</div>
            <div style={{color: '#64748b', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', marginTop: '8px'}}>REAL-TIME DETECTION</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? '20px' : '32px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: isMobile ? '24px' : '36px',
            textAlign: 'center'
          }}>
            <div style={{marginBottom: '16px'}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="14" height="12" rx="2" />
                <path d="M16 10l4-2v8l-4-2v-4z" />
                <circle cx="9" cy="12" r="2" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#a78bfa',
              margin: '0 0 16px 0'
            }}>Deepfake Detection</h3>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.6',
              margin: 0
            }}>Catch AI-generated videos with 99.90% accuracy</p>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: isMobile ? '24px' : '36px',
            textAlign: 'center'
          }}>
            <div style={{marginBottom: '16px'}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#a78bfa',
              margin: '0 0 16px 0'
            }}>Document Fraud</h3>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.6',
              margin: 0
            }}>Detect synthetic and tampered documents instantly</p>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: isMobile ? '24px' : '36px',
            textAlign: 'center',
            gridColumn: isTablet ? 'span 2' : 'auto',
            maxWidth: isTablet ? '50%' : '100%',
            margin: isTablet ? '0 auto' : '0'
          }}>
            <div style={{marginBottom: '16px'}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#a78bfa',
              margin: '0 0 16px 0'
            }}>Face Matching</h3>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.6',
              margin: 0
            }}>Verify identity with advanced biometric analysis</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '48px 20px',
        color: '#64748b',
        fontSize: '15px',
        fontWeight: '500'
      }}>
        © 2025 KYCShield by Facti.ai
      </footer>
    </div>
  );
}

export default HomePage;
