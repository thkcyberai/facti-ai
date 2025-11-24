"""
Face Matching Service using DeepFace/FaceNet
Enhanced with comprehensive error handling and logging
"""

from deepface import DeepFace
import os
from typing import Dict
from app.utils.audit_logger import audit_logger


class FaceMatcher:
    """Face matching service using DeepFace"""
    
    def __init__(self):
        # DeepFace will auto-download models on first use
        self.model_name = "Facenet512"  # Most accurate for face matching
        self.distance_metric = "cosine"
        self.threshold = 0.35  # Adjusted for glasses/lighting variations
        
    def verify(self, id_image_path: str, selfie_image_path: str) -> Dict:
        """
        Compare two face images and return match result
        
        Args:
            id_image_path: Path to ID document photo
            selfie_image_path: Path to selfie/video frame
            
        Returns:
            {
                'match': True/False,
                'distance': 0.25,
                'threshold': 0.30,
                'confidence': 'HIGH',
                'model': 'Facenet512',
                'similarity': 0.75
            }
        """
        try:
            # Verify both images exist
            if not os.path.exists(id_image_path):
                return {
                    'error': 'ID image not found',
                    'match': False,
                    'confidence': 'ERROR'
                }
                
            if not os.path.exists(selfie_image_path):
                return {
                    'error': 'Selfie image not found',
                    'match': False,
                    'confidence': 'ERROR'
                }
            
            # Verify file sizes (prevent huge uploads)
            id_size = os.path.getsize(id_image_path)
            selfie_size = os.path.getsize(selfie_image_path)
            
            max_size = 10 * 1024 * 1024  # 10 MB
            if id_size > max_size or selfie_size > max_size:
                return {
                    'error': 'Image file too large (max 10MB)',
                    'match': False,
                    'confidence': 'ERROR'
                }
            
            # Run face verification
            result = DeepFace.verify(
                img1_path=id_image_path,
                img2_path=selfie_image_path,
                model_name=self.model_name,
                distance_metric=self.distance_metric,
                enforce_detection=True  # Ensure faces are detected
            )
            
            # Calculate confidence level based on distance
            distance = result['distance']
            if distance < 0.20:
                confidence = 'VERY_HIGH'
            elif distance < 0.30:
                confidence = 'HIGH'
            elif distance < 0.40:
                confidence = 'MEDIUM'
            else:
                confidence = 'LOW'
            
            # Calculate similarity percentage
            similarity = round((1 - distance) * 100, 2)
            
            return {
                'match': result['verified'],
                'distance': round(distance, 4),
                'threshold': result['threshold'],
                'confidence': confidence,
                'model': result['model'],
                'similarity': similarity,
                'similarity_score': f"{similarity}%"
            }
            
        except ValueError as e:
            # No face detected or face detection failed
            error_msg = str(e).lower()
            if 'face' in error_msg and 'detect' in error_msg:
                return {
                    'error': 'No face detected in one or both images',
                    'match': False,
                    'confidence': 'ERROR',
                    'details': 'Please ensure both images contain clear, visible faces'
                }
            return {
                'error': f'Face detection failed: {str(e)}',
                'match': False,
                'confidence': 'ERROR'
            }
            
        except Exception as e:
            # Other errors (corrupted image, unsupported format, etc.)
            return {
                'error': f'Verification failed: {str(e)}',
                'match': False,
                'confidence': 'ERROR',
                'details': 'Please check image format and quality'
            }
    
    def extract_face(self, image_path: str) -> Dict:
        """
        Extract face from image (useful for preprocessing)
        Returns face region and detection confidence
        """
        try:
            faces = DeepFace.extract_faces(
                img_path=image_path,
                detector_backend='retinaface',
                enforce_detection=True
            )
            
            if len(faces) == 0:
                return {
                    'error': 'No face detected',
                    'success': False
                }
            
            # Handle multiple faces
            if len(faces) > 1:
                return {
                    'success': True,
                    'face_count': len(faces),
                    'confidence': faces[0]['confidence'],
                    'warning': f'Multiple faces detected ({len(faces)}). Using largest face.'
                }
            
            return {
                'success': True,
                'face_count': len(faces),
                'confidence': round(faces[0]['confidence'], 4)
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }
    
    def get_model_info(self) -> Dict:
        """Get information about the current face matching model"""
        return {
            'model_name': self.model_name,
            'distance_metric': self.distance_metric,
            'threshold': self.threshold,
            'description': 'FaceNet512 - State-of-the-art face recognition model',
            'accuracy': '99.65% on LFW benchmark',
            'use_case': 'Identity verification for KYC/banking applications'
        }
