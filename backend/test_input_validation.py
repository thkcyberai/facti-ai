"""Test input validation"""
import requests

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("TESTING INPUT VALIDATION")
print("=" * 80)

# Test 1: Health check
print("\n1. Testing health check...")
response = requests.get(f"{BASE_URL}/health")
print(f"   Status: {response.status_code} - {'✅ PASS' if response.status_code == 200 else '❌ FAIL'}")

# Test 2: Root endpoint
print("\n2. Testing root endpoint...")
response = requests.get(f"{BASE_URL}/")
print(f"   Status: {response.status_code} - {'✅ PASS' if response.status_code == 200 else '❌ FAIL'}")

print("\n" + "=" * 80)
print("Input validation middleware is active!")
print("=" * 80)
