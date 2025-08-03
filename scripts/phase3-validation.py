#!/usr/bin/env python3
"""
Phase 3: Validation & Categorization
Deduplicate, filter, and tag image types
"""

import json
import os
import sys
from pathlib import Path
from PIL import Image
import hashlib

def is_valid_image(path):
    """Check if image file is valid and meets quality standards"""
    try:
        with Image.open(path) as img:
            # Check if image can be opened
            img.verify()
            
            # Reopen for size checking
            with Image.open(path) as img:
                width, height = img.size
                
                # Check minimum size (200x200)
                if width < 200 or height < 200:
                    return False, "Too small"
                
                # Check maximum size (1024x1024)
                if width > 1024 or height > 1024:
                    return False, "Too large"
                
                # Check aspect ratio (not too extreme)
                ratio = width / height
                if ratio < 0.3 or ratio > 3.0:
                    return False, "Poor aspect ratio"
                
                # Check file size (max 5MB)
                file_size = os.path.getsize(path)
                if file_size > 5 * 1024 * 1024:  # 5MB
                    return False, "File too large"
                
                return True, "Valid"
                
    except Exception as e:
        return False, f"Invalid image: {e}"

def categorize_image(query, image_type):
    """Categorize image based on query and type"""
    query_lower = query.lower()
    
    # Override with explicit type if provided
    if image_type:
        return image_type
    
    # Categorize based on query content
    if any(word in query_lower for word in ["portrait", "bust", "statue", "painting", "image"]):
        return "portrait"
    elif any(word in query_lower for word in ["invention", "device", "machine", "tool", "creation"]):
        return "invention"
    elif any(word in query_lower for word in ["artifact", "object", "relic", "instrument"]):
        return "artifact"
    else:
        return "achievement"

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

def main():
    """Main execution function"""
    print("🔍 Phase 3: Validation & Categorization")
    print("=" * 40)
    
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
        raw_images = json.load(f)
    
    print(f"📊 Processing {len(raw_images)} raw images...")
    
    # Validation and filtering
    seen_urls = set()
    seen_hashes = set()
    filtered_images = []
    validation_stats = {
        "total": len(raw_images),
        "duplicate_url": 0,
        "duplicate_hash": 0,
        "invalid_image": 0,
        "quality_rejected": 0,
        "valid": 0
    }
    
    for img in raw_images:
        local_path = img.get("localPath")
        
        if not local_path or not os.path.exists(local_path):
            validation_stats["invalid_image"] += 1
            continue
        
        # Check for duplicate URLs
        if img["url"] in seen_urls:
            validation_stats["duplicate_url"] += 1
            continue
        seen_urls.add(img["url"])
        
        # Validate image quality
        is_valid, reason = is_valid_image(local_path)
        if not is_valid:
            validation_stats["quality_rejected"] += 1
            print(f"⚠️ Rejected {os.path.basename(local_path)}: {reason}")
            continue
        
        # Check for duplicate content (perceptual hash)
        img_hash = calculate_image_hash(local_path)
        if img_hash and img_hash in seen_hashes:
            validation_stats["duplicate_hash"] += 1
            continue
        if img_hash:
            seen_hashes.add(img_hash)
        
        # Categorize image
        img["type"] = categorize_image(img["query"], img.get("imageType"))
        
        # Add validation metadata
        img["validated"] = True
        img["validationReason"] = "Valid"
        img["fileSize"] = os.path.getsize(local_path)
        
        # Get image dimensions
        with Image.open(local_path) as img_file:
            img["width"] = img_file.size[0]
            img["height"] = img_file.size[1]
        
        filtered_images.append(img)
        validation_stats["valid"] += 1
    
    # Save filtered images
    output_file = "filtered_images.json"
    with open(output_file, "w") as f:
        json.dump(filtered_images, f, indent=2)
    
    # Generate summary
    print("\n" + "=" * 50)
    print("📊 PHASE 3 SUMMARY")
    print("=" * 50)
    print(f"Total Raw Images: {validation_stats['total']}")
    print(f"Duplicate URLs: {validation_stats['duplicate_url']}")
    print(f"Duplicate Content: {validation_stats['duplicate_hash']}")
    print(f"Invalid Images: {validation_stats['invalid_image']}")
    print(f"Quality Rejected: {validation_stats['quality_rejected']}")
    print(f"Valid Images: {validation_stats['valid']}")
    print(f"Success Rate: {(validation_stats['valid']/validation_stats['total']*100):.1f}%")
    
    # Coverage by image type
    type_counts = {}
    for img in filtered_images:
        img_type = img["type"]
        type_counts[img_type] = type_counts.get(img_type, 0) + 1
    
    print("\n📈 Coverage by Image Type:")
    for img_type, count in sorted(type_counts.items()):
        print(f"  {img_type.capitalize()}: {count} images")
    
    # Coverage by figure
    figure_counts = {}
    for img in filtered_images:
        figure_name = img["figureName"]
        figure_counts[figure_name] = figure_counts.get(figure_name, 0) + 1
    
    figures_with_images = len(figure_counts)
    total_figures = len(set(img["figureName"] for img in raw_images))
    
    print(f"\n📋 Figure Coverage:")
    print(f"  Figures with Images: {figures_with_images}/{total_figures}")
    print(f"  Coverage Rate: {(figures_with_images/total_figures*100):.1f}%")
    
    # Show sample of figures with most images
    top_figures = sorted(figure_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    print(f"\n🏆 Top Figures by Image Count:")
    for figure, count in top_figures:
        print(f"  {figure}: {count} images")
    
    print(f"\n📁 Filtered images saved to: {output_file}")
    print("\n🎯 Next step: Run phase4-storage.py to store in MongoDB")

if __name__ == "__main__":
    main() 