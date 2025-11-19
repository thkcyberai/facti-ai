"""
Download test face image pairs for testing face matching
Uses public domain celebrity images
"""

import requests
import os
from pathlib import Path

# Create test images directory
TEST_DIR = "test_images/faces"
os.makedirs(TEST_DIR, exist_ok=True)

# Public domain / Creative Commons face images
# Format: (person_name, [url1, url2])
TEST_PAIRS = [
    ("person1", [
        "https://thispersondoesnotexist.com/",
        "https://thispersondoesnotexist.com/"
    ]),
]

# Better approach: Use specific URLs of known public domain images
KNOWN_PAIRS = {
    "obama": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/440px-President_Barack_Obama.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Official_portrait_of_Barack_Obama.jpg/440px-Official_portrait_of_Barack_Obama.jpg"
    ],
    "einstein": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/440px-Albert_Einstein_Head.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Einstein_1921_portrait2.jpg/440px-Einstein_1921_portrait2.jpg"
    ],
    "ada_lovelace": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/440px-Ada_Lovelace_portrait.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Ada_lovelace.jpg/440px-Ada_lovelace.jpg"
    ],
    "marie_curie": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/440px-Marie_Curie_c._1920s.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/440px-Marie_Curie_c1920.jpg"
    ]
}

def download_image(url, save_path):
    """Download image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Downloaded: {save_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to download {url}: {e}")
        return False

def download_all_pairs():
    """Download all test image pairs"""
    print("Downloading test face image pairs...\n")
    
    success_count = 0
    fail_count = 0
    
    for person_name, urls in KNOWN_PAIRS.items():
        print(f"\nDownloading {person_name}:")
        person_dir = os.path.join(TEST_DIR, person_name)
        os.makedirs(person_dir, exist_ok=True)
        
        for i, url in enumerate(urls, 1):
            save_path = os.path.join(person_dir, f"photo{i}.jpg")
            
            if os.path.exists(save_path):
                print(f"  Already exists: {save_path}")
                success_count += 1
                continue
            
            if download_image(url, save_path):
                success_count += 1
            else:
                fail_count += 1
    
    print(f"\n{'='*50}")
    print(f"✓ Successfully downloaded: {success_count} images")
    print(f"✗ Failed: {fail_count} images")
    print(f"{'='*50}")
    print(f"\nImages saved to: {TEST_DIR}/")
    
    # Show structure
    print("\nDirectory structure:")
    for person in os.listdir(TEST_DIR):
        person_path = os.path.join(TEST_DIR, person)
        if os.path.isdir(person_path):
            files = os.listdir(person_path)
            print(f"  {person}/ ({len(files)} photos)")
            for f in files:
                print(f"    - {f}")

if __name__ == "__main__":
    download_all_pairs()
    print("\n✅ Done! You can now test face matching with these images.")
    print(f"\nTo test, use files from: {TEST_DIR}/[person_name]/photo1.jpg + photo2.jpg")
