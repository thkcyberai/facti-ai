from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.kyc_ensemble import KYCEnsemble
import os
import uuid
from datetime import datetime

router = APIRouter()

# Initialize KYC ensemble
kyc_ensemble = KYCEnsemble()

# Temporary upload directory
UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class DeviceInfo(BaseModel):
    device_id: Optional[str] = "unknown"
    ip_address: Optional[str] = "0.0.0.0"
    user_agent: Optional[str] = None
    using_vpn: bool = False
    is_emulator: bool = False
    is_rooted: bool = False
    device_mismatch: bool = False

@router.post("/verify")
async def verify_kyc(
    user_id: str = Form(...),
    id_photo: UploadFile = File(..., description="ID document photo"),
    selfie: UploadFile = File(..., description="Selfie/video frame"),
    device_id: Optional[str] = Form("unknown"),
    ip_address: Optional[str] = Form("0.0.0.0"),
    using_vpn: bool = Form(False),
    is_emulator: bool = Form(False),
    is_rooted: bool = Form(False)
):
    """
    Complete KYC Verification - Master Endpoint
    
    Combines all verification components:
    1. Document Verification - Validates ID quality
    2. Face Matching - Compares ID photo to selfie
    3. Liveness Detection - Ensures real person
    4. Fraud Scoring - Detects suspicious patterns
    
    Returns: PASS, REVIEW, or FAIL verdict
    """
    
    # Generate unique filenames
    id_filename = f"{uuid.uuid4()}_{id_photo.filename}"
    selfie_filename = f"{uuid.uuid4()}_{selfie.filename}"
    
    id_path = os.path.join(UPLOAD_DIR, id_filename)
    selfie_path = os.path.join(UPLOAD_DIR, selfie_filename)
    
    try:
        # Save uploaded files
        with open(id_path, "wb") as f:
            f.write(await id_photo.read())
        
        with open(selfie_path, "wb") as f:
            f.write(await selfie.read())
        
        # Build device info
        device_info = {
            'device_id': device_id,
            'ip_address': ip_address,
            'using_vpn': using_vpn,
            'is_emulator': is_emulator,
            'is_rooted': is_rooted,
            'device_mismatch': False
        }
        
        # Run complete KYC verification
        result = kyc_ensemble.verify_kyc(
            user_id=user_id,
            id_photo_path=id_path,
            selfie_path=selfie_path,
            device_info=device_info
        )
        
        # Add metadata
        result['timestamp'] = datetime.utcnow().isoformat()
        result['user_id'] = user_id
        result['id_filename'] = id_photo.filename
        result['selfie_filename'] = selfie.filename
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Clean up temporary files
        try:
            if os.path.exists(id_path):
                os.remove(id_path)
            if os.path.exists(selfie_path):
                os.remove(selfie_path)
        except:
            pass

@router.get("/health")
async def health_check():
    """Check if KYC ensemble service is ready"""
    return {
        "status": "healthy",
        "service": "kyc_ensemble",
        "components": [
            "document_verification",
            "face_matching",
            "liveness_detection",
            "fraud_scoring"
        ],
        "ready": True
    }
