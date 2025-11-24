"""
Quick Synthetic ID Dataset Generator
Generates 500-1000 ID images for rapid prototyping
- Real IDs: Clean, unmodified images
- Fake IDs: GAN-style artifacts, tampering, synthetic faces
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import random

print("=" * 60)
print("SYNTHETIC ID DATASET GENERATOR")
print("=" * 60)

# Configuration
NUM_REAL = 250
NUM_FAKE = 250
TOTAL = NUM_REAL + NUM_FAKE

OUTPUT_DIR = "dataset/synthetic"
os.makedirs(f"{OUTPUT_DIR}/real", exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/fake", exist_ok=True)

print(f"\nGenerating {TOTAL} ID document images...")
print(f"  Real IDs: {NUM_REAL}")
print(f"  Fake IDs: {NUM_FAKE}")

def create_id_template(width=800, height=500):
    """Create a basic ID document template"""
    img = Image.new('RGB', (width, height), color='#E8F4F8')
    draw = ImageDraw.Draw(img)
    
    # Add border
    draw.rectangle([10, 10, width-10, height-10], outline='#2E5266', width=3)
    
    # Add header bar
    draw.rectangle([10, 10, width-10, 60], fill='#2E5266')
    
    # Add photo placeholder
    draw.rectangle([30, 80, 230, 320], fill='#CCCCCC', outline='#666666', width=2)
    
    # Add text lines (simulating ID fields)
    fields_y = [100, 150, 200, 250, 300, 350, 400]
    for i, y in enumerate(fields_y):
        draw.rectangle([260, y, 760, y+30], outline='#999999', width=1)
    
    return img

def add_realistic_noise(img):
    """Add realistic camera/scan noise"""
    # Add slight gaussian noise
    np_img = np.array(img)
    noise = np.random.normal(0, 3, np_img.shape).astype(np.int16)
    np_img = np.clip(np_img + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(np_img)

def add_gan_artifacts(img):
    """Simulate GAN generation artifacts"""
    # 1. Over-smoothing (common in GANs)
    img = img.filter(ImageFilter.GaussianBlur(radius=1.5))
    
    # 2. Add unnatural color patterns
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(random.uniform(0.85, 1.15))
    
    # 3. Add subtle grid pattern (GAN fingerprint)
    draw = ImageDraw.Draw(img, 'RGBA')
    for x in range(0, img.width, 8):
        for y in range(0, img.height, 8):
            if random.random() > 0.5:
                draw.point((x, y), fill=(0, 0, 0, 10))
    
    return img

def add_photoshop_artifacts(img):
    """Simulate Photoshop tampering"""
    np_img = np.array(img)
    
    # Add unnatural edge transitions
    y_start = random.randint(100, 300)
    y_end = y_start + random.randint(50, 150)
    x_start = random.randint(260, 400)
    x_end = x_start + random.randint(100, 300)
    
    # Create subtle discontinuity
    region = np_img[y_start:y_end, x_start:x_end]
    region = region + np.random.randint(-5, 5, region.shape)
    np_img[y_start:y_end, x_start:x_end] = np.clip(region, 0, 255)
    
    return Image.fromarray(np_img.astype(np.uint8))

def add_compression_artifacts(img, quality=50):
    """Add JPEG compression artifacts"""
    from io import BytesIO
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=quality)
    buffer.seek(0)
    return Image.open(buffer)

# Generate REAL IDs
print("\n📄 Generating REAL ID documents...")
for i in range(NUM_REAL):
    img = create_id_template()
    
    # Add realistic variations
    img = add_realistic_noise(img)
    img = add_compression_artifacts(img, quality=random.randint(75, 95))
    
    # Add slight rotation (camera angle)
    angle = random.uniform(-2, 2)
    img = img.rotate(angle, expand=True, fillcolor='white')
    
    filename = f"{OUTPUT_DIR}/real/id_real_{i:04d}.jpg"
    img.save(filename, quality=90)
    
    if (i + 1) % 50 == 0:
        print(f"  Generated {i + 1}/{NUM_REAL} real IDs")

print(f"✅ Generated {NUM_REAL} REAL IDs")

# Generate FAKE IDs
print("\n🔴 Generating FAKE ID documents...")
for i in range(NUM_FAKE):
    img = create_id_template()
    
    # Apply different fraud techniques
    fraud_type = random.choice(['gan', 'photoshop', 'combined'])
    
    if fraud_type == 'gan':
        img = add_gan_artifacts(img)
    elif fraud_type == 'photoshop':
        img = add_photoshop_artifacts(img)
    else:  # combined
        img = add_gan_artifacts(img)
        img = add_photoshop_artifacts(img)
    
    # Add compression
    img = add_compression_artifacts(img, quality=random.randint(60, 85))
    
    # Add slight rotation
    angle = random.uniform(-2, 2)
    img = img.rotate(angle, expand=True, fillcolor='white')
    
    filename = f"{OUTPUT_DIR}/fake/id_fake_{i:04d}.jpg"
    img.save(filename, quality=90)
    
    if (i + 1) % 50 == 0:
        print(f"  Generated {i + 1}/{NUM_FAKE} fake IDs")

print(f"✅ Generated {NUM_FAKE} FAKE IDs")

print("\n" + "=" * 60)
print("DATASET GENERATION COMPLETE!")
print("=" * 60)
print(f"\nDataset saved to: {OUTPUT_DIR}/")
print(f"  Real IDs: {OUTPUT_DIR}/real/ ({NUM_REAL} images)")
print(f"  Fake IDs: {OUTPUT_DIR}/fake/ ({NUM_FAKE} images)")
print(f"  Total: {TOTAL} images")
print("\n✅ Ready for training!")
