import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PrivacyPage() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const Section = ({ number, title, children }) => (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#a78bfa',
        marginBottom: '16px'
      }}>{number}. {title}</h2>
      <div style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8' }}>
        {children}
      </div>
    </div>
  );

  const handleClose = () => {
    window.close();
    setTimeout(() => navigate(-1), 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #010a13 0%, #0c1222 50%, #010a13 100%)',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: isMobile ? '20px' : '24px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <img
          src="/assets/KYCShield_logo_final.png"
          alt="KYCShield.ai"
          onClick={() => navigate('/')}
          style={{ height: isMobile ? '50px' : '70px', cursor: 'pointer' }}
        />
      </header>

      {/* Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: isMobile ? '32px 20px' : '48px 40px'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '800',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Privacy Policy</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            KYCShield Early Access Beta Program
          </p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Effective Date: December 1, 2025
          </p>
        </div>

        {/* Introduction */}
        <div style={{
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '40px'
        }}>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8', margin: 0 }}>
            This Privacy Policy explains how Facti.ai collects, uses, and protects your information when you use the KYCShield Early Access Beta Program. By using the Service, you consent to the practices described in this policy.
          </p>
        </div>

        {/* About Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '40px'
        }}>
          <h3 style={{ color: '#a78bfa', fontSize: '16px', marginBottom: '12px' }}>About Facti.ai</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
            Facti.ai is an artificial intelligence company specializing in identity verification and fraud detection. The company developed KYCShield, an enterprise platform protecting financial institutions, banks, cryptocurrency exchanges, and government agencies against KYC fraud, synthetic identity attacks, and deepfake threats.
          </p>
          <p style={{ color: '#a78bfa', fontSize: '14px', marginTop: '12px', margin: '12px 0 0 0' }}>
            https://kycshield.ai
          </p>
        </div>

        <Section number="1" title="Information We Collect">
          <p style={{ marginBottom: '16px' }}><strong style={{ color: '#a78bfa' }}>1.1 Account Information:</strong></p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Beta access code and associated identifiers</li>
            <li style={{ marginBottom: '8px' }}>Email address</li>
            <li style={{ marginBottom: '8px' }}>Name and company affiliation</li>
          </ul>

          <p style={{ marginBottom: '16px' }}><strong style={{ color: '#a78bfa' }}>1.2 Test Data:</strong></p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Identity documents submitted for verification testing</li>
            <li style={{ marginBottom: '8px' }}>Selfie photos and liveness videos</li>
            <li style={{ marginBottom: '8px' }}>Verification results and confidence scores</li>
          </ul>

          <p style={{ marginBottom: '16px' }}><strong style={{ color: '#a78bfa' }}>1.3 Device and Technical Information:</strong></p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Device fingerprint including browser, screen resolution, timezone, and hardware configuration</li>
            <li style={{ marginBottom: '8px' }}>IP address and approximate geographic location</li>
            <li style={{ marginBottom: '8px' }}>Browser type and operating system</li>
          </ul>

          <p style={{ marginBottom: '16px' }}><strong style={{ color: '#a78bfa' }}>1.4 Usage Data:</strong></p>
          <ul style={{ paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>Login timestamps and session duration</li>
            <li style={{ marginBottom: '8px' }}>Features used and verification types requested</li>
            <li style={{ marginBottom: '8px' }}>Error logs and performance metrics</li>
          </ul>
        </Section>

        <Section number="2" title="How We Use Your Information">
          <ul style={{ paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Service Provision:</strong> To authenticate your access and provide beta functionality</li>
            <li style={{ marginBottom: '8px' }}><strong>Security:</strong> To detect fraud, enforce device limits, and protect the Service</li>
            <li style={{ marginBottom: '8px' }}><strong>AI Training:</strong> To improve deepfake detection, document fraud detection, and face matching models</li>
            <li style={{ marginBottom: '8px' }}><strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
            <li style={{ marginBottom: '8px' }}><strong>Communications:</strong> To send important updates about the beta program</li>
            <li style={{ marginBottom: '8px' }}><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
          </ul>
        </Section>

        <Section number="3" title="Data Retention">
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Account Data</span>
              <span style={{ color: '#a78bfa', fontWeight: '600' }}>90 days after beta ends</span>
            </div>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Test Data including documents, images, and videos</span>
              <span style={{ color: '#a78bfa', fontWeight: '600' }}>Up to 12 months</span>
            </div>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Security and Audit Logs</span>
              <span style={{ color: '#a78bfa', fontWeight: '600' }}>1 year for SOC 2 compliance</span>
            </div>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Agreement Consent Records</span>
              <span style={{ color: '#a78bfa', fontWeight: '600' }}>3 years</span>
            </div>
          </div>
        </Section>

        <Section number="4" title="Data Sharing">
          <p style={{ marginBottom: '16px' }}>Facti.ai may share your information with:</p>
          <ul style={{ paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Service Providers:</strong> Cloud infrastructure providers including AWS, analytics services, and security services</li>
            <li style={{ marginBottom: '8px' }}><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li style={{ marginBottom: '8px' }}><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <p style={{ color: '#4ade80', fontSize: '14px', margin: 0 }}>
              Facti.ai does NOT sell your personal information to third parties.
            </p>
          </div>
        </Section>

        <Section number="5" title="Data Security">
          <ul style={{ paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>TLS/SSL encryption for all data in transit</li>
            <li style={{ marginBottom: '8px' }}>AES-256 encryption for data at rest</li>
            <li style={{ marginBottom: '8px' }}>AWS infrastructure with SOC 2 compliance</li>
            <li style={{ marginBottom: '8px' }}>Role-based access controls</li>
            <li style={{ marginBottom: '8px' }}>Device fingerprinting and IP monitoring</li>
            <li style={{ marginBottom: '8px' }}>Regular security audits</li>
          </ul>
        </Section>

        <Section number="6" title="Your Rights">
          <p style={{ marginBottom: '16px' }}>Depending on your location, you may have the right to:</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
            {[
              { icon: '📋', label: 'Access your data' },
              { icon: '✏️', label: 'Correct inaccuracies' },
              { icon: '🗑️', label: 'Request deletion' },
              { icon: '📦', label: 'Data portability' },
              { icon: '🚫', label: 'Object to processing' },
              { icon: '⏸️', label: 'Restrict processing' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '16px' }}>
            To exercise these rights, contact Facti.ai at <span style={{ color: '#a78bfa' }}>support@kycshield.ai</span>
          </p>
        </Section>

        <Section number="7" title="International Data Transfers">
          <p>Your information may be transferred to and processed in the United States, where Facti.ai servers are located. By using the Service, you consent to this transfer. Facti.ai ensures appropriate safeguards are in place for international data transfers.</p>
        </Section>

        <Section number="8" title="Children's Privacy">
          <p>The Service is not intended for individuals under 18 years of age. Facti.ai does not knowingly collect personal information from children. If you believe Facti.ai has collected information from a child, please contact support@kycshield.ai immediately.</p>
        </Section>

        <Section number="9" title="Changes to This Policy">
          <p>Facti.ai may update this Privacy Policy from time to time. Facti.ai will notify you of significant changes by posting the new policy on this page and updating the effective date. Continued use after changes constitutes acceptance.</p>
        </Section>

        <Section number="10" title="Contact Us">
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <p style={{ marginBottom: '8px' }}><strong>Email:</strong> <span style={{ color: '#a78bfa' }}>support@kycshield.ai</span></p>
            <p style={{ margin: 0 }}><strong>Website:</strong> <span style={{ color: '#a78bfa' }}>https://kycshield.ai</span></p>
          </div>
        </Section>

        {/* Acceptance Notice */}
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '40px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#4ade80', fontSize: '14px', margin: 0 }}>
            BY CHECKING THE BOX INDICATING YOUR ACCEPTANCE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND CONSENT TO THE DATA PRACTICES DESCRIBED IN THIS PRIVACY POLICY.
          </p>
        </div>

        {/* Centered Close Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={handleClose}
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              border: 'none',
              color: 'white',
              padding: '16px 48px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            Close
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: '#64748b',
        fontSize: '13px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        © 2025 KYCShield by Facti.ai · All Rights Reserved
      </footer>
    </div>
  );
}

export default PrivacyPage;
