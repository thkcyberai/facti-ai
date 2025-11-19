from deepface import DeepFace
import os
from typing import Dict

class FaceMatcher:
    """Face matching service using DeepFace"""
    
    def __init__(self):
        # DeepFace will auto-download models on first use
        self.model_name = "Facenet512"  # Most accurate
        self.distance_metric = "cosine"
        self.threshold = 0.30  # Lower = stricter matching
        
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
                'model': 'Facenet512'
            }
        """
        
        try:
            # Verify both images exist
            if not os.path.exists(id_image_path):
                return {
                    'error': 'ID image not found',
                    'match': False
                }
            
            if not os.path.exists(selfie_image_path):
                return {
                    'error': 'Selfie image not found',
                    'match': False
                }
            
            # Run face verification
            result = DeepFace.verify(
                img1_path=id_image_path,
                img2_path=selfie_image_path,
                model_name=self.model_name,
                distance_metric=self.distance_metric,
                enforce_detection=True  # Ensure faces are detected
            )
            
            # Calculate confidence level
            distance = result['distance']
            if distance < 0.20:
                confidence = 'VERY_HIGH'
            elif distance < 0.30:
                confidence = 'HIGH'
            elif distance < 0.40:
                confidence = 'MEDIUM'
            else:
                confidence = 'LOW'
            
            return {
                'match': result['verified'],
                'distance': round(distance, 4),
                'threshold': result['threshold'],
                'confidence': confidence,
                'model': result['model'],
                'similarity': round(1 - distance, 4)  # Convert to similarity score
            }
            
        except ValueError as e:
            # No face detected
            return {
                'error': f'Face detection failed: {str(e)}',
                'match': False
            }
        except Exception as e:
            # Other errors
            return {
                'error': f'Verification failed: {str(e)}',
                'match': False
            }
    
    def extract_face(self, image_path: str) -> Dict:
        """
        Extract face from image (useful for preprocessing)
        
        Returns face region and embedding
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
            
            return {
                'success': True,
                'face_count': len(faces),
                'confidence': faces[0]['confidence']
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }
