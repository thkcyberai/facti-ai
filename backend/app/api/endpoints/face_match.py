"""
Face Matching API Endpoint - Secured
Verify if two face images match using DeepFace/FaceNet
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from app.services.face_matcher import FaceMatcher
from app.middleware.api_key_auth import require_api_key
from app.middleware.jwt_auth import require_jwt_token
from app.middleware.rate_limiter import rate_limiter
from app.utils.audit_logger import audit_logger
import os
import uuid
from datetime import datetime
from typing import Union

router = APIRouter()

# Initialize face matcher
face_matcher = FaceMatcher()

# Temporary upload directory
UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/verify")
async def verify_faces(
    request: Request,
    id_photo: UploadFile = File(..., description="ID document photo"),
    selfie: UploadFile = File(..., description="Selfie photo"),
    auth: Union[dict, None] = Depends(require_jwt_token)  # Require authentication
):
    """
    Verify if two face images match
    
    **Authentication Required:** API Key or JWT token
    
    **Upload:** ID photo + selfie → Returns match result
    
    **Security:**
    - Rate limited (60 requests/min per IP)
    - All attempts logged for audit
    - Authentication required
    """
    
    client_ip = get_client_ip(request)
    user_id = auth.get('user_id', 'unknown') if auth else 'unknown'
    
    # Check rate limit
    is_allowed, msg = rate_limiter.check_rate_limit(request)
    if not is_allowed:
        audit_logger.log_rate_limit_exceeded(client_ip, "/face_match/verify")
        raise HTTPException(status_code=429, detail=msg)
    
    # Generate unique filenames
    id_filename = f"{uuid.uuid4()}_{id_photo.filename}"
    selfie_filename = f"{uuid.uuid4()}_{selfie.filename}"
    id_path = os.path.join(UPLOAD_DIR, id_filename)
    selfie_path = os.path.join(UPLOAD_DIR, selfie_filename)
    
    try:
        # Validate file types
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
        if id_photo.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="ID photo must be JPEG or PNG")
        if selfie.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Selfie must be JPEG or PNG")
        
        # Save uploaded files
        with open(id_path, "wb") as f:
            f.write(await id_photo.read())
        
        with open(selfie_path, "wb") as f:
            f.write(await selfie.read())
        
        # Log verification attempt
        audit_logger.log_verification_request(
            user_id=user_id,
            ip_address=client_ip,
            verification_type="face_match"
        )
        
        # Run face matching
        result = face_matcher.verify(id_path, selfie_path)
        
        # Add metadata
        result['timestamp'] = datetime.utcnow().isoformat()
        result['id_filename'] = id_photo.filename
        result['selfie_filename'] = selfie.filename
        
        # Log result
        audit_logger.log_event(
            event_type="face_match_result",
            user_id=user_id,
            ip_address=client_ip,
            details={
                "match": result.get('match', False),
                "confidence": result.get('confidence', 'UNKNOWN'),
                "distance": result.get('distance', None)
            }
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        # Log error
        audit_logger.log_event(
            event_type="face_match_error",
            user_id=user_id,
            ip_address=client_ip,
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=f"Face matching failed: {str(e)}")
        
    finally:
        # Clean up temporary files
        try:
            if os.path.exists(id_path):
                os.remove(id_path)
            if os.path.exists(selfie_path):
                os.remove(selfie_path)
        except:
            pass


@router.get("/health")
async def health_check():
    """
    Check if face matching service is ready
    
    **No authentication required** - Public health check
    """
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
