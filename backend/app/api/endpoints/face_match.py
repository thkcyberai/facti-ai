"""
Face Matching API Endpoint - Secured
Verify if two face images match using DeepFace/FaceNet
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request, Form
from sqlalchemy.orm import Session
from app.services.face_matcher import FaceMatcher
from app.middleware.api_key_auth import require_api_key
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

face_matcher = FaceMatcher()

UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/verify")
async def verify_faces(
    request: Request,
    id_photo: UploadFile = File(..., description="ID document photo"),
    selfie: UploadFile = File(..., description="Selfie photo"),
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
        audit_logger.log_rate_limit_exceeded(client_ip, "/face_match/verify")
        raise HTTPException(status_code=429, detail=msg)

    id_filename = f"{uuid.uuid4()}_{id_photo.filename}"
    selfie_filename = f"{uuid.uuid4()}_{selfie.filename}"
    id_path = os.path.join(UPLOAD_DIR, id_filename)
    selfie_path = os.path.join(UPLOAD_DIR, selfie_filename)

    try:
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
        if id_photo.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="ID photo must be JPEG or PNG")
        if selfie.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Selfie must be JPEG or PNG")

        id_content = await id_photo.read()
        selfie_content = await selfie.read()

        with open(id_path, "wb") as f:
            f.write(id_content)
        with open(selfie_path, "wb") as f:
            f.write(selfie_content)

        audit_logger.log_verification_request(user_id=user_id, ip_address=client_ip, verification_type="face_match")

        result = face_matcher.verify(id_path, selfie_path)
        processing_time_ms = int((time.time() - start_time) * 1000)

        result['timestamp'] = datetime.utcnow().isoformat()
        result['id_filename'] = id_photo.filename
        result['selfie_filename'] = selfie.filename

        usage_log_id = None
        if beta_tester_id:
            verdict = "MATCH" if result.get('match', False) else "NO_MATCH"
            confidence = result.get('similarity', 0.0)
            if isinstance(confidence, str):
                confidence = 0.0
            usage_log_id = log_beta_usage(
                db=db,
                beta_tester_id=beta_tester_id,
                verification_type="face_match",
                verdict=verdict,
                confidence=confidence,
                processing_time_ms=processing_time_ms,
                ip_address=client_ip,
                user_agent=user_agent,
                page_source=page_source or "dashboard",
                service_type="face_match",
                access_code=access_code,
                file_content=selfie_content,
                file_size=len(selfie_content),
                file_type=selfie.content_type,
                original_filename=selfie.filename
            )
            result['usage_log_id'] = usage_log_id

        audit_logger.log_event(
            event_type="face_match_result",
            user_id=user_id,
            ip_address=client_ip,
            details={
                "match": result.get('match', False),
                "confidence": result.get('confidence', 'UNKNOWN'),
                "distance": result.get('distance', None),
                "usage_log_id": usage_log_id
            }
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        audit_logger.log_event(event_type="face_match_error", user_id=user_id, ip_address=client_ip, details={"error": str(e)})
        raise HTTPException(status_code=500, detail=f"Face matching failed: {str(e)}")

    finally:
        try:
            if os.path.exists(id_path):
                os.remove(id_path)
            if os.path.exists(selfie_path):
                os.remove(selfie_path)
        except:
            pass


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "face_matcher",
        "model": "Facenet512",
        "security": {
            "authentication": "required",
            "rate_limiting": "enabled",
            "audit_logging": "enabled"
        }
    }
