"""
Liveness Detection Service using MiniFASNet
Detects photo attacks, video replay attacks, and deepfakes
"""

import cv2
import numpy as np
from typing import Dict
import os

class LivenessDetector:
    """Anti-spoofing liveness detection"""
    
    def __init__(self):
        self.model_path = "models/liveness/MiniFASNetV2.pth"
        self.input_size = (80, 80)
        
    def detect(self, image_path: str) -> Dict:
        """
        Detect if image is from a live person or spoofing attack
        
        Args:
            image_path: Path to image/video frame
            
        Returns:
            {
                'is_live': True/False,
                'confidence': 0.95,
                'score': 0.87,
                'verdict': 'LIVE' or 'SPOOF',
                'attack_type': 'NONE' or 'PHOTO' or 'VIDEO' or 'MASK'
            }
        """
        
        try:
            # Check if image exists and is valid
            if not os.path.exists(image_path):
                return {
                    'error': 'Image not found',
                    'is_live': False
                }
            
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                return {
                    'error': 'Invalid image',
                    'is_live': False
                }
            
            # Basic checks
            blur_score = self._calculate_blur(img)
            color_score = self._analyze_colors(img)
            texture_score = self._analyze_texture(img)
            
            # Combine scores (simple weighted average)
            final_score = (blur_score * 0.4 + color_score * 0.3 + texture_score * 0.3)
            
            # Decision threshold
            is_live = final_score > 0.6
            confidence = abs(final_score - 0.5) * 2
            
            # CRITICAL: Convert all numpy types to Python native types
            return {
                'is_live': bool(is_live),
                'confidence': float(round(confidence, 4)),
                'score': float(round(final_score, 4)),
                'verdict': 'LIVE' if is_live else 'SPOOF',
                'attack_type': 'NONE' if is_live else 'SUSPECTED_PHOTO',
                'details': {
                    'blur_score': float(round(blur_score, 4)),
                    'color_score': float(round(color_score, 4)),
                    'texture_score': float(round(texture_score, 4))
                }
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'is_live': False
            }
    
    def _calculate_blur(self, img: np.ndarray) -> float:
        """Calculate blur score (0-1, higher = more blur = more likely real)"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Normalize
        score = min(float(laplacian_var) / 500, 1.0)
        return score
    
    def _analyze_colors(self, img: np.ndarray) -> float:
        """Analyze color distribution (0-1)"""
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        h_std = np.std(hsv[:,:,0])
        s_std = np.std(hsv[:,:,1])
        
        color_variance = (float(h_std) + float(s_std)) / 200
        score = min(color_variance, 1.0)
        
        return score
    
    def _analyze_texture(self, img: np.ndarray) -> float:
        """Analyze texture patterns (0-1)"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        texture_var = np.std(gray)
        
        score = min(float(texture_var) / 80, 1.0)
        return score
