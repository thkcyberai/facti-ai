"""
Security Headers Middleware for KYCShield
Adds security headers to protect data in transit
Implements OWASP recommendations
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Prevent clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Enable browser XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Enforce HTTPS (Strict Transport Security)
        # Only enable in production with HTTPS!
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Content Security Policy - Restrict resource loading
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        
        # Referrer Policy - Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy - Control browser features
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "accelerometer=()"
        )
        
        return response


# CORS Configuration (Cross-Origin Resource Sharing)
CORS_CONFIG = {
    "allow_origins": [
        "https://trusi.ai",
        "https://www.trusi.ai",
        "https://kycshield.com",  # Your future domain
        # Add more trusted origins as needed
    ],
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": [
        "Authorization",
        "Content-Type",
        "X-API-Key",
        "X-Requested-With"
    ],
    "expose_headers": ["X-Request-ID"],
    "max_age": 600  # Cache preflight requests for 10 minutes
}
