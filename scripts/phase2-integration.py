#!/usr/bin/env python3
"""
Phase 2: Source Integration & Query Automation
Query Wikimedia Commons API for each figure and download relevant images
"""

import requests
import json
import os
import time
import sys
from pathlib import Path
from urllib.parse import quote
import hashlib

# Configuration
SEARCH_LIMIT = 3  # Number of images per query
DOWNLOAD_DIR = "downloaded_images"
RATE_LIMIT_DELAY = 1  # Seconds between API calls

def get_commons_image_urls(query, limit=SEARCH_LIMIT):
    """Search Wikimedia Commons API for images"""
    session = requests.Session()
    url = "https://commons.wikimedia.org/w/api.php"
    
    # Clean query for API
    clean_query = query.replace('"', '').strip()
    
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": clean_query,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime"
    }
    
    try:
        response = session.get(url=url, params=params, timeout=30)
        response.raise_for_status()
        
        results = []
        data = response.json()
        
        if "query" in data and "pages" in data["query"]:
            pages = data["query"]["pages"]
            
            for page_id, page in pages.items():
                if "imageinfo" in page:
                    info = page["imageinfo"][0]
                    
                    # Check if it's an image file
                    if info.get("mime", "").startswith("image/"):
                        # Get license info
                        extmetadata = info.get("extmetadata", {})
                        license_info = extmetadata.get("LicenseShortName", {}).get("value", "Unknown")
                        
                        # Only include public domain or CC licenses
                        if any(license in license_info.lower() for license in ["public domain", "creative commons", "cc"]):
                            results.append({
                                "url": info["url"],
                                "title": page["title"],
                                "source": "Wikimedia Commons",
                                "license": license_info,
                                "size": info.get("size", 0),
                                "mime": info.get("mime", ""),
                                "query": clean_query
                            })
        
        return results
        
    except Exception as e:
        print(f"⚠️ Wikimedia search failed for '{clean_query}': {e}")
        return []

def download_image(url, filename):
    """Download image with error handling"""
    try:
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        
        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
        
    except Exception as e:
        print(f"⚠️ Failed to download {url}: {e}")
        return False

def generate_filename(figure_name, query, url):
    """Generate unique filename for downloaded image"""
    # Create safe filename
    safe_name = figure_name.replace(" ", "_").replace("'", "").lower()
    safe_query = query.replace(" ", "_").replace('"', "").lower()[:20]
    
    # Add hash for uniqueness
    url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
    
    return f"{safe_name}_{safe_query}_{url_hash}.jpg"

def main():
    """Main execution function"""
    print("🔍 Phase 2: Source Integration & Query Automation")
    print("=" * 50)
    
    # Check if search targets exist
    if not os.path.exists("search_targets.json"):
        print("❌ Error: search_targets.json not found")
        print("Please run phase1-discovery.py first")
        sys.exit(1)
    
    # Load search targets
    print("📖 Loading search targets...")
    with open("search_targets.json", "r") as f:
        search_targets = json.load(f)
    
    # Create download directory
    download_dir = Path(DOWNLOAD_DIR)
    download_dir.mkdir(exist_ok=True)
    
    print(f"📁 Download directory: {download_dir}")
    print(f"🔍 Processing {len(search_targets)} figures...")
    
    # Process each figure
    all_image_records = []
    successful_downloads = 0
    total_queries = 0
    
    for i, figure in enumerate(search_targets, 1):
        figure_name = figure["name"]
        category = figure["category"]
        epoch = figure["epoch"]
        
        print(f"\n📋 [{i}/{len(search_targets)}] Processing {figure_name} ({category}/{epoch})")
        
        figure_images = []
        
        # Process each image type
        for img_type, queries in figure["queries"].items():
            print(f"  📸 Searching {img_type} images...")
            
            for query in queries:
                total_queries += 1
                
                # Search Wikimedia Commons
                images = get_commons_image_urls(query, SEARCH_LIMIT)
                
                for img in images:
                    # Generate filename
                    filename = generate_filename(figure_name, query, img["url"])
                    filepath = download_dir / filename
                    
                    # Download image
                    if download_image(img["url"], filepath):
                        # Add metadata
                        img.update({
                            "localPath": str(filepath),
                            "figureName": figure_name,
                            "category": category,
                            "epoch": epoch,
                            "imageType": img_type,
                            "downloadedAt": time.strftime("%Y-%m-%d %H:%M:%S")
                        })
                        
                        figure_images.append(img)
                        successful_downloads += 1
                        print(f"    ✅ Downloaded: {filename}")
                        break  # Take first successful image of this type
                
                time.sleep(RATE_LIMIT_DELAY)  # Rate limiting
        
        all_image_records.extend(figure_images)
        
        # Progress update
        print(f"    📊 Found {len(figure_images)} images for {figure_name}")
    
    # Save metadata
    metadata_file = "raw_image_metadata.json"
    with open(metadata_file, "w") as f:
        json.dump(all_image_records, f, indent=2)
    
    # Generate summary
    print("\n" + "=" * 50)
    print("📊 PHASE 2 SUMMARY")
    print("=" * 50)
    print(f"Total Figures Processed: {len(search_targets)}")
    print(f"Total Queries Made: {total_queries}")
    print(f"Successful Downloads: {successful_downloads}")
    print(f"Average Images per Figure: {successful_downloads / len(search_targets):.1f}")
    print(f"Metadata Saved: {metadata_file}")
    print(f"Images Directory: {download_dir}")
    
    # Coverage by image type
    type_counts = {}
    for record in all_image_records:
        img_type = record["imageType"]
        type_counts[img_type] = type_counts.get(img_type, 0) + 1
    
    print("\n📈 Coverage by Image Type:")
    for img_type, count in sorted(type_counts.items()):
        percentage = (count / len(search_targets)) * 100
        print(f"  {img_type.capitalize()}: {count}/{len(search_targets)} ({percentage:.1f}%)")
    
    print("\n🎯 Next step: Run phase3-validation.py to filter and categorize images")

if __name__ == "__main__":
    main() 