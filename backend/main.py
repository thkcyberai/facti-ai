from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.endpoints import auth, document, face_match, liveness, fraud, kyc, kyc_complete, video_deepfake, synthetic_face
from app.middleware.rate_limiter import rate_limit_middleware
from app.middleware.input_validator import input_validation_middleware
import os
load_dotenv()
app = FastAPI(
    title="KYCShield API",
    description="AI-Powered Identity Verification with 99.90% Deepfake Detection",
    version="2.0.0",
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
    },
)
# Add security schemes for Swagger UI
from fastapi.openapi.utils import get_openapi
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        },
        "APIKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key"
        }
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema
app.openapi = custom_openapi
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://facti.ai", "https://trusi.ai"],
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
app.include_router(kyc_complete.router, prefix="/api/v1/kyc", tags=["Complete KYC Verification"])
app.include_router(video_deepfake.router, prefix="/api/v1/video-deepfake", tags=["Video Deepfake Detection"])
app.include_router(document.router, prefix="/api/v1/document", tags=["Document Verification"])
app.include_router(face_match.router, prefix="/api/v1/face", tags=["Face Matching"])
app.include_router(liveness.router, prefix="/api/v1/liveness", tags=["Liveness Detection"])
app.include_router(fraud.router, prefix="/api/v1/fraud", tags=["Fraud Detection"])
app.include_router(synthetic_face.router, prefix="/api/v1/synthetic-face", tags=["Synthetic Face Detection"])
@app.get("/")
async def root():
    return {
        "message": "KYCShield API - Complete Identity Verification Platform",
        "status": "online",
        "version": "2.0.0",
        "features": {
            "video_deepfake_detection": "99.90% accuracy",
            "document_fraud_detection": "100% accuracy",
            "face_matching": "96.94% accuracy",
            "synthetic_face_detection": "CNNDetection enabled",
            "prokyc_detection": "enabled",
            "services": [
                "kyc_complete_verification",
                "video_deepfake_detection",
                "document_fraud_detection",
                "synthetic_face_detection",
                "face_matching",
                "kyc_verification",
                "authentication",
                "liveness_detection",
                "fraud_detection"
            ]
        }
    }
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "deepfake_model": "XceptionNet 99.90%",
        "document_fraud_model": "XceptionNet 100%",
        "face_matching": "DeepFace 96.94%",
        "synthetic_face_detection": "CNNDetection ResNet50",
        "prokyc_detection": "enabled"
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
