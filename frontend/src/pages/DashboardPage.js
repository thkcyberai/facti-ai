import React, { useState } from 'react';
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

  const API_BASE = 'http://localhost:8000';

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
    { id: 'video', label: 'Video Deepfake', icon: '🎬', color: '#22d3ee' },
    { id: 'document', label: 'Document Fraud', icon: '📄', color: '#a855f7' },
    { id: 'face', label: 'Face Matching', icon: '👤', color: '#4ade80' },
  ];

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)', color: 'white', fontFamily: 'Inter, sans-serif'}}>
      {/* Header */}
      <header style={{borderBottom: '1px solid #333', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px'}}>K</div>
          <div>
            <h1 style={{margin: 0, fontSize: '20px', background: 'linear-gradient(to right, #22d3ee, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>KYCShield</h1>
            <p style={{margin: 0, fontSize: '11px', color: '#666'}}>Detection Dashboard</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button onClick={() => navigate('/unified')} style={{padding: '10px 20px', background: 'linear-gradient(to right, #f59e0b, #ef4444)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px'}}>
            🎯 Unified KYC
          </button>
          <button onClick={handleLogout} style={{padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: '8px', color: '#888', cursor: 'pointer', fontSize: '14px'}}>
            Logout
          </button>
        </div>
      </header>

      <main style={{maxWidth: '900px', margin: '0 auto', padding: '40px 20px'}}>
        {/* Tabs */}
        <div style={{display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center'}}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); clearAll(); }}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: activeTab === tab.id ? '1px solid ' + tab.color : '1px solid #333',
                borderRadius: '10px',
                color: activeTab === tab.id ? tab.color : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Detection Card */}
        <div style={{background: 'rgba(30,30,50,0.5)', border: '1px solid #333', borderRadius: '20px', padding: '30px'}}>
          
          {/* Video Tab */}
          {activeTab === 'video' && (
            <div>
              <h3 style={{margin: '0 0 20px 0', color: '#22d3ee'}}>🎬 Video Deepfake Detection</h3>
              <p style={{color: '#666', marginBottom: '20px'}}>Upload a video to detect AI-generated deepfakes with 99.90% accuracy.</p>
              <div style={{border: '2px dashed #444', borderRadius: '15px', padding: '40px', textAlign: 'center', marginBottom: '20px'}}>
                <input type="file" accept="video/*" onChange={handleFileChange(setVideoFile)} style={{display: 'none'}} id="video-upload" />
                <label htmlFor="video-upload" style={{cursor: 'pointer'}}>
                  <div style={{fontSize: '40px', marginBottom: '10px'}}>📤</div>
                  {videoFile ? <p style={{color: '#22d3ee', fontWeight: '500'}}>{videoFile.name}</p> : <p style={{color: '#666'}}>Drop video or click to upload</p>}
                </label>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={analyzeVideo} disabled={!videoFile || isAnalyzing} style={{flex: 1, padding: '15px', background: videoFile && !isAnalyzing ? 'linear-gradient(to right, #06b6d4, #0891b2)' : '#333', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: videoFile && !isAnalyzing ? 'pointer' : 'not-allowed'}}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
                </button>
                <button onClick={clearAll} style={{padding: '15px 25px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: '10px', color: '#888', cursor: 'pointer'}}>Clear</button>
              </div>
            </div>
          )}

          {/* Document Tab */}
          {activeTab === 'document' && (
            <div>
              <h3 style={{margin: '0 0 20px 0', color: '#a855f7'}}>📄 Document Fraud Detection</h3>
              <p style={{color: '#666', marginBottom: '20px'}}>Upload an ID document to detect synthetic or tampered documents with 100% accuracy.</p>
              <div style={{border: '2px dashed #444', borderRadius: '15px', padding: '40px', textAlign: 'center', marginBottom: '20px'}}>
                <input type="file" accept="image/*" onChange={handleFileChange(setDocumentFile)} style={{display: 'none'}} id="doc-upload" />
                <label htmlFor="doc-upload" style={{cursor: 'pointer'}}>
                  <div style={{fontSize: '40px', marginBottom: '10px'}}>📤</div>
                  {documentFile ? <p style={{color: '#a855f7', fontWeight: '500'}}>{documentFile.name}</p> : <p style={{color: '#666'}}>Drop document or click to upload</p>}
                </label>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={analyzeDocument} disabled={!documentFile || isAnalyzing} style={{flex: 1, padding: '15px', background: documentFile && !isAnalyzing ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' : '#333', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: documentFile && !isAnalyzing ? 'pointer' : 'not-allowed'}}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
                </button>
                <button onClick={clearAll} style={{padding: '15px 25px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: '10px', color: '#888', cursor: 'pointer'}}>Clear</button>
              </div>
            </div>
          )}

          {/* Face Tab */}
          {activeTab === 'face' && (
            <div>
              <h3 style={{margin: '0 0 20px 0', color: '#4ade80'}}>👤 Face Matching</h3>
              <p style={{color: '#666', marginBottom: '20px'}}>Compare a selfie with an ID photo to verify identity with 96.94% accuracy.</p>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                <div style={{border: '2px dashed #444', borderRadius: '15px', padding: '30px', textAlign: 'center'}}>
                  <input type="file" accept="image/*" onChange={handleFileChange(setSelfieFile)} style={{display: 'none'}} id="selfie-upload" />
                  <label htmlFor="selfie-upload" style={{cursor: 'pointer'}}>
                    <div style={{fontSize: '30px', marginBottom: '10px'}}>🤳</div>
                    {selfieFile ? <p style={{color: '#4ade80', fontWeight: '500', fontSize: '14px'}}>{selfieFile.name}</p> : <p style={{color: '#666', fontSize: '14px'}}>Upload Selfie</p>}
                  </label>
                </div>
                <div style={{border: '2px dashed #444', borderRadius: '15px', padding: '30px', textAlign: 'center'}}>
                  <input type="file" accept="image/*" onChange={handleFileChange(setIdFile)} style={{display: 'none'}} id="id-upload" />
                  <label htmlFor="id-upload" style={{cursor: 'pointer'}}>
                    <div style={{fontSize: '30px', marginBottom: '10px'}}>🪪</div>
                    {idFile ? <p style={{color: '#4ade80', fontWeight: '500', fontSize: '14px'}}>{idFile.name}</p> : <p style={{color: '#666', fontSize: '14px'}}>Upload ID Photo</p>}
                  </label>
                </div>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={analyzeFace} disabled={!selfieFile || !idFile || isAnalyzing} style={{flex: 1, padding: '15px', background: selfieFile && idFile && !isAnalyzing ? 'linear-gradient(to right, #22c55e, #16a34a)' : '#333', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: selfieFile && idFile && !isAnalyzing ? 'pointer' : 'not-allowed'}}>
                  {isAnalyzing ? 'Analyzing...' : 'Compare Faces'}
                </button>
                <button onClick={clearAll} style={{padding: '15px 25px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: '10px', color: '#888', cursor: 'pointer'}}>Clear</button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '10px', color: '#f87171', textAlign: 'center'}}>{error}</div>
          )}

          {/* Results */}
          {results && (
            <div style={{marginTop: '25px', padding: '25px', borderRadius: '15px', background: getVerdictInfo().color === 'green' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: '1px solid', borderColor: getVerdictInfo().color === 'green' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}}>
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <span style={{display: 'inline-block', padding: '12px 30px', borderRadius: '50px', fontSize: '22px', fontWeight: 'bold', background: getVerdictInfo().color === 'green' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: getVerdictInfo().color === 'green' ? '#4ade80' : '#f87171'}}>
                  {getVerdictInfo().color === 'green' ? '✅' : '⚠️'} {getVerdictInfo().text}
                </span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px'}}>
                <div style={{background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '15px', textAlign: 'center'}}>
                  <p style={{color: '#888', fontSize: '12px', margin: '0 0 5px 0'}}>Confidence</p>
                  <p style={{fontSize: '24px', fontWeight: 'bold', margin: 0}}>{results.type === 'face' ? (results.data.similarity || 0).toFixed(1) : ((results.data.confidence || 0) * 100).toFixed(1)}%</p>
                </div>
                <div style={{background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '15px', textAlign: 'center'}}>
                  <p style={{color: '#888', fontSize: '12px', margin: '0 0 5px 0'}}>Type</p>
                  <p style={{fontSize: '16px', fontWeight: '600', margin: 0}}>{results.type === 'video' ? 'Video' : results.type === 'document' ? 'Document' : 'Face Match'}</p>
                </div>
                <div style={{background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '15px', textAlign: 'center'}}>
                  <p style={{color: '#888', fontSize: '12px', margin: '0 0 5px 0'}}>Processing</p>
                  <p style={{fontSize: '16px', fontWeight: '600', margin: 0}}>{results.data.frames_analyzed ? results.data.frames_analyzed + ' frames' : 'Instant'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
