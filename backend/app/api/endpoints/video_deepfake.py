"""
Video Deepfake Detection API Endpoint - Secured
Detect AI-generated/synthetic videos using XceptionNet (99.90% accuracy)
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from app.services.video_deepfake_detector import get_detector
from app.middleware.jwt_auth import require_jwt_token
from app.middleware.rate_limiter import rate_limiter
from app.utils.audit_logger import audit_logger
import os
import uuid
from datetime import datetime
from typing import Union

router = APIRouter()

# Temporary upload directory
UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Max file size: 50MB
MAX_FILE_SIZE = 50 * 1024 * 1024


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/verify")
async def verify_video(
    request: Request,
    video: UploadFile = File(..., description="Video file (MP4, MOV) for deepfake detection"),
    auth: Union[dict, None] = Depends(require_jwt_token)
):
    """
    Detect video deepfakes using AI (XceptionNet model - 99.90% accuracy)

    **Authentication Required:** JWT Bearer token

    **Upload:** Video file → Returns deepfake detection result

    **Detects:**
    - Face2Face attacks
    - FaceSwap attacks
    - Deepfakes
    - NeuralTextures
    - Face-Reenactment

    **Security:**
    - Rate limited (60 requests/min per IP)
    - All attempts logged for audit
    - JWT authentication required
    - File size limit: 50MB
    """

    client_ip = get_client_ip(request)
    user_id = auth.get('user_id', 'unknown') if auth else 'unknown'

    # Check rate limit
    is_allowed, msg = rate_limiter.check_rate_limit(request)
    if not is_allowed:
        audit_logger.log_rate_limit_exceeded(client_ip, "/video-deepfake/verify")
        raise HTTPException(status_code=429, detail=msg)

    # Validate file type
    allowed_types = ['video/mp4', 'video/mpeg', 'video/quicktime']
    if video.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Video must be MP4 or MOV format"
        )

    # Generate unique filename
    filename = f"{uuid.uuid4()}_{video.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        # Read file content
        content = await video.read()
        
        # Validate file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)}MB"
            )

        # Save uploaded file
        with open(file_path, "wb") as f:
            f.write(content)

        # Log verification attempt
        audit_logger.log_verification_request(
            user_id=user_id,
            ip_address=client_ip,
            verification_type="video_deepfake"
        )

        # Get detector and run deepfake detection
        detector = get_detector()
        result = detector.detect(file_path)

        # Add metadata
        result['timestamp'] = datetime.utcnow().isoformat()
        result['filename'] = video.filename
        result['file_size_bytes'] = len(content)

        # Log result
        audit_logger.log_event(
            event_type="video_deepfake_result",
            user_id=user_id,
            ip_address=client_ip,
            details={
                "verdict": result.get('verdict', 'UNKNOWN'),
                "is_real": result.get('is_real', False),
                "confidence": result.get('confidence', 0.0),
                "fake_probability": result.get('fake_probability', 0.0)
            }
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        # Log error
        audit_logger.log_event(
            event_type="video_deepfake_error",
            user_id=user_id,
            ip_address=client_ip,
            details={"error": str(e)}
        )
        raise HTTPException(
            status_code=500, 
            detail=f"Video deepfake detection failed: {str(e)}"
        )

    finally:
        # Clean up temporary file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass


@router.get("/model-info")
async def get_model_info():
    """
    Get information about the video deepfake detection model

    **No authentication required** - Public model information
    """
    detector = get_detector()
    return detector.get_model_info()


@router.get("/health")
async def health_check():
    """
    Check if video deepfake detection service is ready

    **No authentication required** - Public health check
    """
    return {
        "status": "healthy",
        "service": "video_deepfake_detector",
        "model": "XceptionNet",
        "accuracy": "99.90%",
        "security": {
            "authentication": "required",
            "rate_limiting": "enabled",
            "audit_logging": "enabled",
            "max_file_size_mb": MAX_FILE_SIZE / (1024*1024)
        },
        "detects": [
            "Face2Face attacks",
            "FaceSwap attacks",
            "Deepfakes",
            "NeuralTextures",
            "Face-Reenactment"
        ]
    }
