"""
API Key Service for KYCShield
Handles generation, validation, and management of API keys
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.api_key import APIKey

class APIKeyService:
    """Service for API key operations"""
    
    @staticmethod
    def generate_key() -> str:
        """
        Generate a secure API key
        Format: kyc_live_<32 random chars>
        Example: kyc_live_abc123xyz789def456ghi789jkl012
        """
        random_part = secrets.token_urlsafe(24)  # Generates 32 chars
        return f"kyc_live_{random_part}"
    
    @staticmethod
    def hash_key(api_key: str) -> str:
        """Hash API key for secure storage using SHA-256"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    @staticmethod
    def get_key_prefix(api_key: str) -> str:
        """Get first 12 characters for display (kyc_live_abc1)"""
        return api_key[:12]
    
    @staticmethod
    def create_api_key(
        db: Session,
        user_id: str,
        name: str,
        expires_in_days: Optional[int] = None,
        rate_limit_per_minute: int = 60,
        ip_whitelist: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Tuple[APIKey, str]:
        """
        Create a new API key
        Returns: (APIKey model, plain_text_key)
        WARNING: plain_text_key is only returned once!
        """
        # Generate key
        plain_key = APIKeyService.generate_key()
        key_hash = APIKeyService.hash_key(plain_key)
        key_prefix = APIKeyService.get_key_prefix(plain_key)
        
        # Calculate expiration
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        # Create database record
        api_key = APIKey(
            user_id=user_id,
            key_hash=key_hash,
            key_prefix=key_prefix,
            name=name,
            expires_at=expires_at,
            rate_limit_per_minute=rate_limit_per_minute,
            ip_whitelist=ip_whitelist,
            notes=notes
        )
        
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
        
        return api_key, plain_key
    
    @staticmethod
    def validate_api_key(db: Session, api_key: str) -> Optional[APIKey]:
        """
        Validate an API key
        Returns APIKey model if valid, None if invalid
        """
        key_hash = APIKeyService.hash_key(api_key)
        
        # Find key in database
        db_key = db.query(APIKey).filter(
            APIKey.key_hash == key_hash,
            APIKey.is_active == True
        ).first()
        
        if not db_key:
            return None
        
        # Check expiration
        if db_key.expires_at and db_key.expires_at < datetime.utcnow():
            return None
        
        # Update usage stats
        db_key.last_used_at = datetime.utcnow()
        db_key.request_count += 1
        db.commit()
        
        return db_key
    
    @staticmethod
    def revoke_api_key(db: Session, key_id: str) -> bool:
        """Revoke (deactivate) an API key"""
        api_key = db.query(APIKey).filter(APIKey.id == key_id).first()
        if api_key:
            api_key.is_active = False
            db.commit()
            return True
        return False
    
    @staticmethod
    def check_ip_whitelist(api_key: APIKey, ip_address: str) -> bool:
        """Check if IP is whitelisted (if whitelist exists)"""
        if not api_key.ip_whitelist:
            return True  # No whitelist = all IPs allowed
        
        allowed_ips = [ip.strip() for ip in api_key.ip_whitelist.split(',')]
        return ip_address in allowed_ips
