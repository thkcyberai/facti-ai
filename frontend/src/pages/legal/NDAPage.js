import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NDAPage() {
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
          }}>Beta NDA & Confidentiality Agreement</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            KYCShield Early Access Beta Program
          </p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Effective Date: December 1, 2025
          </p>
        </div>

        {/* Warning Banner */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <p style={{ color: '#fca5a5', fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
              LEGALLY BINDING AGREEMENT
            </p>
            <p style={{ color: '#f87171', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
              This is a legally binding Non-Disclosure Agreement. By accepting, you agree to keep all information about KYCShield confidential for a period of 3 years. Violation may result in legal action.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div style={{
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '40px'
        }}>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' }}>
            This Non-Disclosure Agreement is entered into between Facti.ai and you as the Beta Tester as of the date of electronic acceptance.
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8', margin: 0 }}>
            <strong>WHEREAS</strong>, Facti.ai has developed proprietary AI-powered identity verification technology; and
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8', margin: '16px 0 0 0' }}>
            <strong>WHEREAS</strong>, the Beta Tester desires to participate in the Beta Program and will receive access to Confidential Information;
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8', margin: '16px 0 0 0' }}>
            <strong>NOW, THEREFORE</strong>, the parties agree as follows:
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

        <Section number="1" title="Definition of Confidential Information">
          <p style={{ marginBottom: '16px' }}>
            Confidential Information means any non-public information disclosed by Facti.ai, including but not limited to:
          </p>

          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>Technical Information:</strong></p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>AI algorithms, models, and architectures</li>
            <li style={{ marginBottom: '8px' }}>Deepfake detection, document fraud detection, face matching, and liveness detection models</li>
            <li style={{ marginBottom: '8px' }}>Source code, APIs, and system architecture</li>
            <li style={{ marginBottom: '8px' }}>Training data, datasets, and model weights</li>
          </ul>

          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>Business Information:</strong></p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Business plans, strategies, and roadmaps</li>
            <li style={{ marginBottom: '8px' }}>Customer lists and partnerships</li>
            <li style={{ marginBottom: '8px' }}>Pricing, financial data, and projections</li>
            <li style={{ marginBottom: '8px' }}>Marketing and sales strategies</li>
          </ul>

          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>Product Information:</strong></p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Features, functionality, and user interfaces</li>
            <li style={{ marginBottom: '8px' }}>Unreleased features and product roadmaps</li>
            <li style={{ marginBottom: '8px' }}>Beta testing results and feedback</li>
          </ul>

          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>Security Information:</strong></p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Security measures and vulnerabilities</li>
            <li style={{ marginBottom: '8px' }}>Authentication and encryption methods</li>
            <li style={{ marginBottom: '8px' }}>Infrastructure and deployment details</li>
          </ul>

          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>Performance Data:</strong></p>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <p style={{ margin: 0, marginBottom: '8px' }}>Accuracy rates and performance metrics are strictly confidential, including:</p>
            <ul style={{ paddingLeft: '24px', margin: 0 }}>
              <li style={{ marginBottom: '4px' }}>Deepfake detection accuracy rates</li>
              <li style={{ marginBottom: '4px' }}>Document fraud detection accuracy rates</li>
              <li>Face matching accuracy rates</li>
            </ul>
          </div>
        </Section>

        <Section number="2" title="Obligations of Confidentiality">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>2.1 Non-Disclosure:</strong> The Beta Tester shall not disclose any Confidential Information to any third party without prior written consent from Facti.ai.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>2.2 Limited Use:</strong> The Beta Tester shall use Confidential Information solely for the purpose of evaluating and testing the Service during the Beta Program. The Beta Tester shall not use Confidential Information to compete with KYCShield or any Facti.ai product.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>2.3 Standard of Care:</strong> The Beta Tester shall protect Confidential Information using at least the same degree of care used to protect their own confidential information, but no less than reasonable care.</p>
          <p><strong style={{ color: '#a78bfa' }}>2.4 No Copies:</strong> The Beta Tester shall not copy, reproduce, or duplicate any Confidential Information except as necessary for the permitted evaluation purpose.</p>
        </Section>

        <Section number="3" title="Prohibited Activities">
          <p style={{ marginBottom: '16px' }}>The Beta Tester expressly agrees NOT to:</p>
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '12px', color: '#fca5a5' }}>
                <strong>Reverse engineer</strong> or attempt to derive source code, algorithms, or model weights from the Service
              </li>
              <li style={{ marginBottom: '12px', color: '#fca5a5' }}>
                <strong>Extract AI models</strong> or training data through any means, including adversarial attacks
              </li>
              <li style={{ marginBottom: '12px', color: '#fca5a5' }}>
                <strong>Take screenshots</strong> or recordings of the Service without prior written approval from Facti.ai
              </li>
              <li style={{ marginBottom: '12px', color: '#fca5a5' }}>
                <strong>Publicly discuss</strong> accuracy rates or other performance metrics
              </li>
              <li style={{ marginBottom: '12px', color: '#fca5a5' }}>
                <strong>Share access codes</strong> or allow unauthorized individuals to access the Service
              </li>
              <li style={{ marginBottom: '12px', color: '#fca5a5' }}>
                <strong>Conduct security testing</strong> without prior written authorization from Facti.ai
              </li>
              <li style={{ marginBottom: '12px', color: '#fca5a5' }}>
                <strong>Develop competing products</strong> using knowledge gained from the Service
              </li>
              <li style={{ color: '#fca5a5' }}>
                <strong>Disclose</strong> the existence or nature of the Beta Program to media or competitors
              </li>
            </ul>
          </div>
        </Section>

        <Section number="4" title="Intellectual Property">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>4.1 Ownership:</strong> All Confidential Information and intellectual property rights therein remain the exclusive property of Facti.ai. This Agreement does not grant any license or rights to KYCShield or any Facti.ai technology except the limited evaluation right.</p>
          <p><strong style={{ color: '#a78bfa' }}>4.2 Feedback:</strong> Any feedback, suggestions, or improvements provided by the Beta Tester shall become the property of Facti.ai, which may use such feedback to improve KYCShield or any other product without compensation or attribution.</p>
        </Section>

        <Section number="5" title="Term and Termination">
          <div style={{
            display: 'grid',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Agreement Term</span>
              <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '18px' }}>3 Years</span>
            </div>
            <div style={{
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Confidentiality Obligations Survival</span>
              <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '18px' }}>3 Years</span>
            </div>
          </div>
          <p><strong style={{ color: '#a78bfa' }}>5.1 Return of Materials:</strong> Upon termination or request, the Beta Tester shall promptly return or destroy all Confidential Information and certify such destruction in writing.</p>
        </Section>

        <Section number="6" title="Remedies">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>6.1 Irreparable Harm:</strong> The Beta Tester acknowledges that unauthorized disclosure of Confidential Information would cause irreparable harm to Facti.ai for which monetary damages would be inadequate.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>6.2 Injunctive Relief:</strong> Facti.ai shall be entitled to seek injunctive relief, specific performance, and other equitable remedies in addition to any other remedies available at law.</p>
          <p><strong style={{ color: '#a78bfa' }}>6.3 Legal Fees:</strong> The prevailing party in any dispute shall be entitled to recover reasonable attorney fees and costs.</p>
        </Section>

        <Section number="7" title="General Provisions">
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>7.1 Governing Law:</strong> This Agreement is governed by the laws of the State of Delaware, without regard to conflict of law principles.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>7.2 Entire Agreement:</strong> This Agreement, together with the Terms of Service and Privacy Policy, constitutes the entire agreement between the parties regarding confidentiality.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>7.3 Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in full force and effect.</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#a78bfa' }}>7.4 No Waiver:</strong> Failure to enforce any provision does not constitute a waiver of that provision.</p>
          <p><strong style={{ color: '#a78bfa' }}>7.5 Assignment:</strong> The Beta Tester may not assign this Agreement without prior written consent from Facti.ai.</p>
        </Section>

        {/* Acceptance Notice */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '40px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#fca5a5', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
            LEGALLY BINDING ELECTRONIC ACCEPTANCE
          </p>
          <p style={{ color: '#f87171', fontSize: '14px', margin: 0, lineHeight: '1.7' }}>
            BY CHECKING THE BOX INDICATING YOUR ACCEPTANCE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE LEGALLY BOUND BY THIS NON-DISCLOSURE AGREEMENT FOR A PERIOD OF THREE YEARS. YOUR ELECTRONIC ACCEPTANCE HAS THE SAME LEGAL EFFECT AS A HANDWRITTEN SIGNATURE.
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

export default NDAPage;
