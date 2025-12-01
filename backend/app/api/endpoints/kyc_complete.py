"""
Unified KYC Verification Endpoint
Combines video deepfake, face matching, document fraud, and cross-artifact analysis
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from app.services.video_deepfake_detector import get_detector as get_video_detector
from app.services.face_matcher import FaceMatcher
from app.services.document_fraud_detector import get_detector as get_doc_detector
from app.services.cross_artifact_analyzer import get_analyzer
from app.middleware.jwt_auth import require_jwt_token
from app.middleware.rate_limiter import rate_limiter
from app.utils.audit_logger import audit_logger
from app.utils.beta_usage import log_beta_usage, get_beta_tester_id_from_auth, get_access_code_from_auth
from app.core.database import get_db
import os
import uuid
import time
from datetime import datetime
from typing import Union

router = APIRouter()

UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_VIDEO_SIZE = 50 * 1024 * 1024
MAX_IMAGE_SIZE = 10 * 1024 * 1024


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/verify-complete")
async def verify_kyc_complete(
    request: Request,
    video: UploadFile = File(..., description="Liveness video (MP4)"),
    selfie: UploadFile = File(..., description="Selfie photo for face matching"),
    id_document: UploadFile = File(..., description="ID document"),
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
        audit_logger.log_rate_limit_exceeded(client_ip, "/kyc/verify-complete")
        raise HTTPException(status_code=429, detail=msg)

    if video.content_type not in ['video/mp4', 'video/mpeg', 'video/quicktime']:
        raise HTTPException(status_code=400, detail="Video must be MP4 or MOV format")

    image_types = ['image/jpeg', 'image/jpg', 'image/png']
    if selfie.content_type not in image_types:
        raise HTTPException(status_code=400, detail="Selfie must be JPEG or PNG format")
    if id_document.content_type not in image_types:
        raise HTTPException(status_code=400, detail="ID document must be JPEG or PNG format")

    session_id = str(uuid.uuid4())
    video_path = os.path.join(UPLOAD_DIR, f"{session_id}_video_{video.filename}")
    selfie_path = os.path.join(UPLOAD_DIR, f"{session_id}_selfie_{selfie.filename}")
    doc_path = os.path.join(UPLOAD_DIR, f"{session_id}_doc_{id_document.filename}")

    try:
        video_content = await video.read()
        selfie_content = await selfie.read()
        doc_content = await id_document.read()

        if len(video_content) > MAX_VIDEO_SIZE:
            raise HTTPException(status_code=413, detail=f"Video too large. Max: {MAX_VIDEO_SIZE/(1024*1024)}MB")
        if len(selfie_content) > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail=f"Selfie too large. Max: {MAX_IMAGE_SIZE/(1024*1024)}MB")
        if len(doc_content) > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail=f"Document too large. Max: {MAX_IMAGE_SIZE/(1024*1024)}MB")

        with open(video_path, "wb") as f:
            f.write(video_content)
        with open(selfie_path, "wb") as f:
            f.write(selfie_content)
        with open(doc_path, "wb") as f:
            f.write(doc_content)

        audit_logger.log_verification_request(user_id=user_id, ip_address=client_ip, verification_type="kyc_complete")

        # Run detections
        video_detector = get_video_detector()
        deepfake_result = video_detector.detect(video_path)
        deepfake_time = int((time.time() - start_time) * 1000)

        doc_detector = get_doc_detector()
        document_result = doc_detector.detect(doc_path)

        face_matcher = FaceMatcher()
        face_match_result = face_matcher.verify_faces(selfie_path, doc_path)

        analyzer = get_analyzer()
        correlation_result = analyzer.analyze_correlation(
            video_path=video_path, selfie_path=selfie_path, document_path=doc_path,
            deepfake_result=deepfake_result, face_match_result=face_match_result, document_result=document_result
        )

        overall_verdict = calculate_overall_verdict(deepfake_result, face_match_result, document_result, correlation_result)
        total_time = int((time.time() - start_time) * 1000)

        # Log each service separately for beta testers
        usage_log_ids = {}
        if beta_tester_id:
            # Log deepfake
            usage_log_ids['deepfake'] = log_beta_usage(
                db=db, beta_tester_id=beta_tester_id, verification_type="deepfake",
                verdict=deepfake_result.get('verdict', 'UNKNOWN'), confidence=deepfake_result.get('confidence', 0.0),
                processing_time_ms=deepfake_time, ip_address=client_ip, user_agent=user_agent,
                page_source="unified_kyc", service_type="video_deepfake", access_code=access_code,
                file_content=video_content, file_size=len(video_content), file_type=video.content_type, original_filename=video.filename
            )
            # Log document
            usage_log_ids['document'] = log_beta_usage(
                db=db, beta_tester_id=beta_tester_id, verification_type="document",
                verdict=document_result.get('verdict', 'UNKNOWN'), confidence=document_result.get('confidence', 0.0),
                processing_time_ms=total_time, ip_address=client_ip, user_agent=user_agent,
                page_source="unified_kyc", service_type="document_fraud", access_code=access_code,
                file_content=doc_content, file_size=len(doc_content), file_type=id_document.content_type, original_filename=id_document.filename
            )
            # Log face match
            face_verdict = "MATCH" if face_match_result.get('match', False) else "NO_MATCH"
            face_conf = face_match_result.get('similarity', 0.0)
            if isinstance(face_conf, str): face_conf = 0.0
            usage_log_ids['face_match'] = log_beta_usage(
                db=db, beta_tester_id=beta_tester_id, verification_type="face_match",
                verdict=face_verdict, confidence=face_conf,
                processing_time_ms=total_time, ip_address=client_ip, user_agent=user_agent,
                page_source="unified_kyc", service_type="face_match", access_code=access_code,
                file_content=selfie_content, file_size=len(selfie_content), file_type=selfie.content_type, original_filename=selfie.filename
            )
            # Log overall
            usage_log_ids['overall'] = log_beta_usage(
                db=db, beta_tester_id=beta_tester_id, verification_type="unified_kyc",
                verdict=overall_verdict['verdict'], confidence=overall_verdict['confidence'],
                processing_time_ms=total_time, ip_address=client_ip, user_agent=user_agent,
                page_source="unified_kyc", service_type="unified_overall", access_code=access_code,
                file_size=len(video_content)+len(selfie_content)+len(doc_content), file_type="multi",
                original_filename=f"{video.filename}|{selfie.filename}|{id_document.filename}"
            )

        response = {
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat(),
            'overall_verdict': overall_verdict['verdict'],
            'confidence': overall_verdict['confidence'],
            'risk_score': overall_verdict['risk_score'],
            'pass': overall_verdict['pass'],
            'deepfake_detection': {
                'verdict': deepfake_result.get('verdict', 'UNKNOWN'),
                'is_real': deepfake_result.get('is_real', False),
                'confidence': deepfake_result.get('confidence', 0.0),
                'usage_log_id': usage_log_ids.get('deepfake')
            },
            'face_matching': {
                'match': face_match_result.get('match', False),
                'similarity': face_match_result.get('similarity', 0.0),
                'usage_log_id': usage_log_ids.get('face_match')
            },
            'document_fraud': {
                'verdict': document_result.get('verdict', 'UNKNOWN'),
                'is_genuine': document_result.get('is_genuine', False),
                'confidence': document_result.get('confidence', 0.0),
                'usage_log_id': usage_log_ids.get('document')
            },
            'cross_artifact_analysis': correlation_result,
            'usage_log_ids': usage_log_ids
        }

        audit_logger.log_event(event_type="kyc_complete_result", user_id=user_id, ip_address=client_ip,
            details={"session_id": session_id, "overall_verdict": overall_verdict['verdict'], "pass": overall_verdict['pass']})

        return response

    except HTTPException:
        raise
    except Exception as e:
        audit_logger.log_event(event_type="kyc_complete_error", user_id=user_id, ip_address=client_ip, details={"error": str(e)})
        raise HTTPException(status_code=500, detail=f"KYC verification failed: {str(e)}")

    finally:
        for fp in [video_path, selfie_path, doc_path]:
            try:
                if os.path.exists(fp): os.remove(fp)
            except: pass


def calculate_overall_verdict(deepfake_result, face_match_result, document_result, correlation_result):
    video_real = deepfake_result.get('is_real', False)
    video_conf = deepfake_result.get('confidence', 0.0)
    face_match = face_match_result.get('match', False)
    face_sim = face_match_result.get('similarity', 0.0)
    doc_genuine = document_result.get('is_genuine', False)
    doc_conf = document_result.get('confidence', 0.0)
    prokyc = correlation_result.get('prokyc_signature_detected', False)
    corr_score = correlation_result.get('correlation_score', 0.0)
    risk = correlation_result.get('risk_level', 'LOW')

    if prokyc:
        return {'verdict': 'FAIL', 'confidence': 0.95, 'risk_score': corr_score, 'pass': False, 'reason': 'ProKYC detected'}
    if not video_real and video_conf > 0.90:
        return {'verdict': 'FAIL', 'confidence': video_conf, 'risk_score': 1.0-video_conf, 'pass': False, 'reason': 'Deepfake detected'}
    if not doc_genuine and doc_conf > 0.90:
        return {'verdict': 'FAIL', 'confidence': doc_conf, 'risk_score': 1.0-doc_conf, 'pass': False, 'reason': 'Fraudulent document'}
    if not face_match:
        return {'verdict': 'FAIL', 'confidence': 1.0-face_sim, 'risk_score': 1.0-face_sim, 'pass': False, 'reason': 'Face mismatch'}
    if risk == 'HIGH' or corr_score > 0.50:
        return {'verdict': 'SUSPICIOUS', 'confidence': 0.70, 'risk_score': corr_score, 'pass': False, 'reason': 'High risk'}
    if video_conf < 0.70 or doc_conf < 0.70 or face_sim < 0.70:
        return {'verdict': 'SUSPICIOUS', 'confidence': min(video_conf, doc_conf, face_sim), 'risk_score': 1.0-min(video_conf, doc_conf, face_sim), 'pass': False, 'reason': 'Low confidence'}
    if video_real and doc_genuine and face_match:
        avg = (video_conf + doc_conf + face_sim) / 3
        return {'verdict': 'PASS', 'confidence': avg, 'risk_score': 1.0-avg, 'pass': True, 'reason': 'All passed'}
    return {'verdict': 'SUSPICIOUS', 'confidence': 0.50, 'risk_score': 0.50, 'pass': False, 'reason': 'Inconclusive'}


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kyc_complete_verification"}
