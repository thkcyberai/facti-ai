"""
Rate Limiting Middleware with Token Bucket Algorithm
Fixed: Uses time.time() instead of datetime for accurate timing
"""

from fastapi import Request
from fastapi.responses import JSONResponse
from collections import defaultdict
import time
from app.utils.audit_logger import audit_logger


class TokenBucket:
    """Token bucket for rate limiting"""
    
    def __init__(self, capacity: int, refill_rate: float):
        """
        Args:
            capacity: Maximum number of tokens (requests)
            refill_rate: Tokens added per second
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()
    
    def consume(self, tokens: int = 1) -> bool:
        """
        Try to consume tokens
        Returns True if successful, False if not enough tokens
        """
        # Refill tokens based on elapsed time
        now = time.time()
        elapsed = now - self.last_refill
        
        # Add tokens based on elapsed time
        self.tokens = min(
            self.capacity,
            self.tokens + (elapsed * self.refill_rate)
        )
        self.last_refill = now
        
        # Try to consume
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        
        return False


class RateLimiter:
    """Rate limiter using token bucket per IP"""
    
    def __init__(self, requests_per_minute: int = 60):
        """
        Args:
            requests_per_minute: Max requests allowed per minute per IP
        """
        self.requests_per_minute = requests_per_minute
        self.buckets = defaultdict(lambda: TokenBucket(
            capacity=requests_per_minute,
            refill_rate=requests_per_minute / 60.0  # Tokens per second
        ))
        self.last_cleanup = time.time()
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_buckets(self):
        """Periodically clean up inactive IP addresses (every 5 minutes)"""
        now = time.time()
        if now - self.last_cleanup > 300:  # 5 minutes
            # Remove buckets that are full (inactive)
            inactive_ips = [
                ip for ip, bucket in self.buckets.items()
                if bucket.tokens >= bucket.capacity
            ]
            for ip in inactive_ips:
                del self.buckets[ip]
            
            self.last_cleanup = now
    
    def check_rate_limit(self, request: Request) -> tuple[bool, str]:
        """
        Check if request is within rate limit
        Returns: (is_allowed, message)
        """
        ip = self._get_client_ip(request)
        bucket = self.buckets[ip]
        
        # Try to consume a token
        is_allowed = bucket.consume(1)
        
        if not is_allowed:
            # Calculate remaining tokens (for error message)
            remaining = int(bucket.tokens)
            audit_logger.log_rate_limit_exceeded(ip, request.url.path)
            return False, f"Rate limit exceeded. Try again in {60 - remaining} seconds."
        
        # Periodic cleanup
        self._cleanup_old_buckets()
        
        return True, ""


# Global rate limiter instance
rate_limiter = RateLimiter(requests_per_minute=60)


async def rate_limit_middleware(request: Request, call_next):
    """Middleware function to apply rate limiting"""
    
    # Skip rate limiting for health/docs endpoints
    if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    # Check rate limit
    is_allowed, msg = rate_limiter.check_rate_limit(request)
    
    if not is_allowed:
        return JSONResponse(
            status_code=429,
            content={"error": msg},
            headers={"Retry-After": "60"}
        )
    
    # Process request
    response = await call_next(request)
    return response
