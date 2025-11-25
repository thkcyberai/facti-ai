import React, { useState } from 'react';
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

  const API_BASE = 'http://localhost:8000';
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
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)', color: 'white', fontFamily: 'Inter, sans-serif'}}>
      {/* Header */}
      <header style={{borderBottom: '1px solid #333', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px'}}>K</div>
          <div>
            <h1 style={{margin: 0, fontSize: '20px', background: 'linear-gradient(to right, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Unified KYC</h1>
            <p style={{margin: 0, fontSize: '11px', color: '#666'}}>Complete Identity Verification</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button onClick={() => navigate('/dashboard')} style={{padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: '8px', color: '#888', cursor: 'pointer', fontSize: '14px'}}>
            ← Dashboard
          </button>
          <button onClick={handleLogout} style={{padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: '8px', color: '#888', cursor: 'pointer', fontSize: '14px'}}>
            Logout
          </button>
        </div>
      </header>

      <main style={{maxWidth: '1000px', margin: '0 auto', padding: '40px 20px'}}>
        {/* Title */}
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h2 style={{fontSize: '32px', marginBottom: '10px'}}>
            <span style={{color: '#f59e0b'}}>Complete</span> KYC Verification
          </h2>
          <p style={{color: '#666'}}>Detects ProKYC and coordinated synthetic identity attacks</p>
        </div>

        {/* Upload Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px'}}>
          {/* Video */}
          <div style={{background: 'rgba(30,30,50,0.5)', border: videoFile ? '2px solid #22d3ee' : '1px solid #333', borderRadius: '15px', padding: '25px', textAlign: 'center'}}>
            <div style={{fontSize: '40px', marginBottom: '10px'}}>🎬</div>
            <h4 style={{margin: '0 0 5px 0', color: '#22d3ee'}}>Liveness Video</h4>
            <p style={{color: '#666', fontSize: '12px', marginBottom: '15px'}}>Deepfake Detection</p>
            <input type="file" accept="video/*" onChange={handleFileChange(setVideoFile)} style={{display: 'none'}} id="video-upload" />
            <label htmlFor="video-upload" style={{display: 'block', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: videoFile ? '#22d3ee' : '#666'}}>
              {videoFile ? videoFile.name : 'Click to upload'}
            </label>
          </div>

          {/* Selfie */}
          <div style={{background: 'rgba(30,30,50,0.5)', border: selfieFile ? '2px solid #4ade80' : '1px solid #333', borderRadius: '15px', padding: '25px', textAlign: 'center'}}>
            <div style={{fontSize: '40px', marginBottom: '10px'}}>🤳</div>
            <h4 style={{margin: '0 0 5px 0', color: '#4ade80'}}>Selfie Photo</h4>
            <p style={{color: '#666', fontSize: '12px', marginBottom: '15px'}}>Face Matching</p>
            <input type="file" accept="image/*" onChange={handleFileChange(setSelfieFile)} style={{display: 'none'}} id="selfie-upload" />
            <label htmlFor="selfie-upload" style={{display: 'block', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: selfieFile ? '#4ade80' : '#666'}}>
              {selfieFile ? selfieFile.name : 'Click to upload'}
            </label>
          </div>

          {/* Document */}
          <div style={{background: 'rgba(30,30,50,0.5)', border: documentFile ? '2px solid #a855f7' : '1px solid #333', borderRadius: '15px', padding: '25px', textAlign: 'center'}}>
            <div style={{fontSize: '40px', marginBottom: '10px'}}>🪪</div>
            <h4 style={{margin: '0 0 5px 0', color: '#a855f7'}}>ID Document</h4>
            <p style={{color: '#666', fontSize: '12px', marginBottom: '15px'}}>Fraud Detection</p>
            <input type="file" accept="image/*" onChange={handleFileChange(setDocumentFile)} style={{display: 'none'}} id="doc-upload" />
            <label htmlFor="doc-upload" style={{display: 'block', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: documentFile ? '#a855f7' : '#666'}}>
              {documentFile ? documentFile.name : 'Click to upload'}
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div style={{display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px'}}>
          <button
            onClick={runUnifiedKYC}
            disabled={!videoFile || !selfieFile || !documentFile || isAnalyzing}
            style={{
              padding: '18px 50px',
              background: videoFile && selfieFile && documentFile && !isAnalyzing ? 'linear-gradient(to right, #f59e0b, #ef4444)' : '#333',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              cursor: videoFile && selfieFile && documentFile && !isAnalyzing ? 'pointer' : 'not-allowed'
            }}
          >
            {isAnalyzing ? progress || 'Analyzing...' : '🔍 Run Complete KYC Check'}
          </button>
          <button onClick={clearAll} style={{padding: '18px 30px', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', borderRadius: '12px', color: '#888', cursor: 'pointer', fontSize: '16px'}}>
            Clear All
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{padding: '15px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '10px', color: '#f87171', textAlign: 'center', marginBottom: '20px'}}>{error}</div>
        )}

        {/* Results */}
        {results && (
          <div>
            {/* Overall Verdict */}
            <div style={{
              padding: '30px',
              borderRadius: '20px',
              background: results.overall === 'PASS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: '2px solid',
              borderColor: results.overall === 'PASS' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{fontSize: '50px', marginBottom: '10px'}}>
                {results.overall === 'PASS' ? '✅' : '🚫'}
              </div>
              <h2 style={{margin: '0 0 10px 0', fontSize: '36px', color: results.overall === 'PASS' ? '#4ade80' : '#f87171'}}>
                KYC {results.overall}
              </h2>
              {results.proKYCDetected && (
                <div style={{display: 'inline-block', padding: '8px 20px', background: 'rgba(239, 68, 68, 0.3)', borderRadius: '20px', color: '#fca5a5', fontSize: '14px', fontWeight: '600'}}>
                  ⚠️ ProKYC Attack Pattern Detected
                </div>
              )}
            </div>

            {/* Individual Results */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px'}}>
              {/* Video Result */}
              <div style={{background: 'rgba(30,30,50,0.5)', border: '1px solid', borderColor: results.video.passed ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)', borderRadius: '15px', padding: '20px', textAlign: 'center'}}>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>{results.video.passed ? '✅' : '❌'}</div>
                <h4 style={{margin: '0 0 5px 0', color: '#22d3ee'}}>Video Deepfake</h4>
                <p style={{color: results.video.passed ? '#4ade80' : '#f87171', fontWeight: '600', margin: '5px 0'}}>{results.video.verdict || (results.video.is_real ? 'REAL' : 'FAKE')}</p>
                <p style={{color: '#888', fontSize: '13px', margin: 0}}>{((results.video.confidence || 0) * 100).toFixed(1)}% confidence</p>
              </div>

              {/* Face Result */}
              <div style={{background: 'rgba(30,30,50,0.5)', border: '1px solid', borderColor: results.face.passed ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)', borderRadius: '15px', padding: '20px', textAlign: 'center'}}>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>{results.face.passed ? '✅' : '❌'}</div>
                <h4 style={{margin: '0 0 5px 0', color: '#4ade80'}}>Face Match</h4>
                <p style={{color: results.face.passed ? '#4ade80' : '#f87171', fontWeight: '600', margin: '5px 0'}}>{results.face.passed ? 'MATCH' : 'NO MATCH'}</p>
                <p style={{color: '#888', fontSize: '13px', margin: 0}}>{(results.face.similarity || 0).toFixed(1)}% similarity</p>
              </div>

              {/* Document Result */}
              <div style={{background: 'rgba(30,30,50,0.5)', border: '1px solid', borderColor: results.document.passed ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)', borderRadius: '15px', padding: '20px', textAlign: 'center'}}>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>{results.document.passed ? '✅' : '❌'}</div>
                <h4 style={{margin: '0 0 5px 0', color: '#a855f7'}}>Document</h4>
                <p style={{color: results.document.passed ? '#4ade80' : '#f87171', fontWeight: '600', margin: '5px 0'}}>{results.document.verdict || (results.document.is_real ? 'GENUINE' : 'FRAUDULENT')}</p>
                <p style={{color: '#888', fontSize: '13px', margin: 0}}>{((results.document.confidence || 0) * 100).toFixed(1)}% confidence</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UnifiedKYCPage;
