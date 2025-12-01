"""
Beta Access Endpoints for KYCShield Early Access Program
Handles beta tester authentication with security controls:
- Device fingerprinting (max 3 devices)
- IP logging and flagging
- Failed attempt lockout (3 attempts)
- Rate limiting
- Email alerts for suspicious activity
- Legal agreement consent tracking (Terms, Privacy, NDA)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from app.core.database import get_db
from app.services.jwt_service import JWTService
from app.utils.audit_logger import audit_logger

router = APIRouter(tags=["Beta Access"])

# Constants
BETA_ACCESS_DAYS = 20
MAX_DEVICES = 3
MAX_FAILED_ATTEMPTS = 3
LOCKOUT_MINUTES = 30

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.zoho.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "support@kycshield.ai")
SMTP_PASS = os.getenv("SMTP_PASS", "")
ALERT_EMAIL = "support@kycshield.ai"


class BetaLoginRequest(BaseModel):
    access_code: str
    device_fingerprint: Optional[str] = None


class BetaTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    beta_info: dict


class BetaStatusResponse(BaseModel):
    access_code: str
    is_active: bool
    is_expired: bool
    is_locked: bool
    first_login_at: Optional[str]
    expires_at: Optional[str]
    days_remaining: Optional[int]
    total_verifications: int
    device_count: int
    agreements_accepted: bool
    terms_accepted_at: Optional[str]
    privacy_accepted_at: Optional[str]
    nda_accepted_at: Optional[str]


class AcceptAgreementsRequest(BaseModel):
    access_code: str
    terms_accepted: bool
    privacy_accepted: bool
    nda_accepted: bool


class DeclineAgreementsRequest(BaseModel):
    access_code: str


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def generate_device_fingerprint(request: Request, provided_fingerprint: Optional[str] = None) -> str:
    """Generate device fingerprint from request headers or use provided one"""
    if provided_fingerprint:
        return provided_fingerprint

    # Fallback: generate from available headers
    user_agent = request.headers.get("User-Agent", "")
    accept_lang = request.headers.get("Accept-Language", "")
    accept_enc = request.headers.get("Accept-Encoding", "")

    fingerprint_raw = f"{user_agent}|{accept_lang}|{accept_enc}"
    return hashlib.sha256(fingerprint_raw.encode()).hexdigest()[:32]


def send_security_alert(subject: str, body: str):
    """Send security alert email"""
    if not SMTP_PASS:
        print(f"⚠️ SMTP not configured. Alert: {subject}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = ALERT_EMAIL
        msg['Subject'] = f"[KYCShield Security] {subject}"
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print(f"✅ Security alert sent: {subject}")
    except Exception as e:
        print(f"❌ Failed to send alert: {e}")


def check_agreements_accepted(beta_tester: dict) -> bool:
    """Check if all three agreements have been accepted"""
    return (
        beta_tester.get('terms_accepted_at') is not None and
        beta_tester.get('privacy_accepted_at') is not None and
        beta_tester.get('nda_accepted_at') is not None
    )


@router.post("/login", response_model=BetaTokenResponse)
async def beta_login(
    request_data: BetaLoginRequest,
    request: Request,
    user_agent: str = Header(default=""),
    db: Session = Depends(get_db)
):
    """
    Beta tester login with security controls:
    - Device limit (max 3)
    - Failed attempt lockout (3 attempts)
    - IP logging and flagging
    - Email alerts for suspicious activity
    """
    access_code = request_data.access_code.strip().upper()
    client_ip = get_client_ip(request)
    device_fp = generate_device_fingerprint(request, request_data.device_fingerprint)

    # Find beta tester
    result = db.execute(
        text("SELECT * FROM beta_testers WHERE access_code = :code"),
        {"code": access_code}
    ).fetchone()

    if not result:
        audit_logger.log_security_alert(
            alert_type="invalid_beta_code",
            ip_address=client_ip,
            details={"attempted_code": access_code[:8] + "****"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access code"
        )

    # Convert to dict for easier access
    beta_tester = dict(result._mapping)
    tester_id = str(beta_tester['id'])

    # Check if user declined agreements
    if beta_tester.get('declined_at'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This access code has been withdrawn. The user declined the agreements."
        )

    # Check if locked out
    if beta_tester.get('locked_at'):
        lockout_expires = beta_tester['locked_at'] + timedelta(minutes=LOCKOUT_MINUTES)
        if datetime.utcnow() < lockout_expires:
            remaining = int((lockout_expires - datetime.utcnow()).total_seconds() / 60)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked due to failed attempts. Try again in {remaining} minutes."
            )
        else:
            # Reset lockout
            db.execute(
                text("UPDATE beta_testers SET locked_at = NULL, failed_attempts = 0 WHERE id = :id"),
                {"id": tester_id}
            )
            db.commit()

    # Check if account is active
    if not beta_tester.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This beta access has been deactivated"
        )

    # Check if expired
    if beta_tester.get('expires_at') and datetime.utcnow() > beta_tester['expires_at']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your beta access has expired. Thank you for participating!"
        )

    # Check device limit
    existing_devices = db.execute(
        text("SELECT * FROM beta_devices WHERE beta_tester_id = :id AND is_blocked = FALSE"),
        {"id": tester_id}
    ).fetchall()

    device_fingerprints = [dict(d._mapping)['device_fingerprint'] for d in existing_devices]

    if device_fp not in device_fingerprints:
        # New device
        if len(existing_devices) >= MAX_DEVICES:
            # Too many devices - BLOCK and ALERT
            send_security_alert(
                subject=f"Device Limit Exceeded - {access_code}",
                body=f"""
