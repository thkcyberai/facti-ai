"""
JWT Authentication Middleware for KYCShield
Validates Bearer tokens on incoming requests
"""

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.services.jwt_service import JWTService
from app.utils.audit_logger import audit_logger
from app.core.database import get_db
from app.models.user import User

# Bearer token configuration
bearer_scheme = HTTPBearer(auto_error=False)

class JWTAuth:
    """JWT authentication middleware"""
    
    @staticmethod
    def get_client_ip(request: Request) -> str:
        """Extract client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host
    
    @staticmethod
    async def verify_token(
        request: Request,
        credentials: Optional[HTTPAuthorizationCredentials],
        db: Session
    ) -> dict:
        """
        Verify JWT token from Authorization header
        Returns: dict with user info
        Raises: HTTPException if invalid
        """
        if not credentials:
            audit_logger.log_security_alert(
                alert_type="missing_jwt_token",
                ip_address=JWTAuth.get_client_ip(request),
                details={"endpoint": str(request.url)}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token. Include Authorization: Bearer <token> header.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        token = credentials.credentials
        
        # Verify token
        payload = JWTService.verify_token(token, token_type="access")
        
        if not payload:
            audit_logger.log_security_alert(
                alert_type="invalid_jwt_token",
                ip_address=JWTAuth.get_client_ip(request),
                details={"endpoint": str(request.url)}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Extract user_id from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Verify user exists and is active
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            audit_logger.log_security_alert(
                alert_type="inactive_user_token",
                ip_address=JWTAuth.get_client_ip(request),
                details={"user_id": user_id}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found."
            )
        
        # Log successful authentication
        audit_logger.log_authentication(
            user_id=str(user.id),
            ip_address=JWTAuth.get_client_ip(request),
            success=True
        )
        
        return {
            "user_id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "subscription_tier": user.subscription_tier
        }


# Dependency for FastAPI routes
async def require_jwt_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """FastAPI dependency to require JWT authentication"""
    return await JWTAuth.verify_token(request, credentials, db)
