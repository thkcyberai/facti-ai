from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from app.core.database import Base

class Verification(Base):
    __tablename__ = "verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(String)  # 'image', 'document', 'video', 'kyc'
    file_path = Column(String)
    verdict = Column(String)  # 'AUTHENTIC', 'NOT AUTHENTIC', 'UNCERTAIN'
    confidence = Column(Float)
    result_data = Column(JSONB)  # Detailed analysis results
    created_at = Column(DateTime, default=datetime.utcnow)
