"""
Download MiniFASNet pre-trained liveness detection model
"""

import os
import urllib.request

MODEL_DIR = "models/liveness"
os.makedirs(MODEL_DIR, exist_ok=True)

# MiniFASNet ONNX model (lightweight, accurate)
MODEL_URL = "https://github.com/minivision-ai/Silent-Face-Anti-Spoofing/raw/master/resources/anti_spoof_models/2.7_80x80_MiniFASNetV2.pth"
MODEL_PATH = os.path.join(MODEL_DIR, "MiniFASNetV2.pth")

print("Downloading MiniFASNet liveness detection model...")
print(f"URL: {MODEL_URL}")
print(f"Saving to: {MODEL_PATH}")

try:
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print(f"\n✓ Model downloaded successfully!")
    print(f"  Size: {os.path.getsize(MODEL_PATH) / 1024:.2f} KB")
    print(f"  Location: {MODEL_PATH}")
except Exception as e:
    print(f"\n✗ Download failed: {e}")
    print("\nAlternative: We'll use a simpler approach with OpenCV")

print("\nDone!")
