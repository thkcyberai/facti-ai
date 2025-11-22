from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.endpoints import auth, document, face_match, liveness, fraud, kyc
from app.middleware.rate_limiter import rate_limit_middleware
from app.middleware.input_validator import input_validation_middleware
import os

load_dotenv()

app = FastAPI(
    title="Facti.ai API",
    description="AI-Powered KYC Identity Verification",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://facti.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting - Protect against abuse and DDoS
app.middleware("http")(rate_limit_middleware)

# Input Validation - Validate all uploads and inputs
app.middleware("http")(input_validation_middleware)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(kyc.router, prefix="/api/v1/kyc", tags=["KYC Verification"])
app.include_router(document.router, prefix="/api/v1/document", tags=["Document Verification"])
app.include_router(face_match.router, prefix="/api/v1/face", tags=["Face Matching"])
app.include_router(liveness.router, prefix="/api/v1/liveness", tags=["Liveness Detection"])
app.include_router(fraud.router, prefix="/api/v1/fraud", tags=["Fraud Detection"])

@app.get("/")
async def root():
    return {
        "message": "Facti.ai API - Complete KYC Solution",
        "status": "online",
        "version": "1.0.0",
        "services": [
            "kyc_verification",
            "authentication",
            "document_verification",
            "face_matching",
            "liveness_detection",
            "fraud_detection"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
