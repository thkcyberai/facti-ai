from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.face_matcher import FaceMatcher
import os
import uuid
from datetime import datetime

router = APIRouter()

# Initialize face matcher
face_matcher = FaceMatcher()

# Temporary upload directory
UPLOAD_DIR = "uploads/temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/verify")
async def verify_faces(
    id_photo: UploadFile = File(..., description="ID document photo"),
    selfie: UploadFile = File(..., description="Selfie photo")
):
    """
    Verify if two face images match
    
    Upload ID photo + selfie → Returns match result
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
        
        # Run face matching
        result = face_matcher.verify(id_path, selfie_path)
        
        # Add metadata
        result['timestamp'] = datetime.utcnow().isoformat()
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
    """Check if face matching service is ready"""
    return {
        "status": "healthy",
        "service": "face_matcher",
        "model": "Facenet512"
    }
