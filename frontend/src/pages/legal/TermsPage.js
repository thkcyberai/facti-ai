import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TermsPage() {
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
    // Fallback if window.close() doesn't work (e.g., not opened by script)
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
          }}>Terms of Service</h1>
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
            These Terms of Service govern your access to and use of the KYCShield Early Access Beta Program provided by Facti.ai. By accessing or using the Service, you agree to be bound by these Terms.
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

        <Section number="1" title="Eligibility and Acceptance">
          <p style={{ marginBottom: '12px' }}>To participate in the Beta Program, you must:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Be at least 18 years of age</li>
            <li style={{ marginBottom: '8px' }}>Have received a valid beta access code from Facti.ai</li>
            <li style={{ marginBottom: '8px' }}>Accept these Terms, the Privacy Policy, and the Beta NDA</li>
            <li style={{ marginBottom: '8px' }}>Comply with all applicable laws and regulations</li>
          </ul>
          <p>By checking the acceptance box and clicking "Accept & Continue," you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
        </Section>

        <Section number="2" title="Beta Program Terms">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>2.1 Access Period:</strong> Your beta access is valid for 20 days from your first login. Access automatically expires at the end of this period.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>2.2 Beta Nature:</strong> The Service is provided in beta form for testing and evaluation purposes. Features may be incomplete, contain errors, or be modified without notice. The Service is not intended for production use.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>2.3 Device Limit:</strong> Each access code may be used on a maximum of 3 devices. Additional devices will be blocked automatically.</p>
          <p><strong style={{ color: '#a78bfa' }}>2.4 Feedback:</strong> You may provide feedback, suggestions, or bug reports. You grant Facti.ai a perpetual, irrevocable, worldwide, royalty-free license to use such Feedback for any purpose.</p>
        </Section>

        <Section number="3" title="Permitted Use">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>3.1 License:</strong> Subject to these Terms, Facti.ai grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for evaluation purposes only.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>3.2 Restrictions:</strong> You may NOT:</p>
          <ul style={{ paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>Share your access code with any third party</li>
            <li style={{ marginBottom: '8px' }}>Reverse engineer, decompile, or disassemble the Service</li>
            <li style={{ marginBottom: '8px' }}>Attempt to extract AI models, algorithms, or training data</li>
            <li style={{ marginBottom: '8px' }}>Use the Service for any production or commercial purposes</li>
            <li style={{ marginBottom: '8px' }}>Conduct security testing without prior written authorization</li>
            <li style={{ marginBottom: '8px' }}>Upload malicious files or attempt to compromise the Service</li>
            <li style={{ marginBottom: '8px' }}>Use the Service to develop competing products</li>
            <li style={{ marginBottom: '8px' }}>Remove or modify any proprietary notices</li>
          </ul>
        </Section>

        <Section number="4" title="Intellectual Property">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>4.1 Ownership:</strong> The Service, including all AI models, algorithms, software, documentation, and related materials, is and remains the exclusive property of Facti.ai. Nothing in these Terms transfers any ownership rights to you.</p>
          <p><strong style={{ color: '#a78bfa' }}>4.2 Trademarks:</strong> "KYCShield" and "Facti.ai" and associated logos are trademarks of Facti.ai. You may not use these marks without prior written consent.</p>
        </Section>

        <Section number="5" title="Data and Privacy">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>5.1 Data Collection:</strong> Facti.ai collects usage data, device information, and test data as described in the Privacy Policy.</p>
          <p><strong style={{ color: '#a78bfa' }}>5.2 Test Data:</strong> Any documents, images, or videos you submit for testing may be retained for up to 12 months to improve the AI models. Do not submit real personal identification documents.</p>
        </Section>

        <Section number="6" title="Disclaimers">
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '14px' }}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. FACTI.AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </div>
          <p>Facti.ai does not guarantee the accuracy, completeness, or reliability of any verification results. The Service should not be relied upon as the sole basis for any identity verification decisions.</p>
        </Section>

        <Section number="7" title="Limitation of Liability">
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, FACTI.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. FACTI.AI'S TOTAL LIABILITY SHALL NOT EXCEED ONE HUNDRED DOLLARS ($100).</p>
        </Section>

        <Section number="8" title="Indemnification">
          <p>You agree to indemnify and hold harmless Facti.ai, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.</p>
        </Section>

        <Section number="9" title="Termination">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>9.1 By Facti.ai:</strong> Facti.ai may terminate or suspend your access immediately, without notice, for any reason, including violation of these Terms.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>9.2 By You:</strong> You may terminate by clicking "Decline & Withdraw" in the Agreement Modal. This will permanently deactivate your access code.</p>
          <p><strong style={{ color: '#a78bfa' }}>9.3 Effect:</strong> Upon termination, your right to use the Service ceases immediately. Sections 4-8 survive termination.</p>
        </Section>

        <Section number="10" title="General Provisions">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>10.1 Governing Law:</strong> These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>10.2 Entire Agreement:</strong> These Terms, together with the Privacy Policy and Beta NDA, constitute the entire agreement between you and Facti.ai.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>10.3 Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in effect.</p>
          <p><strong style={{ color: '#a78bfa' }}>10.4 Contact:</strong> Questions about these Terms should be directed to support@kycshield.ai</p>
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
            BY CHECKING THE BOX INDICATING YOUR ACCEPTANCE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
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

export default TermsPage;