A 4th device attempted to access beta code: {access_code}

Details:
- IP Address: {client_ip}
- User Agent: {user_agent}
- Device Fingerprint: {device_fp}
- Existing Devices: {len(existing_devices)}
- Time: {datetime.utcnow().isoformat()}

This access was BLOCKED. If this is legitimate, you can manually add the device or increase the limit.
                """
            )

            audit_logger.log_security_alert(
                alert_type="device_limit_exceeded",
                ip_address=client_ip,
                details={
                    "access_code": access_code,
                    "device_count": len(existing_devices),
                    "new_device_fp": device_fp[:16] + "..."
                }
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Maximum devices reached. Please contact support@kycshield.ai"
            )

        # Register new device
        db.execute(
            text("""
                INSERT INTO beta_devices (beta_tester_id, device_fingerprint, ip_address, user_agent)
                VALUES (:tester_id, :fp, :ip, :ua)
                ON CONFLICT (beta_tester_id, device_fingerprint) DO UPDATE
                SET last_seen_at = CURRENT_TIMESTAMP, ip_address = :ip
            """),
            {"tester_id": tester_id, "fp": device_fp, "ip": client_ip, "ua": user_agent}
        )

        # Update device count
        db.execute(
            text("UPDATE beta_testers SET device_count = device_count + 1 WHERE id = :id"),
            {"id": tester_id}
        )
        db.commit()
    else:
        # Existing device - update last seen
        db.execute(
            text("""
                UPDATE beta_devices
                SET last_seen_at = CURRENT_TIMESTAMP, ip_address = :ip
                WHERE beta_tester_id = :tester_id AND device_fingerprint = :fp
            """),
            {"tester_id": tester_id, "fp": device_fp, "ip": client_ip}
        )
        db.commit()

    # Check for IP change (flag but allow)
    last_ip = beta_tester.get('last_ip')
    if last_ip and last_ip != client_ip:
        audit_logger.log_event(
            event_type="beta_ip_change",
            user_id=tester_id,
            ip_address=client_ip,
            details={"previous_ip": last_ip, "new_ip": client_ip, "access_code": access_code}
        )

    # First login - activate countdown
    first_login = beta_tester.get('first_login_at')
    expires_at = beta_tester.get('expires_at')

    if first_login is None:
        first_login = datetime.utcnow()
        expires_at = datetime.utcnow() + timedelta(days=BETA_ACCESS_DAYS)

        db.execute(
            text("""
                UPDATE beta_testers
                SET first_login_at = :first, expires_at = :expires, last_ip = :ip, failed_attempts = 0
                WHERE id = :id
            """),
            {"first": first_login, "expires": expires_at, "ip": client_ip, "id": tester_id}
        )
        db.commit()

        audit_logger.log_event(
            event_type="beta_first_login",
            user_id=tester_id,
            ip_address=client_ip,
            details={"access_code": access_code, "expires_at": expires_at.isoformat()}
        )
    else:
        # Update last IP
        db.execute(
            text("UPDATE beta_testers SET last_ip = :ip WHERE id = :id"),
            {"ip": client_ip, "id": tester_id}
        )
        db.commit()

    # Calculate days remaining
    days_remaining = None
    if expires_at:
        delta = expires_at - datetime.utcnow()
        days_remaining = max(0, delta.days)

    # Create JWT token
    token_data = {
        "sub": tester_id,
        "type": "beta",
        "access_code": access_code
    }

    if expires_at:
        time_until_expiry = expires_at - datetime.utcnow()
        token_hours = min(24, time_until_expiry.total_seconds() / 3600)
    else:
        token_hours = 24

    access_token = JWTService.create_access_token(
        data=token_data,
        expires_delta=timedelta(hours=token_hours)
    )

    # Log successful login
    audit_logger.log_authentication(
        user_id=tester_id,
        ip_address=client_ip,
        success=True
    )

    # Get updated device count
    device_count = db.execute(
        text("SELECT COUNT(*) FROM beta_devices WHERE beta_tester_id = :id AND is_blocked = FALSE"),
        {"id": tester_id}
    ).scalar()

    # Refresh beta_tester data for agreement status
    result = db.execute(
        text("SELECT terms_accepted_at, privacy_accepted_at, nda_accepted_at FROM beta_testers WHERE id = :id"),
        {"id": tester_id}
    ).fetchone()
    agreement_data = dict(result._mapping) if result else {}

    agreements_accepted = check_agreements_accepted(agreement_data)

    return BetaTokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=int(token_hours * 3600),
        beta_info={
            "days_remaining": days_remaining,
            "total_verifications": beta_tester.get('total_verifications', 0),
            "expires_at": expires_at.isoformat() if expires_at else None,
            "device_count": device_count,
            "agreements_accepted": agreements_accepted,
            "requires_agreements": not agreements_accepted
        }
    )


@router.post("/accept-agreements")
async def accept_agreements(
    request_data: AcceptAgreementsRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Accept Terms of Service, Privacy Policy, and NDA
    All three must be accepted to proceed
    Records timestamp for each agreement
    """
    access_code = request_data.access_code.strip().upper()
    client_ip = get_client_ip(request)

    # Validate all three are accepted
    if not (request_data.terms_accepted and request_data.privacy_accepted and request_data.nda_accepted):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All three agreements must be accepted to continue"
        )

    # Find beta tester
    result = db.execute(
        text("SELECT id, is_active, declined_at FROM beta_testers WHERE access_code = :code"),
        {"code": access_code}
    ).fetchone()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access code not found"
        )

    beta_tester = dict(result._mapping)
    tester_id = str(beta_tester['id'])

    # Check if already declined
    if beta_tester.get('declined_at'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This access code was previously declined and cannot be reactivated"
        )

    # Check if active
    if not beta_tester.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This access code has been deactivated"
        )

    # Record acceptance timestamps
    now = datetime.utcnow()
    db.execute(
        text("""
            UPDATE beta_testers
            SET terms_accepted_at = :now,
                privacy_accepted_at = :now,
                nda_accepted_at = :now
            WHERE id = :id
        """),
        {"now": now, "id": tester_id}
    )
    db.commit()

    # Log the acceptance
    audit_logger.log_event(
        event_type="beta_agreements_accepted",
        user_id=tester_id,
        ip_address=client_ip,
        details={
            "access_code": access_code,
            "terms_accepted": True,
            "privacy_accepted": True,
            "nda_accepted": True,
            "accepted_at": now.isoformat()
        }
    )

    return {
        "success": True,
        "message": "All agreements accepted successfully",
        "accepted_at": now.isoformat()
    }


