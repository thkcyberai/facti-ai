"""
Test the actual verify_token method
"""

import sys
sys.path.insert(0, '.')

from app.services.jwt_service import JWTService

# Create token
user_data = {"sub": "test-user", "email": "test@example.com"}
access_token = JWTService.create_access_token(data=user_data)

print("Testing JWTService.verify_token()...")
print(f"Token: {access_token[:50]}...")
print()

# Test access token
result = JWTService.verify_token(access_token, token_type="access")
print(f"Result: {result}")
print(f"Type: {type(result)}")

if result is None:
    print("\n❌ Returned None - Let's check the service code")
    print("\nChecking service file...")
    with open('app/services/jwt_service.py', 'r') as f:
        content = f.read()
        # Find verify_token method
        if 'def verify_token' in content:
            lines = content.split('\n')
            in_method = False
            for i, line in enumerate(lines):
                if 'def verify_token' in line:
                    in_method = True
                if in_method:
                    print(line)
                    if line.strip() and not line.strip().startswith('#') and 'def ' in line and 'verify_token' not in line:
                        break
else:
    print(f"\n✅ Success! Payload: {result}")
