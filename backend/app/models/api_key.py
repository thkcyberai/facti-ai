from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timedelta
import uuid
from app.core.database import Base

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # API Key identification
    key_hash = Column(String, unique=True, nullable=False, index=True)  # Hashed API key
    key_prefix = Column(String(12), nullable=False)  # First 12 chars for display (kyc_live_abc1)
    name = Column(String, nullable=False)  # Client-friendly name (e.g., "Production Server")
    
    # Security & lifecycle
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # NULL = never expires
    last_used_at = Column(DateTime, nullable=True)
    
    # Rate limiting & usage tracking
    request_count = Column(Integer, default=0)  # Total requests made with this key
    rate_limit_per_minute = Column(Integer, default=60)  # Requests per minute allowed
    
    # Metadata
    ip_whitelist = Column(String, nullable=True)  # Comma-separated IPs (optional)
    notes = Column(String, nullable=True)  # Admin notes
