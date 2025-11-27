import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UnifiedKYCPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const navigate = useNavigate();
  
  // Responsive - Mobile only
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const API_BASE = 'https://api.kycshield.ai';
  const getToken = () => localStorage.getItem('kycshield_token');

  const handleLogout = () => {
    localStorage.removeItem('kycshield_token');
    navigate('/');
  };

  const clearAll = () => {
    setVideoFile(null);
    setSelfieFile(null);
    setDocumentFile(null);
    setResults(null);
    setError(null);
    setProgress('');
  };

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name, file.size);
      setter(file);
    }
  };

  const runUnifiedKYC = async () => {
    if (!videoFile || !selfieFile || !documentFile) {
      setError('Please upload all three files: Video, Selfie, and ID Document');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const token = getToken();
    const analysisResults = { video: null, document: null, face: null };

    try {
      // Step 1: Video Deepfake
      setProgress('Analyzing video for deepfakes...');
      const videoForm = new FormData();
      videoForm.append('video', videoFile);
      const videoRes = await fetch(API_BASE + '/api/v1/video-deepfake/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: videoForm
      });
      analysisResults.video = await videoRes.json();

      // Step 2: Document Fraud
      setProgress('Checking document authenticity...');
      const docForm = new FormData();
      docForm.append('document', documentFile);
      const docRes = await fetch(API_BASE + '/api/v1/document/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: docForm
      });
      analysisResults.document = await docRes.json();

      // Step 3: Face Matching
      setProgress('Matching face with ID...');
      const faceForm = new FormData();
      faceForm.append('selfie', selfieFile);
      faceForm.append('id_photo', documentFile);
      const faceRes = await fetch(API_BASE + '/api/v1/face/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: faceForm
      });
      analysisResults.face = await faceRes.json();

      setProgress('');

      // Calculate overall verdict
      const videoOK = analysisResults.video.is_real || analysisResults.video.verdict === 'REAL';
      const docOK = analysisResults.document.verdict === 'GENUINE' || analysisResults.document.is_real;
      const faceOK = analysisResults.face.match || analysisResults.face.verified || analysisResults.face.is_match;

      const overallPass = videoOK && docOK && faceOK;
      const failCount = [!videoOK, !docOK, !faceOK].filter(Boolean).length;

      // ProKYC detection: if ALL fail, likely coordinated attack
      const proKYCDetected = failCount >= 2;

      setResults({
        overall: overallPass ? 'PASS' : 'FAIL',
        proKYCDetected,
        video: { ...analysisResults.video, passed: videoOK },
        document: { ...analysisResults.document, passed: docOK },
        face: { ...analysisResults.face, passed: faceOK }
      });

    } catch (err) {
      setError('Error: ' + err.message);
      setProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', background: '#010a13', color: 'white', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'}}>
      {/* Header - Matching HomePage/Dashboard */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '16px 20px' : '28px 100px',
        maxWidth: '1600px',
        margin: '0 auto',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer'}} onClick={() => navigate('/')}>
          <img 
            src="/assets/KYCLogo.png" 
            alt="KYCShield Logo"
            style={{height: '52px', width: 'auto'}}
          />
          <span style={{
            fontSize: isMobile ? '18px' : '36px',
            fontWeight: '600',
            color: 'white',
            letterSpacing: '-0.5px'
          }}>KYCShield</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '20px'}}>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '16px 32px',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '10px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: isMobile ? '10px' : '17px',
            padding: isMobile ? '8px 10px' : '16px 32px'
          }}>
            {isMobile ? '← Back' : '← Dashboard'}
          </button>
          <button onClick={handleLogout} style={{
            padding: '16px 32px',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '10px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: isMobile ? '11px' : '17px',
            padding: isMobile ? '8px 12px' : '16px 32px'
          }}>
            {isMobile ? 'Exit' : 'Logout'}
          </button>
        </div>
      </header>

      <main style={{maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 16px' : '70px 40px'}}>
        {/* Title */}
        <div style={{textAlign: 'center', marginBottom: '60px'}}>
          <h1 style={{
            fontSize: isMobile ? '28px' : '56px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            letterSpacing: '-2px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Unified</span>
            <span style={{color: 'white'}}> KYC Verification</span>
          </h1>
          <p style={{color: '#94a3b8', fontSize: isMobile ? '14px' : '22px', margin: 0}}>
            Detects ProKYC and coordinated synthetic identity attacks
          </p>
        </div>

        {/* Upload Cards */}
        <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px', marginBottom: '50px'}}>
          {/* Video */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: videoFile ? '2px solid #a78bfa' : '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{marginBottom: '16px'}}><svg width={isMobile ? "28" : "56"} height={isMobile ? "28" : "56"} viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l4-2v8l-4-2v-4z" /><circle cx="9" cy="12" r="2" /></svg></div>
            <h4 style={{margin: '0 0 8px 0', color: '#a78bfa', fontSize: isMobile ? '14px' : '22px', fontWeight: '600'}}>Liveness Video</h4>
            <p style={{color: '#94a3b8', fontSize: '15px', marginBottom: '24px'}}>Deepfake Detection</p>
            <input type="file" accept="video/*" onChange={handleFileChange(setVideoFile)} style={{display: 'none'}} id="video-upload" />
            <label htmlFor="video-upload" style={{
              display: 'block',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              color: videoFile ? '#a78bfa' : '#64748b',
              fontWeight: videoFile ? '500' : '400'
            }}>
              {videoFile ? videoFile.name : 'Click to upload'}
            </label>
          </div>

          {/* Selfie */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: selfieFile ? '2px solid #a78bfa' : '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{marginBottom: '16px'}}><svg width={isMobile ? "28" : "56"} height={isMobile ? "28" : "56"} viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><circle cx="12" cy="10" r="3" /><path d="M12 17v.01" /></svg></div>
            <h4 style={{margin: '0 0 8px 0', color: '#a78bfa', fontSize: isMobile ? '14px' : '22px', fontWeight: '600'}}>Selfie Photo</h4>
            <p style={{color: '#94a3b8', fontSize: '15px', marginBottom: '24px'}}>Face Matching</p>
            <input type="file" accept="image/*" onChange={handleFileChange(setSelfieFile)} style={{display: 'none'}} id="selfie-upload" />
            <label htmlFor="selfie-upload" style={{
              display: 'block',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              color: selfieFile ? '#a78bfa' : '#64748b',
              fontWeight: selfieFile ? '500' : '400'
            }}>
              {selfieFile ? selfieFile.name : 'Click to upload'}
            </label>
          </div>

          {/* Document */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: documentFile ? '2px solid #a78bfa' : '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{marginBottom: '16px'}}><svg width={isMobile ? "28" : "56"} height={isMobile ? "28" : "56"} viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4" /><path d="M14 14h4" /></svg></div>
            <h4 style={{margin: '0 0 8px 0', color: '#a78bfa', fontSize: isMobile ? '14px' : '22px', fontWeight: '600'}}>ID Document</h4>
            <p style={{color: '#94a3b8', fontSize: '15px', marginBottom: '24px'}}>Fraud Detection</p>
            <input type="file" accept="image/*" onChange={handleFileChange(setDocumentFile)} style={{display: 'none'}} id="doc-upload" />
            <label htmlFor="doc-upload" style={{
              display: 'block',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              color: documentFile ? '#a78bfa' : '#64748b',
              fontWeight: documentFile ? '500' : '400'
            }}>
              {documentFile ? documentFile.name : 'Click to upload'}
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '50px'}}>
          <button
            onClick={runUnifiedKYC}
            disabled={!videoFile || !selfieFile || !documentFile || isAnalyzing}
            style={{
              padding: isMobile ? '16px 20px' : '22px 60px',
              background: videoFile && selfieFile && documentFile && !isAnalyzing ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'rgba(51, 65, 85, 0.5)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: isMobile ? '14px' : '20px',
              fontWeight: '600',
              flex: isMobile ? 2 : 'none',
              cursor: videoFile && selfieFile && documentFile && !isAnalyzing ? 'pointer' : 'not-allowed'
            }}
          >
            {isAnalyzing ? progress || 'Analyzing...' : '🔍 Run Complete KYC Check'}
          </button>
          <button onClick={clearAll} style={{
            padding: isMobile ? '16px 16px' : '22px 40px',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '18px',
            flex: isMobile ? 1 : 'none'
          }}>
            Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '20px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            color: '#f87171',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '18px'
          }}>{error}</div>
        )}

        {/* Results */}
        {results && (
          <div>
            {/* Overall Verdict */}
            <div style={{
              padding: '40px',
              borderRadius: '24px',
              background: results.overall === 'PASS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: '2px solid',
              borderColor: results.overall === 'PASS' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>
                {results.overall === 'PASS' ? '✅' : '🚫'}
              </div>
              <h2 style={{margin: '0 0 16px 0', fontSize: '48px', fontWeight: '700', color: results.overall === 'PASS' ? '#4ade80' : '#f87171'}}>
                KYC {results.overall}
              </h2>
              {results.proKYCDetected && (
                <div style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  borderRadius: '50px',
                  color: '#fca5a5',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  ⚠️ ProKYC Attack Pattern Detected
                </div>
              )}
            </div>

            {/* Individual Results */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
              {/* Video Result */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid',
                borderColor: results.video.passed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '36px', marginBottom: '14px'}}>{results.video.passed ? '✅' : '❌'}</div>
                <h4 style={{margin: '0 0 10px 0', color: '#a78bfa', fontSize: '20px', fontWeight: '600'}}>Video Deepfake</h4>
                <p style={{color: results.video.passed ? '#4ade80' : '#f87171', fontWeight: '700', margin: '8px 0', fontSize: '22px'}}>{results.video.verdict || (results.video.is_real ? 'REAL' : 'FAKE')}</p>
                <p style={{color: '#94a3b8', fontSize: '16px', margin: 0}}>{((results.video.confidence || 0) * 100).toFixed(1)}% confidence</p>
              </div>

              {/* Face Result */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid',
                borderColor: results.face.passed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '36px', marginBottom: '14px'}}>{results.face.passed ? '✅' : '❌'}</div>
                <h4 style={{margin: '0 0 10px 0', color: '#a78bfa', fontSize: '20px', fontWeight: '600'}}>Face Match</h4>
                <p style={{color: results.face.passed ? '#4ade80' : '#f87171', fontWeight: '700', margin: '8px 0', fontSize: '22px'}}>{results.face.passed ? 'MATCH' : 'NO MATCH'}</p>
                <p style={{color: '#94a3b8', fontSize: '16px', margin: 0}}>{(results.face.similarity || 0).toFixed(1)}% similarity</p>
              </div>

              {/* Document Result */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid',
                borderColor: results.document.passed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '36px', marginBottom: '14px'}}>{results.document.passed ? '✅' : '❌'}</div>
                <h4 style={{margin: '0 0 10px 0', color: '#a78bfa', fontSize: '20px', fontWeight: '600'}}>Document</h4>
                <p style={{color: results.document.passed ? '#4ade80' : '#f87171', fontWeight: '700', margin: '8px 0', fontSize: '22px'}}>{results.document.verdict || (results.document.is_real ? 'GENUINE' : 'FRAUDULENT')}</p>
                <p style={{color: '#94a3b8', fontSize: '16px', margin: 0}}>{((results.document.confidence || 0) * 100).toFixed(1)}% confidence</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '48px',
        color: '#64748b',
        fontSize: '15px',
        fontWeight: '500'
      }}>
        © 2025 KYCShield by Facti.ai
      </footer>
    </div>
  );
}

export default UnifiedKYCPage;
