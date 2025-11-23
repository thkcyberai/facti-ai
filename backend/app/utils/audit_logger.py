"""
Audit Logging System for KYCShield API
Tracks security events for compliance (GDPR, SOC 2, ISO 27001)
"""

import logging
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime
from typing import Optional, Dict, Any
import json
from pathlib import Path

class AuditLogger:
    """Centralized audit logging for security events"""

    def __init__(self, log_dir: str = "logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)

        # Create audit log file with daily rotation
        audit_file = self.log_dir / "audit.log"

        self.logger = logging.getLogger("audit")
        self.logger.setLevel(logging.INFO)

        # TimedRotatingFileHandler: rotates daily, keeps 365 days (SOC 2 compliance)
        file_handler = TimedRotatingFileHandler(
            filename=str(audit_file),
            when='midnight',
            interval=1,
            backupCount=365,  # 1 year retention
            encoding='utf-8'
        )
        file_handler.setLevel(logging.INFO)

        # JSON formatter for structured logs
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": %(message)s}'
        )
        file_handler.setFormatter(formatter)

        if not self.logger.handlers:
            self.logger.addHandler(file_handler)

    def log_event(self, event_type: str, user_id: Optional[str],
                   ip_address: str, details: Dict[str, Any]):
        """Log a security audit event"""
        event = {
            "event_type": event_type,
            "user_id": user_id or "anonymous",
            "ip_address": ip_address,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }

        self.logger.info(json.dumps(event))

    def log_authentication(self, user_id: str, ip_address: str, success: bool):
        """Log authentication attempt"""
        self.log_event(
            event_type="authentication",
            user_id=user_id,
            ip_address=ip_address,
            details={"success": success}
        )

    def log_file_upload(self, user_id: Optional[str], ip_address: str,
                       filename: str, file_type: str, size: int):
        """Log file upload event"""
        self.log_event(
            event_type="file_upload",
            user_id=user_id,
            ip_address=ip_address,
            details={
                "filename": filename,
                "file_type": file_type,
                "size_bytes": size
            }
        )

    def log_verification_request(self, user_id: Optional[str], ip_address: str,
                                verification_type: str):
        """Log verification request"""
        self.log_event(
            event_type="verification_request",
            user_id=user_id,
            ip_address=ip_address,
            details={"verification_type": verification_type}
        )

    def log_rate_limit_exceeded(self, ip_address: str, endpoint: str):
        """Log rate limit violation"""
        self.log_event(
            event_type="rate_limit_exceeded",
            user_id=None,
            ip_address=ip_address,
            details={"endpoint": endpoint}
        )

    def log_validation_failure(self, ip_address: str, failure_type: str, details: str):
        """Log input validation failure"""
        self.log_event(
            event_type="validation_failure",
            user_id=None,
            ip_address=ip_address,
            details={
                "failure_type": failure_type,
                "details": details
            }
        )

    def log_security_alert(self, alert_type: str, ip_address: str, details: Dict[str, Any]):
        """Log security alert (XSS, SQL injection attempts, etc.)"""
        self.log_event(
            event_type="security_alert",
            user_id=None,
            ip_address=ip_address,
            details={
                "alert_type": alert_type,
                **details
            }
        )


# Global audit logger instance
audit_logger = AuditLogger()
