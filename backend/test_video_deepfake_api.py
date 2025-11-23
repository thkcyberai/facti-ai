"""Test Video Deepfake Detection API"""
import requests

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("TESTING VIDEO DEEPFAKE DETECTION API")
print("=" * 80)

# Test 1: Health check
print("\n1. Health check...")
response = requests.get(f"{BASE_URL}/api/v1/video-deepfake/health")
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")

# Test 2: Upload a REAL video
print("\n2. Testing with REAL video (004.mp4)...")
video_path = "C:/python/facti-ai/validation_videos/original_sequences/youtube/c23/videos/004.mp4"

with open(video_path, 'rb') as f:
    files = {'video': ('test_real.mp4', f, 'video/mp4')}
    response = requests.post(f"{BASE_URL}/api/v1/video-deepfake/detect", files=files)

print(f"   Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"   Verdict: {result['verdict']}")
    print(f"   Confidence: {result['confidence']}%")
    print(f"   Model: {result['model_info']['name']} ({result['model_info']['accuracy']})")
else:
    print(f"   Error: {response.text}")

# Test 3: Upload a FAKE video
print("\n3. Testing with FAKE video (004_982.mp4)...")
fake_path = "C:/python/facti-ai/validation_videos/manipulated_sequences/Deepfakes/c23/videos/004_982.mp4"

with open(fake_path, 'rb') as f:
    files = {'video': ('test_fake.mp4', f, 'video/mp4')}
    response = requests.post(f"{BASE_URL}/api/v1/video-deepfake/detect", files=files)

print(f"   Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"   Verdict: {result['verdict']}")
    print(f"   Confidence: {result['confidence']}%")
    print(f"   Frames analyzed: {result['analysis']['frames_analyzed']}")
else:
    print(f"   Error: {response.text}")

print("\n" + "=" * 80)
print("API TEST COMPLETE!")
print("=" * 80)
