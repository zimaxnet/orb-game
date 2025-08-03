#!/usr/bin/env python3
"""
Image Inventory Script
Analyzes existing images and identifies missing ones from historical figures data.
"""

import os
import json
from pathlib import Path

def get_existing_images():
    """Get list of existing image files."""
    image_dir = Path("downloaded_images")
    if not image_dir.exists():
        return []
    
    images = []
    for file in image_dir.glob("*.jpg"):
        # Extract name from filename (remove _portrait_0.jpg)
        name = file.stem.replace("_portrait_0", "")
        images.append(name)
    
    return images

def get_required_figures():
    """Get list of required figures from the data file."""
    try:
        with open("OrbGameInfluentialPeopleSeeds", "r") as f:
            data = json.load(f)
        
        figures = []
        for category, epochs in data.items():
            for epoch, people in epochs.items():
                for person in people:
                    figures.append(person["name"])
        
        return figures
    except Exception as e:
        print(f"Error reading OrbGameInfluentialPeopleSeeds: {e}")
        return []

def analyze_inventory():
    """Analyze existing vs required images."""
    existing = get_existing_images()
    required = get_required_figures()
    
    print("📊 IMAGE INVENTORY ANALYSIS")
    print("=" * 50)
    
    print(f"\n📁 Existing Images: {len(existing)}")
    print(f"📋 Required Figures: {len(required)}")
    
    # Find missing images
    missing = [name for name in required if name not in existing]
    extra = [name for name in existing if name not in required]
    
    print(f"❌ Missing Images: {len(missing)}")
    print(f"➕ Extra Images: {len(extra)}")
    
    if missing:
        print(f"\n🔍 MISSING IMAGES ({len(missing)}):")
        print("-" * 30)
        for i, name in enumerate(missing, 1):
            print(f"{i:2d}. {name}")
    
    if extra:
        print(f"\n➕ EXTRA IMAGES ({len(extra)}):")
        print("-" * 30)
        for i, name in enumerate(extra, 1):
            print(f"{i:2d}. {name}")
    
    # Categorize missing images
    if missing:
        print(f"\n📂 MISSING BY CATEGORY:")
        print("-" * 30)
        
        try:
            with open("OrbGameInfluentialPeopleSeeds", "r") as f:
                data = json.load(f)
            
            for category, epochs in data.items():
                category_missing = []
                for epoch, people in epochs.items():
                    for person in people:
                        if person["name"] in missing:
                            category_missing.append(f"{person['name']} ({epoch})")
                
                if category_missing:
                    print(f"\n{category.upper()}:")
                    for item in category_missing:
                        print(f"  • {item}")
        except:
            pass
    
    # Summary
    coverage = ((len(required) - len(missing)) / len(required)) * 100 if required else 0
    print(f"\n📈 COVERAGE: {coverage:.1f}% ({len(required) - len(missing)}/{len(required)})")
    
    return missing, extra

if __name__ == "__main__":
    missing, extra = analyze_inventory()
    
    if missing:
        print(f"\n🚀 NEXT STEPS:")
        print(f"1. Run: python3 scripts/google-custom-search.py")
        print(f"2. This will search for {len(missing)} missing images")
        print(f"3. Monitor Google CSE usage (100 free queries/day)")
    else:
        print(f"\n✅ ALL IMAGES PRESENT!")
        print(f"No missing images found.") 