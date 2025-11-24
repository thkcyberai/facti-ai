"""
Cross-Artifact Correlation Analyzer
Detects if video, selfie, and ID document share GAN fingerprints (ProKYC attacks)
"""

import numpy as np
from typing import Dict, List, Tuple
from PIL import Image
import tensorflow as tf
import cv2


class CrossArtifactAnalyzer:
    """
    Analyzes GAN artifacts across multiple inputs
    Detects ProKYC-style attacks where all artifacts from same GAN
    """
    
    def __init__(self):
        self.correlation_threshold = 0.75  # High correlation = same GAN source
        
    def analyze_correlation(
        self,
        video_path: str,
        selfie_path: str,
        document_path: str,
        deepfake_result: Dict,
        face_match_result: Dict,
        document_result: Dict
    ) -> Dict:
        """
        Analyze correlation between video, selfie, and document
        
        Returns:
        {
            'prokyc_signature_detected': bool,
            'correlation_score': float,
            'risk_level': 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL',
            'suspicious_patterns': [...]
        }
        """
        
        suspicious_patterns = []
        correlation_score = 0.0
        
        # Pattern 1: All three flagged as fake/suspicious
        all_fake = (
            deepfake_result.get('is_real') == False and
            document_result.get('is_genuine') == False and
            face_match_result.get('match') == False
        )
        
        if all_fake:
            suspicious_patterns.append("All three inputs flagged as fraudulent")
            correlation_score += 0.4
        
        # Pattern 2: High individual scores but impossible combination
        # (e.g., perfect face match but both fake)
        high_face_match = face_match_result.get('similarity', 0) > 0.90
        video_fake = deepfake_result.get('is_real') == False
        doc_fake = document_result.get('is_genuine') == False
        
        if high_face_match and video_fake and doc_fake:
            suspicious_patterns.append("High face similarity with fraudulent video and document (ProKYC indicator)")
            correlation_score += 0.5
        
        # Pattern 3: Confidence patterns (all high confidence = synthetic batch)
        video_confidence = deepfake_result.get('confidence', 0)
        doc_confidence = document_result.get('confidence', 0)
        face_confidence = face_match_result.get('similarity', 0)
        
        if video_confidence > 0.95 and doc_confidence > 0.95 and face_confidence > 0.95:
            if not deepfake_result.get('is_real') or not document_result.get('is_genuine'):
                suspicious_patterns.append("Unnaturally high confidence across all fake artifacts")
                correlation_score += 0.3
        
        # Pattern 4: Timing analysis (all files created at same time = batch generation)
        # TODO: Add file metadata timestamp analysis
        
        # Pattern 5: Check for GAN artifacts in extracted frames
        try:
            gan_correlation = self._check_gan_fingerprints(video_path, selfie_path, document_path)
            correlation_score += gan_correlation * 0.3
            
            if gan_correlation > 0.7:
                suspicious_patterns.append(f"Similar GAN artifacts detected across inputs (correlation: {gan_correlation:.2f})")
        except Exception as e:
            print(f"GAN fingerprint analysis failed: {e}")
        
        # Normalize correlation score to [0, 1]
        correlation_score = min(1.0, correlation_score)
        
        # Determine risk level
        if correlation_score >= 0.75:
            risk_level = "CRITICAL"
            prokyc_detected = True
        elif correlation_score >= 0.50:
            risk_level = "HIGH"
            prokyc_detected = True
        elif correlation_score >= 0.30:
            risk_level = "MEDIUM"
            prokyc_detected = False
        else:
            risk_level = "LOW"
            prokyc_detected = False
        
        return {
            'prokyc_signature_detected': prokyc_detected,
            'correlation_score': round(correlation_score, 4),
            'risk_level': risk_level,
            'suspicious_patterns': suspicious_patterns,
            'analysis_details': {
                'all_fake_pattern': all_fake,
                'high_confidence_fake': video_confidence > 0.95 and doc_confidence > 0.95,
                'impossible_combination': high_face_match and video_fake and doc_fake
            }
        }
    
    def _check_gan_fingerprints(
        self,
        video_path: str,
        selfie_path: str,
        document_path: str
    ) -> float:
        """
        Check for similar GAN fingerprints across inputs
        
        Returns correlation score [0, 1]
        """
        try:
            # Extract middle frame from video
            cap = cv2.VideoCapture(video_path)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2)
            ret, video_frame = cap.read()
            cap.release()
            
            if not ret:
                return 0.0
            
            # Load selfie and document
            selfie_img = cv2.imread(selfie_path)
            doc_img = cv2.imread(document_path)
            
            # Resize all to same size for comparison
            target_size = (256, 256)
            video_frame = cv2.resize(video_frame, target_size)
            selfie_img = cv2.resize(selfie_img, target_size)
            doc_img = cv2.resize(doc_img, target_size)
            
            # Extract high-frequency components (GAN artifacts often in high freq)
            video_freq = self._extract_high_freq(video_frame)
            selfie_freq = self._extract_high_freq(selfie_img)
            doc_freq = self._extract_high_freq(doc_img)
            
            # Compute correlation between frequency patterns
            corr_video_selfie = np.corrcoef(video_freq.flatten(), selfie_freq.flatten())[0, 1]
            corr_video_doc = np.corrcoef(video_freq.flatten(), doc_freq.flatten())[0, 1]
            corr_selfie_doc = np.corrcoef(selfie_freq.flatten(), doc_freq.flatten())[0, 1]
            
            # Average correlation (high = similar GAN signatures)
            avg_correlation = (abs(corr_video_selfie) + abs(corr_video_doc) + abs(corr_selfie_doc)) / 3
            
            return max(0.0, min(1.0, avg_correlation))
            
        except Exception as e:
            print(f"GAN fingerprint extraction failed: {e}")
            return 0.0
    
    def _extract_high_freq(self, image: np.ndarray) -> np.ndarray:
        """Extract high-frequency components using DCT"""
        # Convert to grayscale
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply DCT
        dct = cv2.dct(np.float32(image))
        
        # Keep only high-frequency components (bottom-right quadrant)
        h, w = dct.shape
        high_freq = dct[h//2:, w//2:]
        
        return high_freq


# Singleton instance
_analyzer_instance = None

def get_analyzer() -> CrossArtifactAnalyzer:
    """Get singleton analyzer instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = CrossArtifactAnalyzer()
    return _analyzer_instance
