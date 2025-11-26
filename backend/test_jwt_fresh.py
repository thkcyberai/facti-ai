"""
Fresh JWT test - forces module reload
"""

import sys
import importlib

# Clear any cached imports
if 'app.services.jwt_service' in sys.modules:
    del sys.modules['app.services.jwt_service']

sys.path.insert(0, '.')

from app.services.jwt_service import JWTService

# Create token
user_data = {"sub": "test-user", "email": "test@example.com"}
access_token = JWTService.create_access_token(data=user_data)

print("Fresh test with reloaded module...")
print(f"Token: {access_token[:50]}...")

# Test verification
result = JWTService.verify_token(access_token, token_type="access")

if result:
    print(f"\n✅ SUCCESS! Payload: {result}")
else:
    print(f"\n❌ Still returning None")
    print("Let me check if @staticmethod is actually in the file...")
    with open('app/services/jwt_service.py', 'r') as f:
        lines = f.readlines()
        for i, line in enumerate(lines[70:80], start=70):
            print(f"{i}: {line.rstrip()}")