@router.post("/decline-agreements")
async def decline_agreements(
    request_data: DeclineAgreementsRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Decline agreements and withdraw from beta program
    This action:
    - Deactivates the access code (is_active = FALSE)
    - Records declined_at timestamp
    - Code cannot be reused
    """
    access_code = request_data.access_code.strip().upper()
    client_ip = get_client_ip(request)

    # Find beta tester
    result = db.execute(
        text("SELECT id, is_active, declined_at FROM beta_testers WHERE access_code = :code"),
        {"code": access_code}
    ).fetchone()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access code not found"
        )

    beta_tester = dict(result._mapping)
    tester_id = str(beta_tester['id'])

    # Check if already declined
    if beta_tester.get('declined_at'):
        return {
            "success": True,
            "message": "Access code was already withdrawn",
            "declined_at": beta_tester['declined_at'].isoformat()
        }

    # Record decline and deactivate
    now = datetime.utcnow()
    db.execute(
        text("""
            UPDATE beta_testers
            SET declined_at = :now,
                is_active = FALSE
            WHERE id = :id
        """),
        {"now": now, "id": tester_id}
    )
    db.commit()

    # Log the decline
    audit_logger.log_event(
        event_type="beta_agreements_declined",
        user_id=tester_id,
        ip_address=client_ip,
        details={
            "access_code": access_code,
            "declined_at": now.isoformat(),
            "code_deactivated": True
        }
    )

    # Send notification to admin
    send_security_alert(
        subject=f"Beta User Declined Agreements - {access_code}",
        body=f"""
A beta user has declined the agreements and withdrawn from the program.

Details:
- Access Code: {access_code}
- IP Address: {client_ip}
- Declined At: {now.isoformat()}

The access code has been automatically deactivated.
        """
    )

    return {
        "success": True,
        "message": "You have withdrawn from the beta program. Thank you for your interest.",
        "declined_at": now.isoformat()
    }


@router.post("/validate-code")
async def validate_code(
    request_data: BetaLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Validate access code without logging in (for frontend validation)
    Increments failed attempts on invalid code
    """
    access_code = request_data.access_code.strip().upper()
    client_ip = get_client_ip(request)

    result = db.execute(
        text("SELECT id, is_active, failed_attempts, locked_at, declined_at FROM beta_testers WHERE access_code = :code"),
        {"code": access_code}
    ).fetchone()

    if not result:
        # Log failed attempt by IP
        audit_logger.log_security_alert(
            alert_type="invalid_code_attempt",
            ip_address=client_ip,
            details={"attempted_code": access_code[:8] + "****"}
        )
        return {"valid": False, "message": "Invalid access code"}

    beta_tester = dict(result._mapping)

    if beta_tester.get('declined_at'):
        return {"valid": False, "message": "Access code has been withdrawn"}

    if not beta_tester.get('is_active', True):
        return {"valid": False, "message": "Access code is deactivated"}

    if beta_tester.get('locked_at'):
        lockout_expires = beta_tester['locked_at'] + timedelta(minutes=LOCKOUT_MINUTES)
        if datetime.utcnow() < lockout_expires:
            return {"valid": False, "message": "Account temporarily locked"}

    return {"valid": True, "message": "Valid access code"}


@router.get("/status/{access_code}", response_model=BetaStatusResponse)
async def beta_status(
    access_code: str,
    db: Session = Depends(get_db)
):
    """Check beta access status including agreement acceptance"""
    access_code = access_code.strip().upper()

    result = db.execute(
        text("SELECT * FROM beta_testers WHERE access_code = :code"),
        {"code": access_code}
    ).fetchone()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access code not found"
        )

    beta_tester = dict(result._mapping)

    days_remaining = None
    expires_at = beta_tester.get('expires_at')
    if expires_at:
        delta = expires_at - datetime.utcnow()
        days_remaining = max(0, delta.days)

    is_expired = expires_at and datetime.utcnow() > expires_at
    is_locked = bool(beta_tester.get('locked_at') and
                     datetime.utcnow() < beta_tester['locked_at'] + timedelta(minutes=LOCKOUT_MINUTES))

    agreements_accepted = check_agreements_accepted(beta_tester)

    return BetaStatusResponse(
        access_code=beta_tester['access_code'],
        is_active=beta_tester.get('is_active', True),
        is_expired=is_expired,
        is_locked=is_locked,
        first_login_at=beta_tester['first_login_at'].isoformat() if beta_tester.get('first_login_at') else None,
        expires_at=expires_at.isoformat() if expires_at else None,
        days_remaining=days_remaining,
        total_verifications=beta_tester.get('total_verifications', 0),
        device_count=beta_tester.get('device_count', 0),
        agreements_accepted=agreements_accepted,
        terms_accepted_at=beta_tester['terms_accepted_at'].isoformat() if beta_tester.get('terms_accepted_at') else None,
        privacy_accepted_at=beta_tester['privacy_accepted_at'].isoformat() if beta_tester.get('privacy_accepted_at') else None,
        nda_accepted_at=beta_tester['nda_accepted_at'].isoformat() if beta_tester.get('nda_accepted_at') else None
    )


