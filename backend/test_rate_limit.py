"""Test rate limiting functionality"""
import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("TESTING RATE LIMITING")
print("=" * 80)
print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
print(f"Target: {BASE_URL}/ (root endpoint)")
print(f"Limit: 60 requests/minute")
print("=" * 80)
print()

success_count = 0
blocked_count = 0

print("Sending 65 RAPID requests (no delay)...")
start_time = time.time()

for i in range(65):
    try:
        response = requests.get(f"{BASE_URL}/", timeout=2)
        
        if response.status_code == 200:
            success_count += 1
            print(f"Request {i+1:2d}: ✅ {response.status_code}")
        elif response.status_code == 429:
            blocked_count += 1
            print(f"Request {i+1:2d}: 🚫 {response.status_code} - RATE LIMITED!")
            print(f"   Response: {response.json()}")
            if blocked_count >= 3:
                print(f"\n✅ Rate limiting is working! Blocked after {success_count} requests.")
                break
        else:
            print(f"Request {i+1:2d}: ⚠️  {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request {i+1:2d}: ❌ Error: {e}")
    
    # NO DELAY - send as fast as possible!

elapsed = time.time() - start_time

print()
print("=" * 80)
print("TEST RESULTS:")
print(f"  Successful: {success_count}")
print(f"  Blocked:    {blocked_count}")
print(f"  Time:       {elapsed:.2f} seconds")
print(f"  Expected:   60 successful, then blocking")
if blocked_count > 0:
    print("  Status:     ✅ RATE LIMITING WORKS!")
else:
    print("  Status:     ⚠️  Rate limiting may not be working")
print("=" * 80)
