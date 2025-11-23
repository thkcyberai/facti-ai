"""
Authentication Endpoints for KYCShield
Handles user registration, login, and token refresh
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from app.core.database import get_db
from app.services.jwt_service import JWTService
from app.models.user import User
from app.utils.audit_logger import audit_logger
import uuid

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# Request/Response models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
    subscription_tier: str = "free"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes in seconds

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: str
    subscription_tier: str
    is_active: bool
    
    class Config:
        from_attributes = True

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user
    Creates user account with hashed password
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = JWTService.hash_password(request.password)
    
    # Create new user
    new_user = User(
        id=uuid.uuid4(),
        email=request.email,
        password_hash=password_hash,
        full_name=request.full_name,
        company_name=request.company_name,
        subscription_tier=request.subscription_tier,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log registration
    audit_logger.log_event(
        event_type="user_registration",
        user_id=str(new_user.id),
        ip_address="0.0.0.0",  # TODO: Extract from request
        details={"email": new_user.email, "company": new_user.company_name}
    )
    
    return UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        company_name=new_user.company_name,
        subscription_tier=new_user.subscription_tier,
        is_active=new_user.is_active
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    User login
    Returns JWT access token and refresh token
    """
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        audit_logger.log_authentication(
            user_id=request.email,
            ip_address="0.0.0.0",  # TODO: Extract from request
            success=False
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not JWTService.verify_password(request.password, user.password_hash):
        audit_logger.log_authentication(
            user_id=str(user.id),
            ip_address="0.0.0.0",  # TODO: Extract from request
            success=False
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Create tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "subscription_tier": user.subscription_tier
    }
    
    access_token = JWTService.create_access_token(data=token_data)
    refresh_token = JWTService.create_refresh_token(data={"sub": str(user.id)})
    
    # Log successful login
    audit_logger.log_authentication(
        user_id=str(user.id),
        ip_address="0.0.0.0",  # TODO: Extract from request
        success=True
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=1800  # 30 minutes
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token
    Uses refresh token to generate new access token
    """
    # Verify refresh token
    payload = JWTService.verify_token(request.refresh_token, token_type="refresh")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Verify user exists and is active
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "subscription_tier": user.subscription_tier
    }
    
    access_token = JWTService.create_access_token(data=token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=request.refresh_token,  # Return same refresh token
        token_type="bearer",
        expires_in=1800
    )
