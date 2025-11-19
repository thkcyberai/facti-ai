from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.endpoints import auth, face_match
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

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(face_match.router, prefix="/api/v1/face", tags=["Face Matching"])

@app.get("/")
async def root():
    return {
        "message": "Facti.ai API",
        "status": "online",
        "version": "1.0.0",
        "services": ["authentication", "face_matching"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
