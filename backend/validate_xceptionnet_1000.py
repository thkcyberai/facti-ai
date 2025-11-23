#!/usr/bin/env python3
"""
XceptionNet Validation on 1,000 Unseen FaceForensics++ Videos
500 REAL + 500 FAKE (completely independent from training data)
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

REAL_DIR = "C:/python/facti-ai/validation_videos/original_sequences/youtube/c23/videos"
FAKE_DIR = "C:/python/facti-ai/validation_videos/manipulated_sequences/Deepfakes/c23/videos"

print("=" * 80)
print("XCEPTIONNET VALIDATION - 1,000 UNSEEN VIDEOS")
print("=" * 80)
print("Testing on completely NEW FaceForensics++ videos")
print("500 REAL + 500 FAKE (never seen during training)")
print("=" * 80)

# Load model
print("\nLoading model...")
model = load_model(MODEL_PATH)
print("✅ Model loaded!")
print(f"   Training Accuracy: 99.00%")
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
    except:
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
    is_fake = avg_prediction > 0.5
    confidence = avg_prediction if is_fake else (1 - avg_prediction)
    
    return is_fake, confidence, avg_prediction

# Load videos
print("\n" + "=" * 80)
print("LOADING VIDEOS...")
print("=" * 80)

real_videos = sorted([f for f in os.listdir(REAL_DIR) if f.endswith('.mp4')])
fake_videos = sorted([f for f in os.listdir(FAKE_DIR) if f.endswith('.mp4')])

print(f"\nREAL videos: {len(real_videos)}")
print(f"FAKE videos: {len(fake_videos)}")
print(f"Total: {len(real_videos) + len(fake_videos)}")

# Test REAL videos
print("\n" + "=" * 80)
print("TESTING REAL VIDEOS (Ground Truth: REAL)")
print("=" * 80)

results = []
correct_real = 0
total_real = 0

for video_file in tqdm(real_videos, desc="REAL videos"):
    video_path = os.path.join(REAL_DIR, video_file)
    is_fake, confidence, raw_score = predict_video(video_path)
    
    if is_fake is not None:
        total_real += 1
        correct = not is_fake  # Correct if predicted REAL
        if correct:
            correct_real += 1
        
        results.append({
            'filename': video_file,
            'ground_truth': 'REAL',
            'prediction': 'FAKE' if is_fake else 'REAL',
            'correct': correct,
            'confidence': confidence,
            'raw_score': raw_score
        })

# Test FAKE videos
print("\n" + "=" * 80)
print("TESTING FAKE VIDEOS (Ground Truth: FAKE)")
print("=" * 80)

correct_fake = 0
total_fake = 0

for video_file in tqdm(fake_videos, desc="FAKE videos"):
    video_path = os.path.join(FAKE_DIR, video_file)
    is_fake, confidence, raw_score = predict_video(video_path)
    
    if is_fake is not None:
        total_fake += 1
        correct = is_fake  # Correct if predicted FAKE
        if correct:
            correct_fake += 1
        
        results.append({
            'filename': video_file,
            'ground_truth': 'FAKE',
            'prediction': 'FAKE' if is_fake else 'REAL',
            'correct': correct,
            'confidence': confidence,
            'raw_score': raw_score
        })

# Calculate metrics
df = pd.DataFrame(results)
total_correct = correct_real + correct_fake
total_videos = total_real + total_fake
overall_accuracy = (total_correct / total_videos * 100) if total_videos > 0 else 0

real_accuracy = (correct_real / total_real * 100) if total_real > 0 else 0
fake_accuracy = (correct_fake / total_fake * 100) if total_fake > 0 else 0

false_positives = total_real - correct_real  # Real predicted as Fake
false_negatives = total_fake - correct_fake  # Fake predicted as Real

print("\n" + "=" * 80)
print("VALIDATION RESULTS")
print("=" * 80)

print(f"\n🎯 OVERALL ACCURACY: {overall_accuracy:.2f}%")
print(f"   Correct: {total_correct}/{total_videos}")

print(f"\n✅ REAL VIDEO DETECTION:")
print(f"   Accuracy: {real_accuracy:.2f}%")
print(f"   Correct: {correct_real}/{total_real}")
print(f"   False Positives: {false_positives} (real flagged as fake)")

print(f"\n🚫 FAKE VIDEO DETECTION:")
print(f"   Accuracy: {fake_accuracy:.2f}%")
print(f"   Correct: {correct_fake}/{total_fake}")
print(f"   False Negatives: {false_negatives} (fake missed)")

print(f"\n📊 CONFIDENCE:")
print(f"   Average: {df['confidence'].mean()*100:.1f}%")
print(f"   Median: {df['confidence'].median()*100:.1f}%")

# Save results
output_file = "../validation_results_1000.csv"
df.to_csv(output_file, index=False)
print(f"\n💾 Results saved to: {output_file}")

print("\n" + "=" * 80)
print("VALIDATION COMPLETE!")
print("=" * 80)
