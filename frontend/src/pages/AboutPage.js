import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AboutPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{minHeight: '100vh', background: '#010a13', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '16px 20px' : '20px 60px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}} onClick={() => navigate('/')}>
          <img src="/assets/KYCLogo.png" alt="KYCShield Logo" style={{height: isMobile ? '32px' : '44px', width: 'auto'}} />
          <span style={{fontSize: isMobile ? '24px' : '36px', fontWeight: '600', color: 'white'}}>KYCShield</span>
        </div>

        {isMobile ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <button onClick={() => navigate('/dashboard')} style={{padding: '10px 20px', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>Demo</button>
            <div onClick={() => setMenuOpen(!menuOpen)} style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px'}}>
              <span style={{width: '24px', height: '2px', background: 'white'}}></span>
              <span style={{width: '24px', height: '2px', background: 'white'}}></span>
              <span style={{width: '24px', height: '2px', background: 'white'}}></span>
            </div>
          </div>
        ) : (
          <nav style={{display: 'flex', gap: isTablet ? '24px' : '40px', alignItems: 'center'}}>
            <a href="/" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '16px'}}>Home</a>
            <a href="/about" style={{color: '#a78bfa', textDecoration: 'none', fontSize: '16px', fontWeight: '600'}}>About</a>
            <a href="/use-cases" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '16px'}}>Use Cases</a>
            <a href="/contact" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '16px'}}>Contact</a>
            <button onClick={() => navigate('/dashboard')} style={{padding: '12px 28px', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer'}}>Demo</button>
          </nav>
        )}
      </header>

      {/* Mobile Menu */}
      {menuOpen && isMobile && (
        <div style={{background: '#0c1222', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <a href="/" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>Home</a>
          <a href="/about" style={{color: '#a78bfa', textDecoration: 'none', fontSize: '18px', fontWeight: '600'}}>About</a>
          <a href="/use-cases" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>Use Cases</a>
          <a href="/contact" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>Contact</a>
        </div>
      )}

      {/* Hero Section */}
      <section style={{padding: isMobile ? '40px 20px' : '80px 60px', textAlign: 'center'}}>
        <h1 style={{fontSize: isMobile ? '32px' : isTablet ? '44px' : '56px', fontWeight: '800', marginBottom: '24px'}}>
          About <span style={{background: 'linear-gradient(135deg, #c084fc, #a855f7, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>KYCShield</span>
        </h1>
        <p style={{fontSize: isMobile ? '16px' : '20px', color: '#94a3b8', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8'}}>
          We're on a mission to protect financial institutions from the rising threat of synthetic identity fraud and deepfake attacks.
        </p>
      </section>

      {/* Our Story */}
      <section style={{padding: isMobile ? '40px 20px' : '60px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '60px', alignItems: 'center'}}>
          <div>
            <h2 style={{fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '24px', color: '#a78bfa'}}>Our Story</h2>
            <p style={{fontSize: isMobile ? '16px' : '18px', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '20px'}}>
              KYCShield was born from a critical observation: as AI technology advances, so do the tools available to fraudsters. Traditional KYC systems were designed to verify document consistency—not to detect AI-generated identities.
            </p>
            <p style={{fontSize: isMobile ? '16px' : '18px', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '20px'}}>
              When attack tools like ProKYC emerged, capable of generating complete synthetic identities with AI faces, forged documents, and deepfake videos, we knew a new approach was needed.
            </p>
            <p style={{fontSize: isMobile ? '16px' : '18px', color: '#cbd5e1', lineHeight: '1.8'}}>
              Our team combines deep expertise in cybersecurity, machine learning, and financial compliance to build a multi-layer defense system that catches what others miss.
            </p>
          </div>
          <div style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '20px', padding: isMobile ? '24px' : '40px', textAlign: 'center'}}>
            <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'center'}}>
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{
                  width: isMobile ? '120px' : '160px',
                  height: isMobile ? '120px' : '160px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  mixBlendMode: 'lighten'
                }}
              >
                <source src="/assets/SpinLogo.mp4" type="video/mp4" />
              </video>
            </div>
            <h3 style={{fontSize: isMobile ? '20px' : '24px', color: '#a78bfa', marginBottom: '16px'}}>Our Mission</h3>
            <p style={{fontSize: isMobile ? '16px' : '18px', color: '#94a3b8', lineHeight: '1.6'}}>
              "To make synthetic identity fraud economically unviable by detecting attacks with industry-leading accuracy."
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{padding: isMobile ? '40px 20px' : '60px', background: 'rgba(15, 23, 42, 0.5)'}}>
        <div style={{display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '24px' : '40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center'}}>
          <div>
            <div style={{fontSize: isMobile ? '32px' : '48px', fontWeight: '800', color: '#a78bfa'}}>99.90%</div>
            <div style={{fontSize: isMobile ? '13px' : '16px', color: '#94a3b8', marginTop: '8px'}}>Deepfake Detection</div>
          </div>
          <div>
            <div style={{fontSize: isMobile ? '32px' : '48px', fontWeight: '800', color: '#a78bfa'}}>100%</div>
            <div style={{fontSize: isMobile ? '13px' : '16px', color: '#94a3b8', marginTop: '8px'}}>Document Fraud</div>
          </div>
          <div>
            <div style={{fontSize: isMobile ? '32px' : '48px', fontWeight: '800', color: '#a78bfa'}}>96.94%</div>
            <div style={{fontSize: isMobile ? '13px' : '16px', color: '#94a3b8', marginTop: '8px'}}>Face Matching</div>
          </div>
          <div>
            <div style={{fontSize: isMobile ? '32px' : '48px', fontWeight: '800', color: '#a78bfa'}}>&lt;1s</div>
            <div style={{fontSize: isMobile ? '13px' : '16px', color: '#94a3b8', marginTop: '8px'}}>Real-time</div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section style={{padding: isMobile ? '40px 20px' : '80px 60px', maxWidth: '1200px', margin: '0 auto'}}>
        <h2 style={{fontSize: isMobile ? '28px' : '36px', fontWeight: '700', textAlign: 'center', marginBottom: isMobile ? '32px' : '60px'}}>
          Our <span style={{color: '#a78bfa'}}>Technology</span>
        </h2>
        <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '24px'}}>
          <div style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '16px', padding: '24px'}}>
            <div style={{marginBottom: '12px'}}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg></div>
            <h3 style={{fontSize: '18px', color: '#a78bfa', marginBottom: '10px'}}>XceptionNet Architecture</h3>
            <p style={{fontSize: '14px', color: '#94a3b8', lineHeight: '1.6'}}>Industry-leading deep learning model validated on 1,000 unseen videos from FaceForensics++ dataset.</p>
          </div>
          <div style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '16px', padding: '24px'}}>
            <div style={{marginBottom: '12px'}}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
            <h3 style={{fontSize: '18px', color: '#a78bfa', marginBottom: '10px'}}>Multi-Layer Defense</h3>
            <p style={{fontSize: '14px', color: '#94a3b8', lineHeight: '1.6'}}>Four independent detection layers ensure that even if one is evaded, others catch the fraud.</p>
          </div>
          <div style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '16px', padding: '24px', gridColumn: isTablet ? 'span 2' : 'auto'}}>
            <div style={{marginBottom: '12px'}}><svg width="36" height="36" viewBox="0 0 24 24" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
            <h3 style={{fontSize: '18px', color: '#a78bfa', marginBottom: '10px'}}>Enterprise Security</h3>
            <p style={{fontSize: '14px', color: '#94a3b8', lineHeight: '1.6'}}>SOC 2 ready architecture with GDPR compliance, field-level encryption, and comprehensive audit logging.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{padding: isMobile ? '24px 20px' : '40px 60px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b'}}>
        <p style={{fontSize: isMobile ? '14px' : '16px'}}>© 2025 KYCShield by Facti.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AboutPage;
