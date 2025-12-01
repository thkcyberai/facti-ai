"""
Video Deepfake Detection API Endpoint - Secured
Detect AI-generated/synthetic videos using XceptionNet (99.90% accuracy)
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request, Form
from sqlalchemy.orm import Session
from app.services.video_deepfake_detector import get_detector
from app.middleware.jwt_auth import require_jwt_token
from app.middleware.rate_limiter import rate_limiter
from app.utils.audit_logger import audit_logger
from app.utils.beta_usage import log_beta_usage, get_beta_tester_id_from_auth, get_access_code_from_auth
from app.core.database import get_db
import os
import uuid
import time
from datetime import datetime
from typing import Union, Optional

router = APIRouter()

UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 50 * 1024 * 1024


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/verify")
async def verify_video(
    request: Request,
    video: UploadFile = File(..., description="Video file (MP4, MOV) for deepfake detection"),
    page_source: Optional[str] = Form(default="dashboard"),
    auth: Union[dict, None] = Depends(require_jwt_token),
    db: Session = Depends(get_db)
):
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "unknown")
    user_id = auth.get('user_id', 'unknown') if auth else 'unknown'
    beta_tester_id = get_beta_tester_id_from_auth(auth)
    access_code = get_access_code_from_auth(auth)
    start_time = time.time()

    is_allowed, msg = rate_limiter.check_rate_limit(request)
    if not is_allowed:
        audit_logger.log_rate_limit_exceeded(client_ip, "/video-deepfake/verify")
        raise HTTPException(status_code=429, detail=msg)

    allowed_types = ['video/mp4', 'video/mpeg', 'video/quicktime']
    if video.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Video must be MP4 or MOV format")

    filename = f"{uuid.uuid4()}_{video.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        content = await video.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)}MB")

        with open(file_path, "wb") as f:
            f.write(content)

        audit_logger.log_verification_request(user_id=user_id, ip_address=client_ip, verification_type="video_deepfake")

        detector = get_detector()
        result = detector.detect(file_path)
        processing_time_ms = int((time.time() - start_time) * 1000)

        result['timestamp'] = datetime.utcnow().isoformat()
        result['filename'] = video.filename
        result['file_size_bytes'] = len(content)

        usage_log_id = None
        if beta_tester_id:
            usage_log_id = log_beta_usage(
                db=db,
                beta_tester_id=beta_tester_id,
                verification_type="deepfake",
                verdict=result.get('verdict', 'UNKNOWN'),
                confidence=result.get('confidence', 0.0),
                processing_time_ms=processing_time_ms,
                ip_address=client_ip,
                user_agent=user_agent,
                page_source=page_source or "dashboard",
                service_type="video_deepfake",
                access_code=access_code,
                file_content=content,
                file_size=len(content),
                file_type=video.content_type,
                original_filename=video.filename
            )
            result['usage_log_id'] = usage_log_id

        audit_logger.log_event(
            event_type="video_deepfake_result",
            user_id=user_id,
            ip_address=client_ip,
            details={
                "verdict": result.get('verdict', 'UNKNOWN'),
                "is_real": result.get('is_real', False),
                "confidence": result.get('confidence', 0.0),
                "fake_probability": result.get('fake_probability', 0.0),
                "usage_log_id": usage_log_id
            }
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        audit_logger.log_event(event_type="video_deepfake_error", user_id=user_id, ip_address=client_ip, details={"error": str(e)})
        raise HTTPException(status_code=500, detail=f"Video deepfake detection failed: {str(e)}")

    finally:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass


@router.get("/model-info")
async def get_model_info():
    detector = get_detector()
    return detector.get_model_info()


@router.get("/health")
async def health_check():
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
        "detects": ["Face2Face attacks", "FaceSwap attacks", "Deepfakes", "NeuralTextures", "Face-Reenactment"]
    }
