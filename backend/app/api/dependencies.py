from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from datetime import datetime

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """Get current authenticated user from JWT token - supports both regular users and beta testers"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if this is a beta token
    token_type = payload.get("type")
    
    if token_type == "beta":
        # Beta tester authentication
        tester_id = payload.get("sub")
        access_code = payload.get("access_code")
        
        if not tester_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid beta token"
            )
        
        # Look up beta tester
        result = db.execute(
            text("SELECT * FROM beta_testers WHERE id = :id"),
            {"id": tester_id}
        ).fetchone()
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Beta tester not found"
            )
        
        beta_tester = dict(result._mapping)
        
        # Check if account is active
        if not beta_tester.get('is_active', True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found."
            )
        
        # Check if declined
        if beta_tester.get('declined_at'):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found."
            )
        
        # Check if expired
        expires_at = beta_tester.get('expires_at')
        if expires_at and datetime.utcnow() > expires_at:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Beta access has expired"
            )
        
        # Check if agreements accepted
        terms_accepted = beta_tester.get('terms_accepted_at') is not None
        privacy_accepted = beta_tester.get('privacy_accepted_at') is not None
        nda_accepted = beta_tester.get('nda_accepted_at') is not None
        
        if not (terms_accepted and privacy_accepted and nda_accepted):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must accept all agreements before accessing the dashboard"
            )
        
        # Return a user-like dict for beta testers
        return {
            "id": tester_id,
            "email": beta_tester.get('email', f"beta_{access_code}@kycshield.ai"),
            "is_beta": True,
            "access_code": access_code,
            "name": beta_tester.get('name', 'Beta Tester'),
            "company": beta_tester.get('company'),
            "expires_at": expires_at,
            "is_active": True
        }
    
    else:
        # Regular user authentication
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Return user as dict for consistency
        return {
            "id": str(user.id),
            "email": user.email,
            "is_beta": False,
            "name": getattr(user, 'name', None),
            "company": getattr(user, 'company', None),
            "is_active": getattr(user, 'is_active', True)
        }
