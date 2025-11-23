"""
API Key Management Endpoints for KYCShield
Admin endpoints to create, list, and revoke API keys
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.services.api_key_service import APIKeyService
from app.models.api_key import APIKey

router = APIRouter(prefix="/api/v1/keys", tags=["API Keys"])

# Request/Response models
class CreateAPIKeyRequest(BaseModel):
    name: str
    user_id: str
    expires_in_days: Optional[int] = None
    rate_limit_per_minute: int = 60
    ip_whitelist: Optional[str] = None
    notes: Optional[str] = None

class APIKeyResponse(BaseModel):
    id: str
    key_prefix: str
    name: str
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    request_count: int
    rate_limit_per_minute: int
    
    class Config:
        from_attributes = True

class CreateAPIKeyResponse(BaseModel):
    api_key: str  # Plain text key - only shown once!
    key_info: APIKeyResponse

@router.post("/create", response_model=CreateAPIKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    request: CreateAPIKeyRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new API key for a user
    ⚠️ WARNING: The plain text key is only returned once! Save it securely.
    """
    try:
        db_key, plain_key = APIKeyService.create_api_key(
            db=db,
            user_id=request.user_id,
            name=request.name,
            expires_in_days=request.expires_in_days,
            rate_limit_per_minute=request.rate_limit_per_minute,
            ip_whitelist=request.ip_whitelist,
            notes=request.notes
        )
        
        return CreateAPIKeyResponse(
            api_key=plain_key,
            key_info=APIKeyResponse(
                id=str(db_key.id),
                key_prefix=db_key.key_prefix,
                name=db_key.name,
                is_active=db_key.is_active,
                created_at=db_key.created_at,
                expires_at=db_key.expires_at,
                last_used_at=db_key.last_used_at,
                request_count=db_key.request_count,
                rate_limit_per_minute=db_key.rate_limit_per_minute
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create API key: {str(e)}"
        )

@router.get("/list", response_model=List[APIKeyResponse])
async def list_api_keys(
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all API keys (optionally filter by user_id)"""
    query = db.query(APIKey)
    
    if user_id:
        query = query.filter(APIKey.user_id == user_id)
    
    keys = query.all()
    
    return [
        APIKeyResponse(
            id=str(key.id),
            key_prefix=key.key_prefix,
            name=key.name,
            is_active=key.is_active,
            created_at=key.created_at,
            expires_at=key.expires_at,
            last_used_at=key.last_used_at,
            request_count=key.request_count,
            rate_limit_per_minute=key.rate_limit_per_minute
        )
        for key in keys
    ]

@router.post("/revoke/{key_id}", status_code=status.HTTP_200_OK)
async def revoke_api_key(
    key_id: str,
    db: Session = Depends(get_db)
):
    """Revoke (deactivate) an API key"""
    success = APIKeyService.revoke_api_key(db, key_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return {"message": "API key revoked successfully", "key_id": key_id}
