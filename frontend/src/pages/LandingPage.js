import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const handleJoinNewsletter = () => {
    navigate('/newsletter');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/assets/ShesVerified.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(1, 10, 19, 0.75) 0%, rgba(12, 18, 34, 0.65) 50%, rgba(1, 10, 19, 0.75) 100%)',
        zIndex: 1
      }} />
      <div style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '40px 20px' : isTablet ? '60px 40px' : '80px 100px',
        textAlign: 'center'
      }}>
        <img
          src="/assets/KYCShield_logo_final.png"
          alt="KYCShield.ai"
          style={{
            height: isMobile ? '50px' : isTablet ? '60px' : '70px',
            width: 'auto',
            marginBottom: isMobile ? '24px' : '40px'
          }}
        />
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '50px',
          padding: '10px 24px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{ fontSize: '16px' }}>🚨</span>
          <span style={{
            color: '#fca5a5',
            fontSize: isMobile ? '13px' : '15px',
            fontWeight: '600'
          }}>
            $3.1 Billion lost to synthetic identity fraud in 2023
          </span>
        </div>
        <h1 style={{
          fontSize: isMobile ? '36px' : isTablet ? '52px' : '72px',
          fontWeight: '800',
          lineHeight: '1.05',
          margin: '0 0 24px 0',
          letterSpacing: '-2px',
          maxWidth: '1000px',
          color: 'white',
          textShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
        }}>
          Stop <span style={{
            background: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Synthetic Identity Fraud</span> Before It Starts
        </h1>
        <p style={{
          fontSize: isMobile ? '16px' : isTablet ? '18px' : '20px',
          color: 'rgba(255, 255, 255, 0.85)',
          lineHeight: '1.7',
          maxWidth: '650px',
          margin: '0 0 48px 0',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          AI-powered KYC fraud detection with <span style={{ color: '#c084fc', fontWeight: '700' }}>99.9% accuracy</span>. Built to defeat deepfakes, forged documents, and synthetic identities.
        </p>
        <button
          onClick={handleJoinNewsletter}
          style={{
            padding: isMobile ? '18px 40px' : '22px 56px',
            fontSize: isMobile ? '17px' : '19px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          Join Newsletter
          <span style={{ fontSize: '20px' }}>→</span>
        </button>
        <p style={{
          marginTop: '24px',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Want to be a <a href="/newsletter" style={{ color: '#c084fc', textDecoration: 'underline', fontWeight: '600' }}>Beta Tester</a>?
        </p>
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(transparent, rgba(1, 10, 19, 0.9))'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          © 2025 KYCShield by Facti.ai
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
