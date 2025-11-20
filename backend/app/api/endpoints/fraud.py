from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from app.services.fraud_detector import FraudDetector
from datetime import datetime

router = APIRouter()

# Initialize fraud detector
fraud_detector = FraudDetector()

class DeviceInfo(BaseModel):
    device_id: Optional[str] = "unknown"
    ip_address: Optional[str] = "0.0.0.0"
    user_agent: Optional[str] = None
    using_vpn: bool = False
    is_emulator: bool = False
    is_rooted: bool = False
    device_mismatch: bool = False

class VerificationData(BaseModel):
    face_match: Dict
    liveness: Dict

class FraudScoreRequest(BaseModel):
    user_id: str
    device_info: DeviceInfo
    verification_data: VerificationData

@router.post("/score")
async def calculate_fraud_score(request: FraudScoreRequest):
    """
    Calculate fraud risk score for a verification attempt
    
    Analyzes:
    - Attempt frequency
    - Time patterns
    - Device signals
    - Verification quality
    - Blacklist status
    
    Returns risk score (0-100) and recommendation
    """
    
    try:
        # Calculate risk score
        result = fraud_detector.calculate_risk_score(
            user_id=request.user_id,
            device_info=request.device_info.dict(),
            verification_data=request.verification_data.dict()
        )
        
        # Add metadata
        result['timestamp'] = datetime.utcnow().isoformat()
        result['user_id'] = request.user_id
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_user_history(user_id: str):
    """
    Get verification attempt history for a user
    
    Returns:
    - Total attempts
    - Recent attempt counts
    - Last attempt time
    - Blacklist status
    """
    
    try:
        history = fraud_detector.get_user_history(user_id)
        return history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/blacklist/add")
async def add_to_blacklist(
    user_id: Optional[str] = None,
    device_info: Optional[DeviceInfo] = None
):
    """
    Add user or device to blacklist
    
    Blacklisted users/devices will automatically get CRITICAL risk score
    """
    
    try:
        if not user_id and not device_info:
            raise HTTPException(
                status_code=400, 
                detail="Must provide user_id or device_info"
            )
        
        fraud_detector.add_to_blacklist(
            user_id=user_id,
            device_info=device_info.dict() if device_info else None
        )
        
        return {
            "success": True,
            "message": "Added to blacklist",
            "user_id": user_id,
            "device_blacklisted": device_info is not None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Check if fraud detection service is ready"""
    return {
        "status": "healthy",
        "service": "fraud_detector",
        "ready": True
    }
