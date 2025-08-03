#!/usr/bin/env python3
"""
Phase 3 (Final): Validation & Categorization
============================================

This script processes the nested metadata structure from Phase 2:
- Validates downloaded images
- Removes duplicates and low-quality images
- Categorizes images properly
- Prepares for MongoDB storage
"""

import json
import os
import sys
from pathlib import Path
from PIL import Image
import hashlib
from collections import defaultdict

def is_valid_image(path):
    """Check if image file is valid - keeping all images"""
    try:
        with Image.open(path) as img:
            # Check if image can be opened
            img.verify()
            
            # Reopen for size checking (just for info, not validation)
            with Image.open(path) as img:
                width, height = img.size
                
                # Accept all images regardless of size, aspect ratio, or file size
                return True, f"Valid ({width}x{height})"
                
    except Exception as e:
        return False, f"Invalid image: {e}"

def calculate_image_hash(path):
    """Calculate perceptual hash for deduplication"""
    try:
        with Image.open(path) as img:
            # Convert to grayscale and resize for consistent hashing
            img = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
            
            # Calculate average pixel value
            pixels = list(img.getdata())
            avg = sum(pixels) / len(pixels)
            
            # Create binary hash
            bits = ''.join(['1' if pixel > avg else '0' for pixel in pixels])
            
            return bits
            
    except Exception:
        return None

def process_figure_images(figure_data):
    """Process images for a single figure"""
    figure_name = figure_data["figure_name"]
    category = figure_data["category"]
    epoch = figure_data["epoch"]
    images = figure_data.get("images", [])
    
    print(f"📋 Processing {figure_name} ({category}/{epoch})")
    
    valid_images = []
    seen_urls = set()
    seen_hashes = set()
    
    for img in images:
        local_path = img.get("local_path")
        if not local_path or not os.path.exists(local_path):
            print(f"    ❌ Missing file: {local_path}")
            continue
        
        # Check for duplicate URLs
        url = img.get("url", "")
        if url in seen_urls:
            print(f"    ❌ Duplicate URL: {url}")
            continue
        seen_urls.add(url)
        
        # Validate image quality
        is_valid, reason = is_valid_image(local_path)
        if not is_valid:
            print(f"    ❌ Invalid image: {reason}")
            continue
        
        # Check for duplicate content (perceptual hash)
        img_hash = calculate_image_hash(local_path)
        if img_hash and img_hash in seen_hashes:
            print(f"    ❌ Duplicate content: {local_path}")
            continue
        if img_hash:
            seen_hashes.add(img_hash)
        
        # Add to valid images
        valid_img = {
            "figure_name": figure_name,
            "category": category,
            "epoch": epoch,
            "url": url,
            "source": img.get("source", "Unknown"),
            "type": img.get("type", "portrait"),
            "license": img.get("license", "Unknown"),
            "title": img.get("title", ""),
            "local_path": local_path,
            "hash": img_hash
        }
        valid_images.append(valid_img)
        print(f"    ✅ Valid image: {os.path.basename(local_path)}")
    
    print(f"    📊 Summary: {len(images)} total, {len(valid_images)} valid")
    return valid_images

def main():
    """Main execution function"""
    print("🔍 Phase 3 (Final): Validation & Categorization")
    print("=" * 60)
    
    # Check if raw metadata exists
    metadata_files = ["raw_image_metadata_final.json", "raw_image_metadata.json"]
    metadata_file = None
    
    for file in metadata_files:
        if os.path.exists(file):
            metadata_file = file
            break
    
    if not metadata_file:
        print("❌ Error: No raw image metadata found")
        print("Please run phase2-integration-final.py first")
        sys.exit(1)
    
    # Load raw image metadata
    print(f"📖 Loading raw image metadata from {metadata_file}...")
    with open(metadata_file, "r") as f:
        raw_figures = json.load(f)
    
    print(f"📊 Processing {len(raw_figures)} figures...")
    
    # Process all figures
    all_valid_images = []
    total_images = 0
    total_valid = 0
    
    for figure_data in raw_figures:
        total_images += len(figure_data.get("images", []))
        valid_images = process_figure_images(figure_data)
        all_valid_images.extend(valid_images)
        total_valid += len(valid_images)
    
    # Group images by figure for MongoDB storage
    figures_with_images = defaultdict(list)
    for img in all_valid_images:
        key = (img["figure_name"], img["category"], img["epoch"])
        figures_with_images[key].append(img)
    
    # Save filtered images
    output_file = "filtered_images.json"
    with open(output_file, "w") as f:
        json.dump(all_valid_images, f, indent=2)
    
    # Save grouped images for MongoDB
    grouped_output = "grouped_images_for_mongodb.json"
    grouped_data = []
    for (figure_name, category, epoch), images in figures_with_images.items():
        grouped_data.append({
            "figure_name": figure_name,
            "category": category,
            "epoch": epoch,
            "images": images,
            "total_images": len(images),
            "coverage": {
                "portrait": len([img for img in images if img["type"] == "portrait"]),
                "achievement": len([img for img in images if img["type"] == "achievement"]),
                "invention": len([img for img in images if img["type"] == "invention"]),
                "artifact": len([img for img in images if img["type"] == "artifact"])
            }
        })
    
    with open(grouped_output, "w") as f:
        json.dump(grouped_data, f, indent=2)
    
    # Summary statistics
    print("\n" + "=" * 60)
    print("📊 PHASE 3 (FINAL) SUMMARY")
    print("=" * 60)
    print(f"Total Figures Processed: {len(raw_figures)}")
    print(f"Total Images Found: {total_images}")
    print(f"Total Valid Images: {total_valid}")
    print(f"Success Rate: {(total_valid/total_images*100):.1f}%" if total_images > 0 else "Success Rate: 0.0%")
    print(f"Figures with Valid Images: {len(figures_with_images)}")
    print(f"Average Images per Figure: {total_valid/len(raw_figures):.1f}")
    
    # Coverage by image type
    type_counts = defaultdict(int)
    for img in all_valid_images:
        type_counts[img["type"]] += 1
    
    print(f"\n📈 Coverage by Image Type:")
    for img_type, count in type_counts.items():
        print(f"  {img_type.capitalize()}: {count}")
    
    # Coverage by category
    category_counts = defaultdict(int)
    for img in all_valid_images:
        category_counts[img["category"]] += 1
    
    print(f"\n📈 Coverage by Category:")
    for category, count in category_counts.items():
        print(f"  {category}: {count}")
    
    print(f"\n📁 Output Files:")
    print(f"  Filtered Images: {output_file}")
    print(f"  Grouped for MongoDB: {grouped_output}")
    
    if total_valid > 0:
        print(f"\n🎯 Next step: Run phase4-storage.py to store images in MongoDB")
    else:
        print(f"\n⚠️ No valid images found. Check image quality and file paths.")

if __name__ == "__main__":
    main() 