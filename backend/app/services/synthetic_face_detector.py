"""
Synthetic Face Detection Service
Detects GAN-generated faces using CNNDetection (ResNet50)
Targets: ThisPersonDoesNotExist, StyleGAN, AI-generated faces
"""
import os
import sys
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import logging

logger = logging.getLogger(__name__)

# Add CNNDetection to path
CNN_DETECTION_PATH = "C:/python/CNNDetection"
sys.path.insert(0, CNN_DETECTION_PATH)

from networks.resnet import resnet50

class SyntheticFaceDetector:
    def __init__(self):
        self.model = None
        self.transform = None
        self.device = 'cpu'
        self.model_path = os.path.join(CNN_DETECTION_PATH, "weights", "blur_jpg_prob0.5.pth")
        self._load_model()
    
    def _load_model(self):
        """Load CNNDetection ResNet50 model"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model not found: {self.model_path}")
            
            self.model = resnet50(num_classes=1)
            state_dict = torch.load(self.model_path, map_location='cpu')
            self.model.load_state_dict(state_dict['model'])
            self.model.eval()
            
            # Transform pipeline
            self.transform = transforms.Compose([
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
            
            logger.info("✅ Synthetic Face Detector loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load synthetic face detector: {e}")
            self.model = None
    
    def detect(self, image_path: str) -> dict:
        """
        Detect if face is synthetic/AI-generated
        
        Args:
            image_path: Path to face image
            
        Returns:
            dict with is_synthetic, confidence, details
        """
        if self.model is None:
            return {
                "is_synthetic": None,
                "confidence": 0.0,
                "error": "Model not loaded"
            }
        
        try:
            # Load and transform image
            img = Image.open(image_path).convert('RGB')
            img_tensor = self.transform(img).unsqueeze(0)
            
            # Inference
            with torch.no_grad():
                prob = self.model(img_tensor).sigmoid().item()
            
            # Threshold: >50% = synthetic
            is_synthetic = prob > 0.5
            
            return {
                "is_synthetic": is_synthetic,
                "confidence": round(prob * 100, 2),
                "verdict": "SYNTHETIC" if is_synthetic else "REAL",
                "details": {
                    "model": "CNNDetection-ResNet50",
                    "threshold": "50%",
                    "raw_probability": prob
                }
            }
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return {
                "is_synthetic": None,
                "confidence": 0.0,
                "error": str(e)
            }

# Singleton instance
_detector = None

def get_synthetic_face_detector():
    global _detector
    if _detector is None:
        _detector = SyntheticFaceDetector()
    return _detector
