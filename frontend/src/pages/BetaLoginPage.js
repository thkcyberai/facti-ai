import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BetaLoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [betaInfo, setBetaInfo] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  
  // Agreement Modal State
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [isSubmittingAgreements, setIsSubmittingAgreements] = useState(false);
  const [pendingAccessCode, setPendingAccessCode] = useState('');
  
  // Confirm Decline Modal State
  const [showConfirmDecline, setShowConfirmDecline] = useState(false);
  
  const navigate = useNavigate();

  const API_BASE = 'https://api.kycshield.ai';

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate device fingerprint on mount
  useEffect(() => {
    const generateFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('KYCShield', 2, 2);
      const canvasData = canvas.toDataURL();
      
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        navigator.platform,
        canvasData.slice(-50)
      ];
      
      // Simple hash function
      const str = components.join('|');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).padStart(16, '0').slice(0, 32);
    };
    
    setDeviceFingerprint(generateFingerprint());
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const formatAccessCode = (value) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length <= 4) {
      return clean;
    } else if (clean.length <= 8) {
      return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    } else {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
    }
  };

  const handleCodeChange = (e) => {
    const formatted = formatAccessCode(e.target.value);
    if (formatted.length <= 14) {
      setAccessCode(formatted);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let code = accessCode.trim().toUpperCase();
    if (!code.startsWith('BETA-')) {
      code = 'BETA-' + code;
    }

    try {
      const res = await fetch(API_BASE + '/api/v1/beta/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          access_code: code,
          device_fingerprint: deviceFingerprint
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Invalid access code');
      }

      // Store token temporarily
      localStorage.setItem('kycshield_token', data.access_token);
      localStorage.setItem('kycshield_beta', JSON.stringify(data.beta_info));
      localStorage.setItem('kycshield_access_code', code);
      localStorage.setItem('kycshield_device_fp', deviceFingerprint);
      
      // Check if agreements are required
      if (data.beta_info.requires_agreements) {
        setPendingAccessCode(code);
        setShowAgreementModal(true);
      } else {
        // Agreements already accepted, go to dashboard
        setBetaInfo(data.beta_info);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }

    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAgreements = async () => {
    if (!termsAccepted || !privacyAccepted || !ndaAccepted) {
      setError('You must accept all three agreements to continue');
      return;
    }

    setIsSubmittingAgreements(true);
    setError('');

    try {
      const res = await fetch(API_BASE + '/api/v1/beta/accept-agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: pendingAccessCode,
          terms_accepted: true,
          privacy_accepted: true,
          nda_accepted: true
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to accept agreements');
      }

      // Success - update beta info and redirect
      const storedBetaInfo = JSON.parse(localStorage.getItem('kycshield_beta') || '{}');
      storedBetaInfo.agreements_accepted = true;
      storedBetaInfo.requires_agreements = false;
      localStorage.setItem('kycshield_beta', JSON.stringify(storedBetaInfo));

      setBetaInfo(storedBetaInfo);
      setShowAgreementModal(false);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to accept agreements');
    } finally {
      setIsSubmittingAgreements(false);
    }
  };

  const handleDeclineClick = () => {
    setShowConfirmDecline(true);
  };

  const handleConfirmDecline = async () => {
    setIsSubmittingAgreements(true);
    setError('');

    try {
      const res = await fetch(API_BASE + '/api/v1/beta/decline-agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: pendingAccessCode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to process decline');
      }

      // Clear stored data
      localStorage.removeItem('kycshield_token');
      localStorage.removeItem('kycshield_beta');
      localStorage.removeItem('kycshield_access_code');
      localStorage.removeItem('kycshield_device_fp');

      // Close modals and redirect
      setShowConfirmDecline(false);
      setShowAgreementModal(false);
      navigate('/');

    } catch (err) {
      setError(err.message || 'Failed to process decline');
    } finally {
      setIsSubmittingAgreements(false);
    }
  };

  // Confirm Decline Modal Component
  const ConfirmDeclineModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '20px',
        padding: isMobile ? '28px' : '40px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(239, 68, 68, 0.15)'
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px'
        }}>⚠️</div>

        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#f87171',
          margin: '0 0 16px 0'
        }}>Withdraw from Beta Program?</h3>

        <p style={{
          color: '#94a3b8',
          fontSize: '15px',
          lineHeight: '1.7',
          margin: '0 0 24px 0'
        }}>
          This action <strong style={{ color: '#f87171' }}>cannot be undone</strong>. Your access code will be permanently deactivated and you will lose access to the KYCShield Beta Program.
        </p>

        {/* Consequences Box */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px',
          textAlign: 'left'
        }}>
          <div style={{ color: '#fca5a5', fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>◆ Your access code will be deactivated</div>
            <div style={{ marginBottom: '8px' }}>◆ You cannot rejoin with the same code</div>
            <div>◆ All session data will be cleared</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowConfirmDecline(false)}
            disabled={isSubmittingAgreements}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: '15px',
              fontWeight: '600',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '12px',
              background: 'transparent',
              color: '#94a3b8',
              cursor: isSubmittingAgreements ? 'not-allowed' : 'pointer',
              opacity: isSubmittingAgreements ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDecline}
            disabled={isSubmittingAgreements}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: '15px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              background: isSubmittingAgreements 
                ? '#475569' 
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              cursor: isSubmittingAgreements ? 'not-allowed' : 'pointer',
              boxShadow: isSubmittingAgreements 
                ? 'none' 
                : '0 8px 32px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmittingAgreements ? 'Processing...' : 'Yes, Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );

  // Agreement Modal Component
  const AgreementModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #0c1222 0%, #1e293b 100%)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: '24px',
        padding: isMobile ? '24px' : '40px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* KYCShield styled icon */}
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h2 style={{
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 12px 0'
          }}>Legal Agreements Required</h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '15px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Please review and accept the following agreements to access the KYCShield Beta Program.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '24px',
            color: '#fca5a5',
            fontSize: '14px'
          }}>{error}</div>
        )}

        {/* Agreement Checkboxes */}
        <div style={{ marginBottom: '32px' }}>
          {/* Terms of Service */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '16px',
            background: termsAccepted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.5)',
            border: termsAccepted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '12px',
            marginBottom: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{
                width: '22px',
                height: '22px',
                marginTop: '2px',
                accentColor: '#7c3aed',
                cursor: 'pointer'
              }}
            />
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                Terms of Service
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                I have read and agree to the <a href="/legal/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Terms of Service</a> governing my use of the KYCShield platform.
              </div>
            </div>
          </label>

          {/* Privacy Policy */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '16px',
            background: privacyAccepted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.5)',
            border: privacyAccepted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '12px',
            marginBottom: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              style={{
                width: '22px',
                height: '22px',
                marginTop: '2px',
                accentColor: '#7c3aed',
                cursor: 'pointer'
              }}
            />
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                Privacy Policy
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                I have read and agree to the <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Privacy Policy</a> explaining how my data is collected and used.
              </div>
            </div>
          </label>

          {/* NDA */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '16px',
            background: ndaAccepted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.5)',
            border: ndaAccepted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={ndaAccepted}
              onChange={(e) => setNdaAccepted(e.target.checked)}
              style={{
                width: '22px',
                height: '22px',
                marginTop: '2px',
                accentColor: '#7c3aed',
                cursor: 'pointer'
              }}
            />
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                Beta NDA & Confidentiality Agreement
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                I have read and agree to the <a href="/legal/nda" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>NDA & Confidentiality Agreement</a> protecting KYCShield's proprietary technology.
              </div>
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div style={{
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ color: '#a78bfa', fontSize: '13px', lineHeight: '1.6' }}>
            <strong>Note:</strong> By accepting these agreements, you acknowledge that all information, features, accuracy rates, and technical details about KYCShield are confidential. The NDA remains in effect for 3 years.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px'
        }}>
          <button
            onClick={handleDeclineClick}
            disabled={isSubmittingAgreements}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: '15px',
              fontWeight: '600',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '12px',
              background: 'transparent',
              color: '#f87171',
              cursor: isSubmittingAgreements ? 'not-allowed' : 'pointer',
              opacity: isSubmittingAgreements ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            Decline & Withdraw
          </button>
          <button
            onClick={handleAcceptAgreements}
            disabled={!termsAccepted || !privacyAccepted || !ndaAccepted || isSubmittingAgreements}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: '15px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              background: (!termsAccepted || !privacyAccepted || !ndaAccepted || isSubmittingAgreements)
                ? '#475569'
                : 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              color: 'white',
              cursor: (!termsAccepted || !privacyAccepted || !ndaAccepted || isSubmittingAgreements)
                ? 'not-allowed'
                : 'pointer',
              boxShadow: (!termsAccepted || !privacyAccepted || !ndaAccepted || isSubmittingAgreements)
                ? 'none'
                : '0 8px 32px rgba(124, 58, 237, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmittingAgreements ? 'Processing...' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #010a13 0%, #0c1222 50%, #010a13 100%)',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Confirm Decline Modal */}
      {showConfirmDecline && <ConfirmDeclineModal />}

      {/* Agreement Modal */}
      {showAgreementModal && <AgreementModal />}

      {/* Header */}
      <header style={{
        padding: isMobile ? '24px' : '32px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <img
          src="/assets/KYCShield_logo_final.png"
          alt="KYCShield.ai"
          onClick={() => navigate('/')}
          style={{
            height: isMobile ? '60px' : isTablet ? '75px' : '90px',
            cursor: 'pointer'
          }}
        />
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500'
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

        {!betaInfo ? (
          <>
            {/* Badge - Larger */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(124, 58, 237, 0.3))',
              border: '1px solid rgba(167, 139, 250, 0.5)',
              borderRadius: '50px',
              padding: isMobile ? '14px 28px' : '16px 36px',
              marginBottom: '32px',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.2)'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                borderRadius: '50%',
                fontSize: '14px'
              }}>⚡</span>
              <span style={{
                color: '#e9d5ff',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                letterSpacing: '0.5px'
              }}>
                Early Access Beta Program
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: isMobile ? '36px' : isTablet ? '48px' : '56px',
              fontWeight: '800',
              lineHeight: '1.1',
              margin: '0 0 20px 0',
              letterSpacing: '-1px',
              maxWidth: '700px'
            }}>
              Welcome,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Beta Tester</span>
            </h1>

            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: '#94a3b8',
              lineHeight: '1.7',
              maxWidth: '500px',
              margin: '0 0 40px 0'
            }}>
              Enter your access code to begin testing our AI-powered identity verification platform.
            </p>

            {/* Access Code Form */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '20px',
              padding: isMobile ? '32px 24px' : '48px',
              width: '100%',
              maxWidth: '480px',
              marginBottom: '32px'
            }}>
              {error && !showAgreementModal && (
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
                <label style={{
                  display: 'block',
                  color: '#94a3b8',
                  marginBottom: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>ACCESS CODE</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={handleCodeChange}
                  placeholder="XXXX-XXXX"
                  required
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '2px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    letterSpacing: '3px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    marginBottom: '24px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(124, 58, 237, 0.3)'}
                />
                <p style={{
                  color: '#64748b',
                  fontSize: '13px',
                  marginBottom: '24px'
                }}>
                  You received this code via LinkedIn or email
                </p>

                <button
                  type="submit"
                  disabled={isLoading || accessCode.length < 9}
                  style={{
                    width: '100%',
                    padding: '18px',
                    fontSize: '16px',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '12px',
                    background: (isLoading || accessCode.length < 9) 
                      ? '#475569' 
                      : 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                    color: 'white',
                    cursor: (isLoading || accessCode.length < 9) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: (isLoading || accessCode.length < 9) 
                      ? 'none' 
                      : '0 8px 32px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  {isLoading ? 'Validating...' : 'Access Beta →'}
                </button>
              </form>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '16px',
              width: '100%',
              maxWidth: '700px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#a78bfa' }}>20</div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', marginTop: '6px' }}>DAYS ACCESS</div>
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#a78bfa' }}>∞</div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', marginTop: '6px' }}>UNLIMITED TESTS</div>
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#a78bfa' }}>4</div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', marginTop: '6px' }}>AI SERVICES</div>
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#a78bfa' }}>99.9%</div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', marginTop: '6px' }}>ACCURACY</div>
              </div>
            </div>

            {/* What you can test - Larger */}
            <div style={{
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '20px',
              padding: isMobile ? '28px 24px' : '36px 48px',
              width: '100%',
              maxWidth: '700px'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#a78bfa',
                margin: '0 0 20px 0'
              }}>What you can test:</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                textAlign: 'left'
              }}>
                {[
                  { icon: '▶', label: 'Video Deepfake Detection' },
                  { icon: '◈', label: 'Document Fraud Detection' },
                  { icon: '◉', label: 'Face Matching' },
                  { icon: '◆', label: 'Unified KYC Verification' }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(124, 58, 237, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <span style={{
                      color: '#a78bfa',
                      fontSize: '14px'
                    }}>{item.icon}</span>
                    <span style={{
                      color: '#e9d5ff',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}>{item.label}</span>
                  </div>
                ))}
              </div>
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
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✓</div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#4ade80',
              marginBottom: '16px'
            }}>Access Granted!</h2>
            <p style={{
              fontSize: '17px',
              color: '#94a3b8',
              lineHeight: '1.7',
              marginBottom: '16px'
            }}>
              Your beta access expires in <strong style={{ color: '#a78bfa' }}>{betaInfo.days_remaining} days</strong>
            </p>
            <p style={{
              fontSize: '14px',
              color: '#64748b'
            }}>
              Redirecting to dashboard...
            </p>
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
        © 2025 KYCShield by Facti.ai · Early Access Beta Program
      </footer>
    </div>
  );
}

export default BetaLoginPage;
