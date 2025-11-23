"""
API Key Authentication Middleware for KYCShield
Validates API keys on incoming requests
"""

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from app.services.api_key_service import APIKeyService
from app.utils.audit_logger import audit_logger
from app.core.database import get_db

# Header configuration
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

class APIKeyAuth:
    """API Key authentication middleware"""
    
    @staticmethod
    def get_client_ip(request: Request) -> str:
        """Extract client IP from request"""
        # Check X-Forwarded-For header (if behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host
    
    @staticmethod
    async def verify_api_key(request: Request, db: Session) -> dict:
        """
        Verify API key from request headers
        Returns: dict with user_id and api_key info
        Raises: HTTPException if invalid
        """
        # Get API key from header
        api_key = request.headers.get("X-API-Key")
        
        if not api_key:
            audit_logger.log_security_alert(
                alert_type="missing_api_key",
                ip_address=APIKeyAuth.get_client_ip(request),
                details={"endpoint": str(request.url)}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing API key. Include X-API-Key header."
            )
        
        # Validate API key
        db_key = APIKeyService.validate_api_key(db, api_key)
        
        if not db_key:
            audit_logger.log_security_alert(
                alert_type="invalid_api_key",
                ip_address=APIKeyAuth.get_client_ip(request),
                details={
                    "endpoint": str(request.url),
                    "key_prefix": api_key[:12] if len(api_key) >= 12 else "invalid"
                }
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired API key."
            )
        
        # Check IP whitelist
        client_ip = APIKeyAuth.get_client_ip(request)
        if not APIKeyService.check_ip_whitelist(db_key, client_ip):
            audit_logger.log_security_alert(
                alert_type="ip_not_whitelisted",
                ip_address=client_ip,
                details={
                    "endpoint": str(request.url),
                    "key_name": db_key.name,
                    "allowed_ips": db_key.ip_whitelist
                }
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="IP address not whitelisted for this API key."
            )
        
        # Log successful authentication
        audit_logger.log_authentication(
            user_id=str(db_key.user_id),
            ip_address=client_ip,
            success=True
        )
        
        return {
            "user_id": str(db_key.user_id),
            "api_key_id": str(db_key.id),
            "api_key_name": db_key.name,
            "rate_limit": db_key.rate_limit_per_minute
        }


# Dependency for FastAPI routes
async def require_api_key(request: Request, db: Session = Depends(get_db)):
    """FastAPI dependency to require API key authentication"""
    return await APIKeyAuth.verify_api_key(request, db)
