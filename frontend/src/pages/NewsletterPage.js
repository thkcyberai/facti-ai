import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.kycshield.ai/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter_page' })
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.detail || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #010a13 0%, #0c1222 50%, #010a13 100%)',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Header */}
      <header style={{
        padding: isMobile ? '20px' : '28px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <img
          src="/assets/KYCShield_logo_final.png"
          alt="KYCShield.ai"
          onClick={() => navigate('/')}
          style={{
            height: isMobile ? '40px' : '50px',
            cursor: 'pointer'
          }}
        />
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: isMobile ? '20px 20px' : '40px 60px',
        textAlign: 'center'
      }}>

        {!submitted ? (
          <>
            {/* Headline */}
            <h1 style={{
              fontSize: isMobile ? '32px' : isTablet ? '42px' : '52px',
              fontWeight: '800',
              lineHeight: '1.1',
              margin: '0 0 20px 0',
              letterSpacing: '-1px',
              maxWidth: '700px'
            }}>
              Get{' '}
              <span style={{
                background: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Early Access</span>
            </h1>

            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: '#94a3b8',
              lineHeight: '1.7',
              maxWidth: '500px',
              margin: '0 0 40px 0'
            }}>
              Join our newsletter for exclusive launch updates, beta access opportunities, and insights on fighting synthetic identity fraud.
            </p>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '16px' : '32px',
              marginBottom: '48px',
              width: '100%',
              maxWidth: '600px'
            }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '800', color: '#a78bfa' }}>99.9%</div>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', marginTop: '4px' }}>DEEPFAKE DETECTION</div>
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '800', color: '#a78bfa' }}>100%</div>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', marginTop: '4px' }}>DOCUMENT FRAUD</div>
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '800', color: '#a78bfa' }}>96.9%</div>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', marginTop: '4px' }}>FACE MATCHING</div>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              width: '100%',
              maxWidth: '480px',
              marginBottom: '16px'
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: '18px 24px',
                  fontSize: '16px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '18px 36px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '12px',
                  background: isSubmitting 
                    ? '#475569' 
                    : 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {error && (
              <p style={{
                color: '#fca5a5',
                fontSize: '14px',
                marginBottom: '16px'
              }}>{error}</p>
            )}

            <p style={{
              fontSize: '13px',
              color: '#64748b'
            }}>
              🔒 No spam. Unsubscribe anytime.
            </p>

            {/* Beta Tester CTA */}
            <div style={{
              marginTop: '48px',
              padding: '24px 32px',
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '16px',
              maxWidth: '520px'
            }}>
              <p style={{
                fontSize: '15px',
                color: '#c4b5fd',
                margin: 0,
                lineHeight: '1.7'
              }}>
                🧪 <strong>Want to be a Beta Tester?</strong><br />
                We're selecting 5 testers to stress-test our platform. Subscribe above and DM us on{' '}
                <a 
                  href="https://www.linkedin.com/company/kycshield" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#a78bfa', textDecoration: 'underline' }}
                >
                  LinkedIn
                </a>{' '}
                with your profile to apply.
              </p>
            </div>
          </>
        ) : (
          /* Success State */
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '20px',
            padding: '48px',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#4ade80',
              marginBottom: '16px'
            }}>You're on the list!</h2>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.7',
              marginBottom: '32px'
            }}>
              Thanks for subscribing. We'll notify you when KYCShield launches 
              and send you exclusive beta access opportunities.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ← Back to Home
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: '#64748b',
        fontSize: '13px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        © 2025 KYCShield by Facti.ai
      </footer>
    </div>
  );
}

export default NewsletterPage;
