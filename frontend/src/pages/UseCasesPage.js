import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UseCasesPage() {
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

  const useCases = [
    {icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><linearGradient id="bankGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs><rect x="8" y="18" width="32" height="24" rx="2" stroke="url(#bankGrad)" strokeWidth="2" fill="none"/><path d="M24 8L6 18h36L24 8z" stroke="url(#bankGrad)" strokeWidth="2" fill="none"/><circle cx="24" cy="6" r="2" fill="#a78bfa"/><line x1="16" y1="24" x2="16" y2="36" stroke="#a78bfa" strokeWidth="2"/><line x1="24" y1="24" x2="24" y2="36" stroke="#a78bfa" strokeWidth="2"/><line x1="32" y1="24" x2="32" y2="36" stroke="#a78bfa" strokeWidth="2"/><circle cx="40" cy="12" r="3" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><path d="M40 10v4M38 12h4" stroke="#a78bfa" strokeWidth="1.5"/></svg>, title: 'Banks & Credit Unions', description: 'Protect account opening and loan applications from synthetic identity fraud.', challenges: ['New account fraud', 'Loan stacking attacks', 'Bust-out schemes'], solution: 'KYCShield detects AI-generated identities before accounts are opened, preventing losses before they occur.'},
    {icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><linearGradient id="fintechGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs><rect x="6" y="12" width="36" height="24" rx="4" stroke="url(#fintechGrad)" strokeWidth="2" fill="none"/><rect x="10" y="18" width="10" height="8" rx="1" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><path d="M12 20h6M12 22h4M12 24h5" stroke="#a78bfa" strokeWidth="1"/><circle cx="36" cy="30" r="4" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><circle cx="32" cy="30" r="4" stroke="#c084fc" strokeWidth="1.5" fill="none"/><path d="M26 18h10M26 22h8" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="2 2"/></svg>, title: 'Fintech & Neobanks', description: 'Secure digital onboarding without sacrificing user experience.', challenges: ['Remote identity verification', 'Scalable fraud detection', 'Regulatory compliance'], solution: 'Sub-second verification with 99.90% accuracy enables frictionless onboarding while blocking fraudsters.'},
    {icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><linearGradient id="cryptoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs><polygon points="24,4 42,14 42,34 24,44 6,34 6,14" stroke="url(#cryptoGrad)" strokeWidth="2" fill="none"/><polygon points="24,12 34,18 34,30 24,36 14,30 14,18" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><circle cx="24" cy="24" r="6" stroke="#c084fc" strokeWidth="2" fill="none"/><path d="M24 20v8M22 22l2-2 2 2M22 26l2 2 2-2" stroke="#a78bfa" strokeWidth="1.5"/></svg>, title: 'Crypto Exchanges', description: 'Meet AML requirements while protecting against sophisticated attacks.', challenges: ['KYC compliance', 'Money laundering prevention', 'Account takeover'], solution: 'Multi-layer defense catches deepfake videos and forged documents used to bypass verification.'},
    {icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><linearGradient id="lendGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs><path d="M24 6L6 20v22h36V20L24 6z" stroke="url(#lendGrad)" strokeWidth="2" fill="none"/><rect x="18" y="28" width="12" height="14" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><circle cx="24" cy="16" r="4" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><path d="M20 16h8" stroke="#a78bfa" strokeWidth="1.5"/><path d="M38 10l4 4M42 10l-4 4" stroke="#c084fc" strokeWidth="1.5"/><circle cx="40" cy="8" r="2" fill="#a78bfa"/><path d="M8 30h4M8 34h6M8 38h4" stroke="#a78bfa" strokeWidth="1" strokeDasharray="1 1"/></svg>, title: 'Lending Platforms', description: 'Prevent loan fraud and protect against synthetic borrowers.', challenges: ['First-party fraud', 'Synthetic identity loans', 'Document forgery'], solution: 'Detect AI-generated applicants and forged income documents before disbursement.'},
    {icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><linearGradient id="telecomGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs><rect x="14" y="8" width="20" height="36" rx="3" stroke="url(#telecomGrad)" strokeWidth="2" fill="none"/><circle cx="24" cy="38" r="2" fill="#a78bfa"/><rect x="18" y="14" width="12" height="18" rx="1" stroke="#a78bfa" strokeWidth="1" fill="none"/><path d="M32 4c4 2 6 6 6 10" stroke="#c084fc" strokeWidth="1.5" fill="none"/><path d="M34 8c2 1 3 3 3 5" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><path d="M16 4c-4 2-6 6-6 10" stroke="#c084fc" strokeWidth="1.5" fill="none"/><path d="M14 8c-2 1-3 3-3 5" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><circle cx="24" cy="20" r="3" stroke="#a78bfa" strokeWidth="1"/></svg>, title: 'Telecom Providers', description: 'Stop SIM swap fraud and identity theft at the point of activation.', challenges: ['SIM swap attacks', 'Account fraud', 'Identity theft'], solution: 'Verify customer identity with deepfake-resistant liveness checks and document verification.'},
    {icon: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><linearGradient id="gameGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs><rect x="6" y="14" width="36" height="24" rx="12" stroke="url(#gameGrad)" strokeWidth="2" fill="none"/><circle cx="16" cy="26" r="6" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><path d="M16 22v8M12 26h8" stroke="#a78bfa" strokeWidth="1.5"/><circle cx="30" cy="22" r="2.5" fill="#c084fc"/><circle cx="36" cy="26" r="2.5" fill="#a78bfa"/><circle cx="30" cy="30" r="2.5" fill="#a78bfa"/><circle cx="34" cy="22" r="1" fill="#7c3aed"/><path d="M20 8l2 6M28 8l-2 6" stroke="#c084fc" strokeWidth="1.5"/><circle cx="24" cy="6" r="2" stroke="#a78bfa" strokeWidth="1" fill="none"/></svg>, title: 'Gaming & Gambling', description: 'Ensure age verification and prevent multi-accounting.', challenges: ['Age verification', 'Bonus abuse', 'Multi-accounting'], solution: 'Face matching and liveness detection prevent users from creating multiple fraudulent accounts.'}
  ];

  return (
    <div style={{minHeight: '100vh', background: '#010a13', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
      {/* Header */}
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '16px 20px' : '20px 60px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
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
            <a href="/about" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '16px'}}>About</a>
            <a href="/use-cases" style={{color: '#a78bfa', textDecoration: 'none', fontSize: '16px', fontWeight: '600'}}>Use Cases</a>
            <a href="/contact" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '16px'}}>Contact</a>
            <button onClick={() => navigate('/dashboard')} style={{padding: '12px 28px', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer'}}>Demo</button>
          </nav>
        )}
      </header>

      {/* Mobile Menu */}
      {menuOpen && isMobile && (
        <div style={{background: '#0c1222', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <a href="/" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>Home</a>
          <a href="/about" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>About</a>
          <a href="/use-cases" style={{color: '#a78bfa', textDecoration: 'none', fontSize: '18px', fontWeight: '600'}}>Use Cases</a>
          <a href="/contact" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>Contact</a>
        </div>
      )}

      {/* Hero Section */}
      <section style={{padding: isMobile ? '40px 20px' : '80px 60px', textAlign: 'center'}}>
        <h1 style={{fontSize: isMobile ? '32px' : isTablet ? '44px' : '56px', fontWeight: '800', marginBottom: '24px'}}>
          <span style={{background: 'linear-gradient(135deg, #c084fc, #a855f7, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Use Cases</span>
        </h1>
        <p style={{fontSize: isMobile ? '16px' : '20px', color: '#94a3b8', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8'}}>
          KYCShield protects organizations across industries from synthetic identity fraud and deepfake attacks.
        </p>
      </section>

      {/* Use Cases Grid */}
      <section style={{padding: isMobile ? '0 20px 40px' : '0 60px 80px', maxWidth: '1400px', margin: '0 auto'}}>
        <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(2, 1fr)', gap: '24px'}}>
          {useCases.map((useCase, index) => (
            <div key={index} style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '20px', padding: isMobile ? '24px' : '32px'}}>
              <div style={{fontSize: isMobile ? '36px' : '48px', marginBottom: '16px'}}>{useCase.icon}</div>
              <h3 style={{fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#a78bfa', marginBottom: '12px'}}>{useCase.title}</h3>
              <p style={{fontSize: isMobile ? '14px' : '16px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '20px'}}>{useCase.description}</p>
              
              <div style={{marginBottom: '20px'}}>
                <h4 style={{fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px'}}>Challenges</h4>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {useCase.challenges.map((challenge, i) => (
                    <span key={i} style={{background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#a78bfa'}}>{challenge}</span>
                  ))}
                </div>
              </div>
              
              <div style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '14px'}}>
                <h4 style={{fontSize: '12px', color: '#10b981', marginBottom: '6px', fontWeight: '600'}}>✓ KYCShield Solution</h4>
                <p style={{fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: 0}}>{useCase.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{padding: isMobile ? '40px 20px' : '80px 60px', background: 'rgba(15, 23, 42, 0.5)', textAlign: 'center'}}>
        <h2 style={{fontSize: isMobile ? '24px' : '36px', fontWeight: '700', marginBottom: '20px'}}>Ready to Protect Your Business?</h2>
        <p style={{fontSize: isMobile ? '14px' : '18px', color: '#94a3b8', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px'}}>See KYCShield in action with a personalized demo tailored to your industry.</p>
        <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center'}}>
          <button onClick={() => navigate('/dashboard')} style={{padding: '14px 28px', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: isMobile ? '100%' : 'auto'}}>Try Demo</button>
          <button onClick={() => navigate('/contact')} style={{padding: '14px 28px', background: 'transparent', border: '2px solid #a78bfa', borderRadius: '8px', color: '#a78bfa', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: isMobile ? '100%' : 'auto'}}>Contact Sales</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{padding: isMobile ? '24px 20px' : '40px 60px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b'}}>
        <p style={{fontSize: isMobile ? '14px' : '16px'}}>© 2025 KYCShield by Facti.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UseCasesPage;
