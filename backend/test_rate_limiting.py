"""Test Rate Limiting - FAST version"""
import requests

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("TESTING RATE LIMITING - RAPID FIRE")
print("=" * 80)

print("\nSending 65 requests as fast as possible...")
blocked_count = 0
success_count = 0

for i in range(65):
    response = requests.get(f"{BASE_URL}/api/v1/kyc/health")
    if response.status_code == 429:
        blocked_count += 1
        if blocked_count == 1:
            print(f"   🚫 First block at request {i+1}")
            print(f"   Response: {response.json()}")
    else:
        success_count += 1

print(f"\n   ✅ Successful: {success_count}")
print(f"   🚫 Blocked: {blocked_count}")

if blocked_count > 0:
    print("\n✅ RATE LIMITING IS WORKING!")
else:
    print("\n❌ Rate limiting NOT working")
