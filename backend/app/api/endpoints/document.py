from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.document_verifier import DocumentVerifier
import os
import uuid
from datetime import datetime

router = APIRouter()

# Initialize document verifier
document_verifier = DocumentVerifier()

# Temporary upload directory
UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/verify")
async def verify_document(
    document: UploadFile = File(..., description="ID document image (passport, driver license)")
):
    """
    Verify ID document authenticity and quality
    
    Checks:
    - Image quality (resolution, brightness, sharpness)
    - Face detection
    - Document integrity
    - Forgery indicators
    
    Returns VALID/SUSPICIOUS/INVALID verdict
    """
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}_{document.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as f:
            f.write(await document.read())
        
        # Run document verification
        result = document_verifier.verify(file_path)
        
        # Add metadata
        result['timestamp'] = datetime.utcnow().isoformat()
        result['filename'] = document.filename
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Clean up temporary file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass

@router.get("/health")
async def health_check():
    """Check if document verification service is ready"""
    return {
        "status": "healthy",
        "service": "document_verifier",
        "capabilities": [
            "quality_validation",
            "face_detection",
            "forgery_detection_basic"
        ],
        "ready": True
    }
