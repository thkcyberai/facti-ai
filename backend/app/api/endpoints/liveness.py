from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.liveness_detector import LivenessDetector
import os
import uuid
from datetime import datetime

router = APIRouter()

# Initialize liveness detector
liveness_detector = LivenessDetector()

# Temporary upload directory
UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/detect")
async def detect_liveness(
    image: UploadFile = File(..., description="Image or video frame to check")
):
    """
    Detect if image is from a live person or spoofing attack
    
    Upload image/frame → Returns liveness result
    """
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}_{image.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as f:
            f.write(await image.read())
        
        # Run liveness detection
        result = liveness_detector.detect(file_path)
        
        # Add metadata
        result['timestamp'] = datetime.utcnow().isoformat()
        result['filename'] = image.filename
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Clean up temporary file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass

@router.get("/health")
async def health_check():
    """Check if liveness detection service is ready"""
    return {
        "status": "healthy",
        "service": "liveness_detector",
        "model": "MiniFASNetV2",
        "ready": True
    }
