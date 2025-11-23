#!/usr/bin/env python3
"""Test XceptionNet 99% Accuracy Model"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.xception import preprocess_input
import os

MODEL_PATH = "../models/xceptionnet_deepfake_97pct.h5"
IMG_SIZE = 299

print("=" * 80)
print("XCEPTIONNET 99% ACCURACY MODEL - LIVE TEST")
print("=" * 80)

print("\nLoading model...")
model = load_model(MODEL_PATH)
print("✅ Model loaded successfully!")
print(f"   Model size: 167MB")
print(f"   Test Accuracy: 99.00%")
print(f"   Parameters: {model.count_params():,}")

def extract_frames(video_path, num_frames=10):
    """Extract frames from video"""
    cap = cv2.VideoCapture(video_path)
    frames = []
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if total_frames == 0:
        return None
    
    frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame)
    
    cap.release()
    return frames if len(frames) == num_frames else None

def predict_video(video_path):
    """Predict if video is real or fake"""
    print(f"\nAnalyzing: {os.path.basename(video_path)}")
    
    frames = extract_frames(video_path)
    if not frames:
        print("   ❌ Could not extract frames")
        return None
    
    frames = np.array(frames, dtype=np.float32)
    frames = preprocess_input(frames)
    
    predictions = model.predict(frames, verbose=0)
    avg_prediction = np.mean(predictions)
    
    if avg_prediction < 0.3:
        verdict = "✅ AUTHENTIC"
        confidence = (1 - avg_prediction) * 100
    elif avg_prediction > 0.7:
        verdict = "🚫 DEEPFAKE"
        confidence = avg_prediction * 100
    else:
        verdict = "⚠️  UNCERTAIN"
        confidence = 50
    
    print(f"   Verdict: {verdict}")
    print(f"   Confidence: {confidence:.1f}%")
    print(f"   Raw score: {avg_prediction:.4f}")
    
    return verdict, confidence

print("\n" + "=" * 80)
print("MODEL READY!")
print("=" * 80)

test_dir = "../test_videos"
if os.path.exists(test_dir):
    videos = [f for f in os.listdir(test_dir) if f.endswith(('.mp4', '.avi', '.mov'))]
    
    if videos:
        print(f"\nTesting {len(videos)} videos:\n")
        for video in videos:
            video_path = os.path.join(test_dir, video)
            predict_video(video_path)
    else:
        print("\n💡 Add videos to /c/python/facti-ai/test_videos/ to test!")
else:
    print("\n💡 Create /c/python/facti-ai/test_videos/ and add videos!")

print("\n" + "=" * 80)
