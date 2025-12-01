"""
Beta Usage Logging Utility
Logs all verification attempts by beta testers for analytics and feedback collection
"""

import hashlib
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid


def log_beta_usage(
    db: Session,
    beta_tester_id: str,
    verification_type: str,
    verdict: str,
    confidence: float,
    processing_time_ms: int,
    ip_address: str,
    user_agent: str,
    page_source: str = 'dashboard',
    service_type: str = None,
    access_code: str = None,
    file_content: Optional[bytes] = None,
    file_size: Optional[int] = None,
    file_type: Optional[str] = None,
    original_filename: Optional[str] = None
) -> str:
    """
    Log a beta tester's verification attempt.
    
    Args:
        db: Database session
        beta_tester_id: UUID of the beta tester
        verification_type: 'deepfake', 'document', 'face_match', 'unified_kyc'
        verdict: Model's verdict (REAL, FAKE, MATCH, NO_MATCH, etc.)
        confidence: Confidence score 0-100
        processing_time_ms: Time taken in milliseconds
        ip_address: Client IP
        user_agent: Browser user agent
        page_source: 'dashboard' or 'unified_kyc'
        service_type: 'video_deepfake', 'document_fraud', 'face_match', 'unified_overall'
        access_code: Beta tester's access code for easier reporting
        file_content: Raw file bytes (for hash calculation)
        file_size: File size in bytes
        file_type: MIME type or extension
        original_filename: Original uploaded filename
    
    Returns:
        usage_log_id: UUID of the created log entry
    """
    
    # Generate file hash if content provided
    file_hash = None
    if file_content:
        file_hash = hashlib.sha256(file_content).hexdigest()
    
    # Default service_type to verification_type if not provided
    if service_type is None:
        service_type = verification_type
    
    # If access_code not provided, look it up
    if access_code is None:
        result = db.execute(
            text("SELECT access_code FROM beta_testers WHERE id = :id"),
            {"id": beta_tester_id}
        ).fetchone()
        if result:
            access_code = result[0]
    
    # Generate new UUID for the log entry
    log_id = str(uuid.uuid4())
    
    # Insert the usage log
    db.execute(
        text("""
            INSERT INTO beta_usage_logs (
                id, beta_tester_id, verification_type, verdict, confidence,
                processing_time_ms, ip_address, user_agent,
                file_hash, file_size_bytes, file_type, original_filename,
                page_source, service_type, access_code,
                created_at
            ) VALUES (
                :id, :tester_id, :type, :verdict, :confidence,
                :time_ms, :ip, :ua,
                :file_hash, :file_size, :file_type, :filename,
                :page_source, :service_type, :access_code,
                CURRENT_TIMESTAMP
            )
        """),
        {
            "id": log_id,
            "tester_id": beta_tester_id,
            "type": verification_type,
            "verdict": verdict,
            "confidence": confidence,
            "time_ms": processing_time_ms,
            "ip": ip_address,
            "ua": user_agent,
            "file_hash": file_hash,
            "file_size": file_size,
            "file_type": file_type,
            "filename": original_filename,
            "page_source": page_source,
            "service_type": service_type,
            "access_code": access_code
        }
    )
    
    # Update total_verifications count for the beta tester
    db.execute(
        text("""
            UPDATE beta_testers 
            SET total_verifications = total_verifications + 1 
            WHERE id = :tester_id
        """),
        {"tester_id": beta_tester_id}
    )
    
    db.commit()
    
    return log_id


def get_beta_tester_id_from_auth(auth: dict) -> Optional[str]:
    """
    Extract beta_tester_id from auth dict if this is a beta user.
    """
    if auth and auth.get('is_beta'):
        return auth.get('user_id')
    return None


def get_access_code_from_auth(auth: dict) -> Optional[str]:
    """
    Extract access_code from auth dict if this is a beta user.
    """
    if auth and auth.get('is_beta'):
        return auth.get('access_code')
    return None
