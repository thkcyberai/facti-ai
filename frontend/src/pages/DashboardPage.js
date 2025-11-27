import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('video');
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Responsive
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
    setDocumentFile(null);
    setSelfieFile(null);
    setIdFile(null);
    setResults(null);
    setError(null);
  };

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const analyzeVideo = async () => {
    if (!videoFile) { setError('Please select a video'); return; }
    setIsAnalyzing(true); setError(null); setResults(null);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      const res = await fetch(API_BASE + '/api/v1/video-deepfake/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getToken() },
        body: formData
      });
      const data = await res.json();
      setResults({ type: 'video', data });
    } catch (err) { setError('Error: ' + err.message); }
    finally { setIsAnalyzing(false); }
  };

  const analyzeDocument = async () => {
    if (!documentFile) { setError('Please select a document'); return; }
    setIsAnalyzing(true); setError(null); setResults(null);
    try {
      const formData = new FormData();
      formData.append('document', documentFile);
      const res = await fetch(API_BASE + '/api/v1/document/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getToken() },
        body: formData
      });
      const data = await res.json();
      setResults({ type: 'document', data });
    } catch (err) { setError('Error: ' + err.message); }
    finally { setIsAnalyzing(false); }
  };

  const analyzeFace = async () => {
    if (!selfieFile || !idFile) { setError('Please select both selfie and ID'); return; }
    setIsAnalyzing(true); setError(null); setResults(null);
    try {
      const formData = new FormData();
      formData.append('selfie', selfieFile);
      formData.append('id_photo', idFile);
      const res = await fetch(API_BASE + '/api/v1/face/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getToken() },
        body: formData
      });
      const data = await res.json();
      setResults({ type: 'face', data });
    } catch (err) { setError('Error: ' + err.message); }
    finally { setIsAnalyzing(false); }
  };

  const getVerdictInfo = () => {
    if (!results) return { color: 'gray', text: 'N/A' };
    const d = results.data;
    if (results.type === 'face') {
      const match = d.match || d.verified || d.is_match;
      return match ? { color: 'green', text: 'MATCH' } : { color: 'red', text: 'NO MATCH' };
    }
    const isGood = d.is_real || d.verdict === 'GENUINE' || d.verdict === 'REAL';
    return isGood ? { color: 'green', text: d.verdict || 'REAL' } : { color: 'red', text: d.verdict || 'FAKE' };
  };

  const tabs = [
    { id: 'video', label: 'Video Deepfake', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l4-2v8l-4-2v-4z" /></svg>, color: '#a78bfa' },
    { id: 'document', label: 'Document Fraud', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>, color: '#a78bfa' },
    { id: 'face', label: 'Face Matching', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, color: '#a78bfa' },
  ];

  return (
    <div style={{minHeight: '100vh', background: '#010a13', color: 'white', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'}}>
      {/* Header - Matching HomePage */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '16px 20px' : '28px 100px',
        maxWidth: '1600px',
        margin: '0 auto',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer'}} onClick={() => navigate('/')}>
          <img 
            src="/assets/KYCLogo.png" 
            alt="KYCShield Logo"
            style={{height: '48px', width: 'auto'}}
          />
          <span style={{
            fontSize: isMobile ? '20px' : '36px',
            fontWeight: '600',
            color: 'white',
            letterSpacing: '-0.5px'
          }}>KYCShield</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button onClick={() => navigate('/unified')} style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '15px',
            padding: isMobile ? '10px 14px' : '16px 32px'
          }}>
            {isMobile ? '🎯 KYC' : '🎯 Unified KYC'}
          </button>
          <button onClick={handleLogout} style={{
            padding: isMobile ? '10px 14px' : '16px 32px',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: isMobile ? '11px' : '15px'
          }}>
            {isMobile ? 'Exit' : 'Logout'}
          </button>
        </div>
      </header>

      <main style={{maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 16px' : '70px 40px'}}>
        {/* Page Title */}
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h1 style={{
            fontSize: isMobile ? '28px' : '56px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            letterSpacing: '-1px'
          }}>
            <span style={{color: '#60a5fa'}}>Detection</span>
            <span style={{color: 'white'}}> Dashboard</span>
          </h1>
          <p style={{color: '#94a3b8', fontSize: isMobile ? '14px' : '22px', margin: 0}}>
            Test individual detection capabilities
          </p>
        </div>

        {/* Tabs */}
        <div style={{display: 'flex', gap: '16px', marginBottom: '50px', justifyContent: 'center'}}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); clearAll(); }}
              style={{
                padding: isMobile ? '10px 14px' : '18px 36px',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: activeTab === tab.id ? '1px solid ' + tab.color : '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: activeTab === tab.id ? tab.color : '#94a3b8',
                cursor: 'pointer',
                fontSize: '17px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Detection Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '24px',
          padding: isMobile ? '20px' : '50px'
        }}>

          {/* Video Tab */}
          {activeTab === 'video' && (
            <div>
              <h3 style={{margin: '0 0 12px 0', color: '#a78bfa', fontSize: '28px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px'}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l4-2v8l-4-2v-4z" /></svg> Video Deepfake Detection</h3>
              <p style={{color: '#94a3b8', marginBottom: '35px', fontSize: '15px'}}>Upload a video to detect AI-generated deepfakes with 99.90% accuracy.</p>
              <div style={{
                border: '2px dashed rgba(148, 163, 184, 0.2)',
                borderRadius: '20px',
                padding: isMobile ? '30px' : '70px',
                textAlign: 'center',
                marginBottom: '35px',
                background: 'rgba(15, 23, 42, 0.4)'
              }}>
                <input type="file" accept="video/*" onChange={handleFileChange(setVideoFile)} style={{display: 'none'}} id="video-upload" />
                <label htmlFor="video-upload" style={{cursor: 'pointer'}}>
                  <div style={{marginBottom: '12px'}}><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div>
                  {videoFile ? <p style={{color: '#a78bfa', fontWeight: '500', fontSize: '15px'}}>{videoFile.name}</p> : <p style={{color: '#64748b', fontSize: '15px'}}>Drop video or click to upload</p>}
                </label>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button onClick={analyzeVideo} disabled={!videoFile || isAnalyzing} style={{
                  flex: 1,
                  padding: '22px',
                  background: videoFile && !isAnalyzing ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'rgba(51, 65, 85, 0.5)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '17px',
                  cursor: videoFile && !isAnalyzing ? 'pointer' : 'not-allowed'
                }}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
                </button>
                <button onClick={clearAll} style={{
                  padding: '22px 36px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}>Clear</button>
              </div>
            </div>
          )}

          {/* Document Tab */}
          {activeTab === 'document' && (
            <div>
              <h3 style={{margin: '0 0 12px 0', color: '#a78bfa', fontSize: '28px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px'}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg> Document Fraud Detection</h3>
              <p style={{color: '#94a3b8', marginBottom: '35px', fontSize: '15px'}}>Upload an ID document to detect synthetic or tampered documents with 100% accuracy.</p>
              <div style={{
                border: '2px dashed rgba(148, 163, 184, 0.2)',
                borderRadius: '20px',
                padding: isMobile ? '30px' : '70px',
                textAlign: 'center',
                marginBottom: '35px',
                background: 'rgba(15, 23, 42, 0.4)'
              }}>
                <input type="file" accept="image/*" onChange={handleFileChange(setDocumentFile)} style={{display: 'none'}} id="doc-upload" />
                <label htmlFor="doc-upload" style={{cursor: 'pointer'}}>
                  <div style={{marginBottom: '12px'}}><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div>
                  {documentFile ? <p style={{color: '#a78bfa', fontWeight: '500', fontSize: '15px'}}>{documentFile.name}</p> : <p style={{color: '#64748b', fontSize: '15px'}}>Drop document or click to upload</p>}
                </label>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button onClick={analyzeDocument} disabled={!documentFile || isAnalyzing} style={{
                  flex: 1,
                  padding: '22px',
                  background: documentFile && !isAnalyzing ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'rgba(51, 65, 85, 0.5)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '17px',
                  cursor: documentFile && !isAnalyzing ? 'pointer' : 'not-allowed'
                }}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
                </button>
                <button onClick={clearAll} style={{
                  padding: '22px 36px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}>Clear</button>
              </div>
            </div>
          )}

          {/* Face Tab */}
          {activeTab === 'face' && (
            <div>
              <h3 style={{margin: '0 0 12px 0', color: '#a78bfa', fontSize: '28px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px'}}><svg width="32" height="32" viewBox="0 0 24 24" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> Face Matching</h3>
              <p style={{color: '#94a3b8', marginBottom: '35px', fontSize: '15px'}}>Compare a selfie with an ID photo to verify identity with 96.94% accuracy.</p>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px'}}>
                <div style={{
                  border: '2px dashed rgba(148, 163, 184, 0.2)',
                  borderRadius: '20px',
                  padding: isMobile ? '30px' : '70px',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.4)'
                }}>
                  <input type="file" accept="image/*" onChange={handleFileChange(setSelfieFile)} style={{display: 'none'}} id="selfie-upload" />
                  <label htmlFor="selfie-upload" style={{cursor: 'pointer'}}>
                    <div style={{marginBottom: '10px'}}><svg width={isMobile ? "28" : "56"} height={isMobile ? "28" : "56"} viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><circle cx="12" cy="10" r="3" /><path d="M12 17v.01" /></svg></div>
                    {selfieFile ? <p style={{color: '#a78bfa', fontWeight: '500', fontSize: '14px'}}>{selfieFile.name}</p> : <p style={{color: '#64748b', fontSize: '14px'}}>Upload Selfie</p>}
                  </label>
                </div>
                <div style={{
                  border: '2px dashed rgba(148, 163, 184, 0.2)',
                  borderRadius: '20px',
                  padding: isMobile ? '30px' : '70px',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.4)'
                }}>
                  <input type="file" accept="image/*" onChange={handleFileChange(setIdFile)} style={{display: 'none'}} id="id-upload" />
                  <label htmlFor="id-upload" style={{cursor: 'pointer'}}>
                    <div style={{marginBottom: '10px'}}><svg width={isMobile ? "28" : "56"} height={isMobile ? "28" : "56"} viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 10h4" /><path d="M14 14h4" /></svg></div>
                    {idFile ? <p style={{color: '#a78bfa', fontWeight: '500', fontSize: '14px'}}>{idFile.name}</p> : <p style={{color: '#64748b', fontSize: '14px'}}>Upload ID Photo</p>}
                  </label>
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button onClick={analyzeFace} disabled={!selfieFile || !idFile || isAnalyzing} style={{
                  flex: 1,
                  padding: '22px',
                  background: selfieFile && idFile && !isAnalyzing ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'rgba(51, 65, 85, 0.5)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '17px',
                  cursor: selfieFile && idFile && !isAnalyzing ? 'pointer' : 'not-allowed'
                }}>
                  {isAnalyzing ? 'Analyzing...' : 'Compare Faces'}
                </button>
                <button onClick={clearAll} style={{
                  padding: '22px 36px',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}>Clear</button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '25px',
              padding: '22px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#f87171',
              textAlign: 'center',
              fontSize: '15px'
            }}>{error}</div>
          )}

          {/* Results */}
          {results && (
            <div style={{
              marginTop: '30px',
              padding: '36px',
              borderRadius: '20px',
              background: getVerdictInfo().color === 'green' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: '1px solid',
              borderColor: getVerdictInfo().color === 'green' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{textAlign: 'center', marginBottom: '24px'}}>
                <span style={{
                  display: 'inline-block',
                  padding: '14px 36px',
                  borderRadius: '50px',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  background: getVerdictInfo().color === 'green' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: getVerdictInfo().color === 'green' ? '#4ade80' : '#f87171'
                }}>
                  {getVerdictInfo().color === 'green' ? '✅' : '⚠️'} {getVerdictInfo().text}
                </span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px'}}>
                <div style={{background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '24px', textAlign: 'center'}}>
                  <p style={{color: '#94a3b8', fontSize: '15px', margin: '0 0 6px 0'}}>Confidence</p>
                  <p style={{fontSize: '28px', fontWeight: 'bold', margin: 0, color: 'white'}}>{results.type === 'face' ? (results.data.similarity || 0).toFixed(1) : ((results.data.confidence || 0) * 100).toFixed(1)}%</p>
                </div>
                <div style={{background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '24px', textAlign: 'center'}}>
                  <p style={{color: '#94a3b8', fontSize: '15px', margin: '0 0 6px 0'}}>Type</p>
                  <p style={{fontSize: isMobile ? '14px' : '22px', fontWeight: '600', margin: 0, color: 'white'}}>{results.type === 'video' ? 'Video' : results.type === 'document' ? 'Document' : 'Face Match'}</p>
                </div>
                <div style={{background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '24px', textAlign: 'center'}}>
                  <p style={{color: '#94a3b8', fontSize: '15px', margin: '0 0 6px 0'}}>Processing</p>
                  <p style={{fontSize: isMobile ? '14px' : '22px', fontWeight: '600', margin: 0, color: 'white'}}>{results.data.frames_analyzed ? results.data.frames_analyzed + ' frames' : 'Instant'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '40px',
        color: '#64748b',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        © 2025 KYCShield by Facti.ai
      </footer>
    </div>
  );
}

export default DashboardPage;
