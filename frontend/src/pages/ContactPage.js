import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ContactPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formType = searchParams.get('type') === 'sales' ? 'sales' : 'contact';
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({name: '', email: '', company: '', industry: '', message: ''});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'https://api.kycshield.ai/api/v1';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL + '/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          industry: formData.industry,
          message: formData.message,
          form_type: formType
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.detail || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Unable to submit form. Please try again later.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {width: '100%', padding: '14px 16px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box'};

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
            <a href="/use-cases" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '16px'}}>Use Cases</a>
            <a href="/contact" style={{color: '#a78bfa', textDecoration: 'none', fontSize: '16px', fontWeight: '600'}}>Contact</a>
            <button onClick={() => navigate('/dashboard')} style={{padding: '12px 28px', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer'}}>Demo</button>
          </nav>
        )}
      </header>

      {/* Mobile Menu */}
      {menuOpen && isMobile && (
        <div style={{background: '#0c1222', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <a href="/" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>Home</a>
          <a href="/about" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>About</a>
          <a href="/use-cases" style={{color: '#cbd5e1', textDecoration: 'none', fontSize: '18px'}}>Use Cases</a>
          <a href="/contact" style={{color: '#a78bfa', textDecoration: 'none', fontSize: '18px', fontWeight: '600'}}>Contact</a>
        </div>
      )}

      {/* Main Content */}
      <section style={{padding: isMobile ? '40px 20px' : '80px 60px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '80px'}}>

          {/* Left Side - Info */}
          <div>
            <h1 style={{fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '24px'}}>
              Get in <span style={{background: 'linear-gradient(135deg, #c084fc, #a855f7, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Touch</span>
            </h1>
            <p style={{fontSize: isMobile ? '16px' : '18px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '40px'}}>
              Ready to protect your organization from synthetic identity fraud? Let's discuss how KYCShield can help secure your verification process.
            </p>

            <div style={{marginBottom: '32px'}}>
              {[
                {icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>, label: 'Email', value: 'contact@kycshield.ai'},
                {icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>, label: 'Website', value: 'kycshield.ai'},
                {icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, label: 'Location', value: 'United States'}
              ].map((item, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px'}}>
                  <div style={{width: '50px', height: '50px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>{item.icon}</div>
                  <div>
                    <div style={{fontSize: '14px', color: '#64748b', marginBottom: '4px'}}>{item.label}</div>
                    <div style={{fontSize: isMobile ? '16px' : '18px', color: '#cbd5e1'}}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '16px', padding: '24px'}}>
              <h3 style={{fontSize: '18px', color: '#a78bfa', marginBottom: '16px'}}>Why Choose KYCShield?</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'}}>
                {[
                  {val: '99.90%', label: 'Deepfake Detection'},
                  {val: '100%', label: 'Document Fraud'},
                  {val: '<1s', label: 'Response Time'},
                  {val: 'SOC 2', label: 'Ready'}
                ].map((stat, i) => (
                  <div key={i} style={{textAlign: 'center'}}>
                    <div style={{fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#a78bfa'}}>{stat.val}</div>
                    <div style={{fontSize: '12px', color: '#64748b'}}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div style={{background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '20px', padding: isMobile ? '24px' : '40px'}}>
            {!submitted ? (
              <>
                <h2 style={{fontSize: isMobile ? '20px' : '24px', fontWeight: '700', marginBottom: '24px'}}>Request a Demo</h2>
                {error && (
                  <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '14px'}}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="John Smith" />
                  </div>
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>Work Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="john@company.com" />
                  </div>
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>Company *</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} required style={inputStyle} placeholder="Acme Inc." />
                  </div>
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>Industry</label>
                    <select name="industry" value={formData.industry} onChange={handleChange} style={inputStyle}>
                      <option value="">Select Industry</option>
                      <option value="banking">Banking & Credit Unions</option>
                      <option value="fintech">Fintech & Neobanks</option>
                      <option value="crypto">Crypto & Blockchain</option>
                      <option value="lending">Lending Platforms</option>
                      <option value="telecom">Telecommunications</option>
                      <option value="gaming">Gaming & Gambling</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{marginBottom: '24px'}}>
                    <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} rows={4} style={{...inputStyle, resize: 'vertical'}} placeholder="Tell us about your needs..." />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      width: '100%', 
                      padding: '16px', 
                      background: isSubmitting ? '#6b7280' : 'linear-gradient(135deg, #a78bfa, #7c3aed)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: 'white', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Demo'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{textAlign: 'center', padding: '40px 0'}}>
                <div style={{fontSize: '64px', marginBottom: '24px'}}>✅</div>
                <h2 style={{fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: '#10b981'}}>Thank You!</h2>
                <p style={{fontSize: '18px', color: '#94a3b8', marginBottom: '32px'}}>We've received your request and will be in touch within 72 hours.</p>
                <button onClick={() => navigate('/dashboard')} style={{padding: '14px 28px', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer'}}>Try Demo Now</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{padding: isMobile ? '24px 20px' : '40px 60px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b'}}>
        <p style={{fontSize: isMobile ? '14px' : '16px'}}>© 2025 KYCShield by Trusi.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ContactPage;
