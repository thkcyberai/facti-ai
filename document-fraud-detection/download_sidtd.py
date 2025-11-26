"""
Download SIDTD Dataset (Synthetic ID and Travel Documents)
Public dataset for document fraud detection
"""

import os
import requests
from tqdm import tqdm

print("=" * 60)
print("SIDTD DATASET DOWNLOADER")
print("=" * 60)

# Dataset information
print("\nDataset: SIDTD - Synthetic ID and Travel Documents")
print("Paper: https://www.nature.com/articles/s41597-024-04160-9")
print("Repository: CORA + TC-11")
print("\nDataset contains:")
print("  - 1,900 real (bona fide) ID documents")
print("  - 1,900 forged (fake) ID documents")
print("  - Total: 3,800 images")
print("\nDocument types: ID cards, Passports, Driver's licenses")
print("Countries: France, Spain, Italy, Romania, Finland, Albania, Russia")

print("\n" + "=" * 60)
print("DOWNLOAD INSTRUCTIONS")
print("=" * 60)
print("\nThe SIDTD dataset is available at:")
print("1. CORA Repository: https://cora.cvc.uab.es")
print("2. TC-11 Repository: http://tc11.cvc.uab.es")
print("\nYou'll need to:")
print("1. Visit the repository website")
print("2. Register/request access (free for research)")
print("3. Download the dataset")
print("4. Extract to: ./dataset/sidtd/")
print("\nAlternatively, we can use a smaller sample to start training quickly.")
print("=" * 60)

# Create dataset directory structure
os.makedirs("dataset/sidtd/real", exist_ok=True)
os.makedirs("dataset/sidtd/fake", exist_ok=True)

print("\n✅ Dataset directories created:")
print("  - dataset/sidtd/real/")
print("  - dataset/sidtd/fake/")
print("\nReady for dataset placement!")