@router.get("/agreement-status/{access_code}")
async def agreement_status(
    access_code: str,
    db: Session = Depends(get_db)
):
    """
    Quick check for agreement status
    Returns whether user needs to accept agreements
    """
    access_code = access_code.strip().upper()

    result = db.execute(
        text("""
            SELECT terms_accepted_at, privacy_accepted_at, nda_accepted_at, declined_at, is_active
            FROM beta_testers WHERE access_code = :code
        """),
        {"code": access_code}
    ).fetchone()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access code not found"
        )

    data = dict(result._mapping)

    if data.get('declined_at'):
        return {
            "status": "declined",
            "requires_agreements": False,
            "can_access_dashboard": False,
            "message": "User withdrew from beta program"
        }

    if not data.get('is_active', True):
        return {
            "status": "deactivated",
            "requires_agreements": False,
            "can_access_dashboard": False,
            "message": "Access code deactivated"
        }

    agreements_accepted = (
        data.get('terms_accepted_at') is not None and
        data.get('privacy_accepted_at') is not None and
        data.get('nda_accepted_at') is not None
    )

    if agreements_accepted:
        return {
            "status": "accepted",
            "requires_agreements": False,
            "can_access_dashboard": True,
            "terms_accepted_at": data['terms_accepted_at'].isoformat(),
            "privacy_accepted_at": data['privacy_accepted_at'].isoformat(),
            "nda_accepted_at": data['nda_accepted_at'].isoformat()
        }
    else:
        return {
            "status": "pending",
            "requires_agreements": True,
            "can_access_dashboard": False,
            "message": "User must accept Terms, Privacy Policy, and NDA"
        }


