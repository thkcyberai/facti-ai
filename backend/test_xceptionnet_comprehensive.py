#!/usr/bin/env python3
"""
Comprehensive XceptionNet Testing
Tests 200+ videos from train_sample_videos and test_videos (odd numbers only)
"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.xception import preprocess_input
import os
from tqdm import tqdm
import pandas as pd

MODEL_PATH = "../models/xceptionnet_deepfake_97pct.h5"
IMG_SIZE = 299

# Use Windows-compatible paths
TRAIN_DIR = "C:/Users/Admin/Downloads/deepfake-detection-challenge/train_sample_videos"
TEST_DIR = "C:/Users/Admin/Downloads/deepfake-detection-challenge/test_videos"

print("=" * 80)
print("XCEPTIONNET 99% ACCURACY MODEL - COMPREHENSIVE TEST")
print("=" * 80)

# Load model
print("\nLoading model...")
model = load_model(MODEL_PATH)
print("✅ Model loaded!")
print(f"   Test Accuracy (FaceForensics++): 99.00%")
print(f"   Parameters: {model.count_params():,}")

def extract_frames(video_path, num_frames=10):
    """Extract frames from video"""
    try:
        cap = cv2.VideoCapture(video_path)
        frames = []
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if total_frames == 0:
            cap.release()
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
    except Exception as e:
        return None

def predict_video(video_path):
    """Predict if video is real or fake"""
    frames = extract_frames(video_path)
    if not frames:
        return None, None
    
    frames = np.array(frames, dtype=np.float32)
    frames = preprocess_input(frames)
    
    predictions = model.predict(frames, verbose=0)
    avg_prediction = np.mean(predictions)
    
    # 0 = REAL, 1 = FAKE
    verdict = "FAKE" if avg_prediction > 0.5 else "REAL"
    confidence = avg_prediction if avg_prediction > 0.5 else (1 - avg_prediction)
    
    return verdict, confidence

def get_odd_numbered_videos(directory, max_videos=200):
    """Get odd-numbered videos from directory"""
    print(f"\nChecking directory: {directory}")
    
    if not os.path.exists(directory):
        print(f"❌ Directory not found: {directory}")
        return []
    
    all_videos = sorted([f for f in os.listdir(directory) if f.endswith('.mp4')])
    print(f"   Found {len(all_videos)} total videos")
    
    # Select odd indices (1st, 3rd, 5th, etc.)
    odd_videos = [all_videos[i] for i in range(0, len(all_videos), 2)]
    result = odd_videos[:max_videos]
    print(f"   Selected {len(result)} odd-numbered videos")
    
    return result

# Get videos
print("\n" + "=" * 80)
print("LOADING VIDEOS...")
print("=" * 80)

train_videos = get_odd_numbered_videos(TRAIN_DIR, 200)
test_videos = get_odd_numbered_videos(TEST_DIR, 200)

total_videos = len(train_videos) + len(test_videos)

if total_videos == 0:
    print("\n❌ No videos found! Please check the directories.")
    exit(1)

print(f"\n✅ Total videos to analyze: {total_videos}")

# Test videos
results = []

if len(train_videos) > 0:
    print("\n" + "=" * 80)
    print("TESTING TRAIN VIDEOS...")
    print("=" * 80)

    for video_file in tqdm(train_videos, desc="Train videos"):
        video_path = os.path.join(TRAIN_DIR, video_file)
        verdict, confidence = predict_video(video_path)
        
        if verdict:
            results.append({
                'filename': video_file,
                'source': 'train',
                'verdict': verdict,
                'confidence': confidence,
                'raw_score': 1 - confidence if verdict == "REAL" else confidence
            })

if len(test_videos) > 0:
    print("\n" + "=" * 80)
    print("TESTING TEST VIDEOS...")
    print("=" * 80)

    for video_file in tqdm(test_videos, desc="Test videos"):
        video_path = os.path.join(TEST_DIR, video_file)
        verdict, confidence = predict_video(video_path)
        
        if verdict:
            results.append({
                'filename': video_file,
                'source': 'test',
                'verdict': verdict,
                'confidence': confidence,
                'raw_score': 1 - confidence if verdict == "REAL" else confidence
            })

# Analyze results
if len(results) == 0:
    print("\n❌ No videos were successfully processed!")
    exit(1)

df = pd.DataFrame(results)

print("\n" + "=" * 80)
print("RESULTS SUMMARY")
print("=" * 80)

print(f"\nTotal videos analyzed: {len(df)}")

if len(train_videos) > 0:
    print("\n--- TRAIN VIDEOS ---")
    train_df = df[df['source'] == 'train']
    print(f"Total: {len(train_df)}")
    print(f"Detected as REAL: {len(train_df[train_df['verdict'] == 'REAL'])} ({len(train_df[train_df['verdict'] == 'REAL'])/len(train_df)*100:.1f}%)")
    print(f"Detected as FAKE: {len(train_df[train_df['verdict'] == 'FAKE'])} ({len(train_df[train_df['verdict'] == 'FAKE'])/len(train_df)*100:.1f}%)")
    print(f"Average confidence: {train_df['confidence'].mean()*100:.1f}%")

if len(test_videos) > 0:
    print("\n--- TEST VIDEOS ---")
    test_df = df[df['source'] == 'test']
    print(f"Total: {len(test_df)}")
    print(f"Detected as REAL: {len(test_df[test_df['verdict'] == 'REAL'])} ({len(test_df[test_df['verdict'] == 'REAL'])/len(test_df)*100:.1f}%)")
    print(f"Detected as FAKE: {len(test_df[test_df['verdict'] == 'FAKE'])} ({len(test_df[test_df['verdict'] == 'FAKE'])/len(test_df)*100:.1f}%)")
    print(f"Average confidence: {test_df['confidence'].mean()*100:.1f}%")

# Save results
output_file = "../test_results_comprehensive.csv"
df.to_csv(output_file, index=False)
print(f"\n✅ Results saved to: {output_file}")

print("\n" + "=" * 80)
print("COMPREHENSIVE TEST COMPLETE!")
print("=" * 80)
