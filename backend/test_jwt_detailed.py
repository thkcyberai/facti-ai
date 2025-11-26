"""
Detailed JWT Debug
"""

import sys
sys.path.insert(0, '.')

from app.services.jwt_service import JWTService
from jose import jwt, JWTError
from datetime import datetime

SECRET_KEY = "your-secret-key-here-change-in-production-use-env-variable"
ALGORITHM = "HS256"

user_data = {"sub": "test-user", "email": "test@example.com"}
access_token = JWTService.create_access_token(data=user_data)

print("Step-by-step verification:")
print("-" * 60)

try:
    # Step 1: Decode
    print("1. Decoding token...")
    payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
    print(f"   Decoded successfully: {payload}")
    
    # Step 2: Check type
    print("\n2. Checking token type...")
    token_type_in_payload = payload.get("type")
    expected_type = "access"
    print(f"   Token type in payload: '{token_type_in_payload}'")
    print(f"   Expected type: '{expected_type}'")
    print(f"   Match: {token_type_in_payload == expected_type}")
    
    # Step 3: Check expiration
    print("\n3. Checking expiration...")
    exp = payload.get("exp")
    print(f"   Expiration timestamp: {exp}")
    exp_datetime = datetime.fromtimestamp(exp)
    now = datetime.utcnow()
    print(f"   Expiration time: {exp_datetime}")
    print(f"   Current time: {now}")
    print(f"   Is expired: {exp_datetime < now}")
    
    print("\n✅ All checks passed!")
    
except JWTError as e:
    print(f"❌ JWTError: {e}")
except Exception as e:
    print(f"❌ Other error: {e}")
    import traceback
    traceback.print_exc()
