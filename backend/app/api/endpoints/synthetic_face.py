"""
Synthetic Face Detection API Endpoint
Detect AI-generated faces (ThisPersonDoesNotExist, StyleGAN, GANs)
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from app.services.synthetic_face_detector import get_synthetic_face_detector
from app.middleware.jwt_auth import require_jwt_token
from app.utils.audit_logger import audit_logger
import os
import uuid
from datetime import datetime
from typing import Union

router = APIRouter()

UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

@router.post("/verify")
async def verify_synthetic_face(
    request: Request,
    image: UploadFile = File(..., description="Face image to analyze"),
    auth: Union[dict, None] = Depends(require_jwt_token)
):
    """
    Detect AI-generated/synthetic faces using CNNDetection
    
    **Authentication Required:** JWT Bearer token
    
    **Detects:**
    - ThisPersonDoesNotExist faces
    - StyleGAN generated faces
    - GAN-generated portraits
    - AI-synthesized faces
    
    **Returns:**
    - SYNTHETIC: Face is AI-generated
    - REAL: Face is genuine photograph
    """
    client_ip = get_client_ip(request)
    request_id = str(uuid.uuid4())[:8]
    
    # Validate file type
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save temp file
    temp_path = os.path.join(UPLOAD_DIR, f"{request_id}_{image.filename}")
    
    try:
        content = await image.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Run detection
        detector = get_synthetic_face_detector()
        result = detector.detect(temp_path)
        
        # Log attempt
        audit_logger.log_event(
            event_type="synthetic_face_detection",
            user_id=auth.get("sub", "unknown") if auth else "unknown",
            ip_address=client_ip,
            details={
                "request_id": request_id,
                "filename": image.filename,
                "verdict": result.get("verdict", "ERROR"),
                "confidence": result.get("confidence", 0)
            }
        )
        
        return {
            "success": True,
            "request_id": request_id,
            "result": {
                "verdict": result.get("verdict", "ERROR"),
                "is_synthetic": result.get("is_synthetic"),
                "confidence": result.get("confidence", 0),
                "type": "Synthetic Face Detection"
            },
            "details": result.get("details", {}),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.log_event(
            event_type="synthetic_face_error",
            user_id="unknown",
            ip_address=client_ip,
            details={"error": str(e), "request_id": request_id}
        )
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
