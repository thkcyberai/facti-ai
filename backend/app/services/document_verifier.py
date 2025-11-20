"""
Document Verification Service
Basic document validation and quality checks
"""

import cv2
import numpy as np
import os
from typing import Dict

class DocumentVerifier:
    """Document authentication and quality validation"""
    
    def __init__(self):
        self.min_resolution = (200, 200)
        self.min_brightness = 50
        self.max_brightness = 200
        self.min_sharpness = 50
        
    def verify(self, document_path: str) -> Dict:
        """
        Verify document authenticity and quality
        
        Args:
            document_path: Path to ID document image
            
        Returns:
            {
                'valid': True/False,
                'verdict': 'VALID'|'INVALID'|'SUSPICIOUS',
                'confidence': 0.85,
                'issues': ['issue1', 'issue2'],
                'quality_metrics': {...}
            }
        """
        
        try:
            # Check file exists
            if not os.path.exists(document_path):
                return {
                    'valid': False,
                    'verdict': 'INVALID',
                    'confidence': 1.0,
                    'issues': ['DOCUMENT_NOT_FOUND'],
                    'error': 'File not found'
                }
            
            # Load image
            img = cv2.imread(document_path)
            if img is None:
                return {
                    'valid': False,
                    'verdict': 'INVALID',
                    'confidence': 1.0,
                    'issues': ['UNREADABLE_IMAGE'],
                    'error': 'Cannot read image file'
                }
            
            issues = []
            quality_score = 100
            
            # Check 1: Resolution
            height, width = img.shape[:2]
            if height < self.min_resolution[0] or width < self.min_resolution[1]:
                issues.append('LOW_RESOLUTION')
                quality_score -= 30
            
            # Check 2: Brightness
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            mean_brightness = float(gray.mean())
            
            if mean_brightness < self.min_brightness:
                issues.append('TOO_DARK')
                quality_score -= 25
            elif mean_brightness > self.max_brightness:
                issues.append('TOO_BRIGHT')
                quality_score -= 25
            
            # Check 3: Sharpness (blur detection)
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            if laplacian_var < self.min_sharpness:
                issues.append('TOO_BLURRY')
                quality_score -= 30
            
            # Check 4: Color distribution (detect B&W copies)
            color_std = float(np.std(img))
            if color_std < 10:
                issues.append('POSSIBLE_PHOTOCOPY')
                quality_score -= 20
            
            # Check 5: Edge detection (document boundaries)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = float(np.sum(edges > 0) / edges.size)
            
            if edge_density < 0.05:
                issues.append('LOW_DETAIL')
                quality_score -= 15
            elif edge_density > 0.3:
                issues.append('EXCESSIVE_NOISE')
                quality_score -= 10
            
            # Check 6: Face detection (ID should have face)
            face_detected, face_confidence = self._detect_face(img)
            if not face_detected:
                issues.append('NO_FACE_DETECTED')
                quality_score -= 20
            
            # Determine verdict
            quality_score = max(0, quality_score)
            
            if quality_score >= 70:
                verdict = 'VALID'
                valid = True
                confidence = quality_score / 100
            elif quality_score >= 40:
                verdict = 'SUSPICIOUS'
                valid = False
                confidence = 0.5
            else:
                verdict = 'INVALID'
                valid = False
                confidence = (100 - quality_score) / 100
            
            return {
                'valid': valid,
                'verdict': verdict,
                'confidence': round(confidence, 4),
                'quality_score': quality_score,
                'issues': issues,
                'quality_metrics': {
                    'resolution': f"{width}x{height}",
                    'brightness': round(mean_brightness, 2),
                    'sharpness': round(laplacian_var, 2),
                    'color_variance': round(color_std, 2),
                    'edge_density': round(edge_density, 4),
                    'face_detected': face_detected,
                    'face_confidence': round(face_confidence, 4) if face_detected else 0
                }
            }
            
        except Exception as e:
            return {
                'valid': False,
                'verdict': 'INVALID',
                'confidence': 1.0,
                'issues': ['PROCESSING_ERROR'],
                'error': str(e)
            }
    
    def _detect_face(self, img: np.ndarray) -> tuple[bool, float]:
        """
        Detect if document contains a face
        Returns: (face_detected, confidence)
        """
        try:
            # Use OpenCV Haar Cascade for face detection
            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            if len(faces) > 0:
                # Calculate confidence based on face size relative to image
                largest_face = max(faces, key=lambda f: f[2] * f[3])
                face_area = largest_face[2] * largest_face[3]
                img_area = img.shape[0] * img.shape[1]
                confidence = min(face_area / img_area * 10, 1.0)
                return True, confidence
            
            return False, 0.0
            
        except Exception as e:
            return False, 0.0
    
    def extract_text(self, document_path: str) -> Dict:
        """
        Extract text from document using OCR (placeholder)
        In production, would use Tesseract or cloud OCR
        """
        return {
            'text_detected': False,
            'text': '',
            'message': 'OCR not implemented - would use Tesseract/AWS Textract in production'
        }