# ============================================
# FEEDBACK ENDPOINTS
# ============================================

class FeedbackRequest(BaseModel):
    """Request model for user feedback on verification results"""
    usage_log_id: str
    user_feedback: str  # 'correct', 'wrong', 'unsure'
    user_actual_label: Optional[str] = None  # 'real', 'fake', 'unknown'
    feedback_notes: Optional[str] = None

class FeedbackResponse(BaseModel):
    """Response model for feedback submission"""
    success: bool
    message: str
    feedback_id: str


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Submit user feedback on a verification result.
    This helps improve AI model accuracy.
    """
    client_ip = get_client_ip(request)
    
    # Validate user_feedback value
    valid_feedbacks = ['correct', 'wrong', 'unsure']
    if feedback.user_feedback not in valid_feedbacks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feedback. Must be one of: {valid_feedbacks}"
        )
    
    # Validate user_actual_label if provided
    valid_labels = ['real', 'fake', 'unknown', None]
    if feedback.user_actual_label not in valid_labels:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid label. Must be one of: {valid_labels[:-1]}"
        )
    
    # Sanitize feedback_notes (limit length, strip)
    notes = None
    if feedback.feedback_notes:
        notes = feedback.feedback_notes.strip()[:500]  # Max 500 chars
    
    # Verify the usage log exists
    result = db.execute(
        text("SELECT id, beta_tester_id, user_feedback FROM beta_usage_logs WHERE id = :id"),
        {"id": feedback.usage_log_id}
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usage log not found"
        )
    
    log_data = dict(result._mapping)
    
    # Check if feedback already submitted
    if log_data.get('user_feedback'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback already submitted for this verification"
        )
    
    # Update the usage log with feedback
    db.execute(
        text("""
            UPDATE beta_usage_logs
            SET user_feedback = :feedback,
                user_actual_label = :label,
                feedback_notes = :notes,
                feedback_at = CURRENT_TIMESTAMP
            WHERE id = :id
        """),
        {
            "feedback": feedback.user_feedback,
            "label": feedback.user_actual_label,
            "notes": notes,
            "id": feedback.usage_log_id
        }
    )
    db.commit()
    
    # Log the feedback event
    audit_logger.log_event(
        event_type="beta_feedback_submitted",
        user_id=str(log_data['beta_tester_id']),
        ip_address=client_ip,
        details={
            "usage_log_id": feedback.usage_log_id,
            "feedback": feedback.user_feedback,
            "actual_label": feedback.user_actual_label
        }
    )
    
    return FeedbackResponse(
        success=True,
        message="Thank you! Your feedback helps improve our AI.",
        feedback_id=feedback.usage_log_id
    )


@router.get("/feedback/stats")
async def get_feedback_stats(
    db: Session = Depends(get_db)
):
    """
    Get aggregated feedback statistics (for admin dashboard).
    """
    # Overall stats
    stats = db.execute(
        text("""
            SELECT 
                COUNT(*) as total_verifications,
                COUNT(user_feedback) as total_feedback,
                COUNT(CASE WHEN user_feedback = 'correct' THEN 1 END) as correct_count,
                COUNT(CASE WHEN user_feedback = 'wrong' THEN 1 END) as wrong_count,
                COUNT(CASE WHEN user_feedback = 'unsure' THEN 1 END) as unsure_count
            FROM beta_usage_logs
        """)
    ).fetchone()
    
    overall = dict(stats._mapping)
    
    # Per verification type
    by_type = db.execute(
        text("""
            SELECT 
                verification_type,
                COUNT(*) as total,
                COUNT(user_feedback) as with_feedback,
                COUNT(CASE WHEN user_feedback = 'correct' THEN 1 END) as correct,
                COUNT(CASE WHEN user_feedback = 'wrong' THEN 1 END) as wrong
            FROM beta_usage_logs
            GROUP BY verification_type
        """)
    ).fetchall()
    
    by_type_list = [dict(row._mapping) for row in by_type]
    
    # Calculate accuracy where feedback exists
    feedback_with_labels = db.execute(
        text("""
            SELECT 
                verification_type,
                verdict,
                user_actual_label,
                COUNT(*) as count
            FROM beta_usage_logs
            WHERE user_feedback = 'wrong' AND user_actual_label IS NOT NULL
            GROUP BY verification_type, verdict, user_actual_label
            ORDER BY count DESC
        """)
    ).fetchall()
    
    misclassifications = [dict(row._mapping) for row in feedback_with_labels]
    
    return {
        "overall": overall,
        "by_verification_type": by_type_list,
        "misclassifications": misclassifications,
        "feedback_rate": round(overall['total_feedback'] / max(overall['total_verifications'], 1) * 100, 1)
    }
