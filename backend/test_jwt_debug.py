"""
Debug JWT Token Issue
"""

import sys
sys.path.insert(0, '.')

from app.services.jwt_service import JWTService

print("Testing JWT token creation and verification...")

# Create token
user_data = {
    "sub": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com"
}

print("\n1. Creating access token...")
access_token = JWTService.create_access_token(data=user_data)
print(f"Token created: {access_token[:50]}...")

print("\n2. Decoding token (no verification)...")
decoded = JWTService.decode_token(access_token)
print(f"Decoded payload: {decoded}")

print("\n3. Verifying token...")
try:
    payload = JWTService.verify_token(access_token, token_type="access")
    print(f"Verification result: {payload}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
