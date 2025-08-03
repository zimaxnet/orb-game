#!/usr/bin/env python3
"""
Test Revised Phase 2: Multi-Source Image Acquisition
====================================================

This script tests the revised Phase 2 on a small subset of figures
to verify the multi-source approach works before running on all 120 figures.
"""

import json
import requests
import time
import os
import sys
from pathlib import Path
from urllib.parse import quote_plus
import re
from tqdm import tqdm

# Configuration
SEARCH_LIMIT = 5  # Smaller limit for testing
RETRY_ATTEMPTS = 2
DELAY_BETWEEN_REQUESTS = 2  # Longer delay for testing
DOWNLOAD_DIR = "test_downloaded_images"

def setup_directories():
    """Create necessary directories"""
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    print(f"📁 Test download directory: {DOWNLOAD_DIR}")

def load_test_targets():
    """Load a small subset of search targets for testing"""
    try:
        with open('search_targets.json', 'r') as f:
            all_targets = json.load(f)
        
        # Select first 5 figures for testing
        test_targets = all_targets[:5]
        print(f"🧪 Testing with {len(test_targets)} figures:")
        for target in test_targets:
            print(f"   - {target['name']} ({target['category']}/{target['epoch']})")
        
        return test_targets
    except FileNotFoundError:
        print("❌ Error: search_targets.json not found")
        print("Please run phase1-discovery.py first")
        sys.exit(1)

def get_wikidata_portrait(figure_name):
    """Get portrait image from Wikidata using P18 property"""
    try:
        print(f"    🔍 Querying Wikidata for '{figure_name}'...")
        
        # SPARQL query to find portrait image
        query = f"""
        SELECT ?image WHERE {{
          ?person rdfs:label "{figure_name}"@en.
          ?person wdt:P18 ?image.
        }}
        LIMIT 1
        """
        
        url = 'https://query.wikidata.org/sparql'
        params = {
            'format': 'json',
            'query': query
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        results = data.get('results', {}).get('bindings', [])
        
        if results:
            image_url = results[0]['image']['value']
            print(f"    ✅ Found Wikidata portrait: {image_url}")
            return {
                'url': image_url,
                'source': 'Wikidata',
                'type': 'portrait',
                'license': 'public domain',
                'title': f"{figure_name} portrait"
            }
        else:
            print(f"    ❌ No Wikidata portrait found")
            
    except Exception as e:
        print(f"    ⚠️ Wikidata search failed: {e}")
    
    return None

def search_commons_broader(figure_name, image_type):
    """Search Wikimedia Commons with broader terms"""
    try:
        print(f"    🔍 Searching Commons for '{figure_name}' {image_type}...")
        
        # Try different search strategies
        search_terms = [
            figure_name,  # Just the name
            f'"{figure_name}"',  # Exact name
        ]
        
        for term in search_terms:
            url = "https://commons.wikimedia.org/w/api.php"
            params = {
                "action": "query",
                "format": "json",
                "generator": "search",
                "gsrsearch": term,
                "gsrlimit": SEARCH_LIMIT,
                "prop": "imageinfo",
                "iiprop": "url|extmetadata|size|mime"
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            if "query" in data and "pages" in data["query"]:
                results = []
                for page_id, page in data["query"]["pages"].items():
                    if "imageinfo" in page and page["imageinfo"][0].get("mime", "").startswith("image/"):
                        info = page["imageinfo"][0]
                        license_info = info.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "Unknown")
                        
                        results.append({
                            "url": info["url"],
                            "title": page["title"],
                            "source": "Wikimedia Commons",
                            "license": license_info,
                            "size": info.get("size", 0),
                            "mime": info.get("mime", ""),
                            "type": image_type,
                            "query": term
                        })
                
                if results:
                    print(f"    ✅ Found {len(results)} Commons images")
                    return results
        
        print(f"    ❌ No Commons images found")
        
    except Exception as e:
        print(f"    ⚠️ Commons search failed: {e}")
    
    return []

def scrape_wikipedia_images(figure_name):
    """Scrape Wikipedia page for images"""
    try:
        print(f"    🔍 Scraping Wikipedia for '{figure_name}'...")
        
        # Get Wikipedia page
        wiki_url = f"https://en.wikipedia.org/wiki/{quote_plus(figure_name)}"
        response = requests.get(wiki_url, timeout=30)
        response.raise_for_status()
        
        # Look for infobox images
        content = response.text
        
        # Find image URLs in the page
        image_patterns = [
            r'src="(https://upload\.wikimedia\.org/wikipedia/commons/[^"]+)"',
        ]
        
        images = []
        for pattern in image_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if match.startswith('https://upload.wikimedia.org'):
                    images.append({
                        'url': match,
                        'source': 'Wikipedia',
                        'type': 'portrait',  # Assume portrait for now
                        'license': 'public domain',
                        'title': f"{figure_name} from Wikipedia"
                    })
        
        if images:
            print(f"    ✅ Found {len(images)} Wikipedia images")
            return images[:2]  # Limit to 2 images for testing
        else:
            print(f"    ❌ No Wikipedia images found")
        
    except Exception as e:
        print(f"    ⚠️ Wikipedia scraping failed: {e}")
    
    return []

def download_image(url, filename):
    """Download an image with retry logic"""
    for attempt in range(RETRY_ATTEMPTS):
        try:
            print(f"    📥 Downloading: {filename}")
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            filepath = os.path.join(DOWNLOAD_DIR, filename)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"    ✅ Downloaded: {filepath}")
            return filepath
            
        except Exception as e:
            if attempt == RETRY_ATTEMPTS - 1:
                print(f"    ❌ Failed to download: {e}")
                return None
            time.sleep(1)
    
    return None

def process_test_figure(figure_data):
    """Process a single figure with multiple strategies"""
    figure_name = figure_data["name"]
    category = figure_data["category"]
    epoch = figure_data["epoch"]
    
    print(f"\n📋 Testing {figure_name} ({category}/{epoch})")
    
    all_images = []
    
    # Strategy 1: Wikidata for portraits
    portrait = get_wikidata_portrait(figure_name)
    if portrait:
        all_images.append(portrait)
    
    # Strategy 2: Wikimedia Commons with broader search
    for image_type in ["portrait", "achievement"]:  # Test with fewer types
        commons_images = search_commons_broader(figure_name, image_type)
        if commons_images:
            all_images.extend(commons_images)
    
    # Strategy 3: Wikipedia scraping
    if not any(img["type"] == "portrait" for img in all_images):
        wiki_images = scrape_wikipedia_images(figure_name)
        if wiki_images:
            all_images.extend(wiki_images)
    
    # Download images
    downloaded_images = []
    for i, img in enumerate(all_images):
        # Create filename
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', figure_name)
        filename = f"test_{safe_name}_{img['type']}_{i}.jpg"
        
        # Download image
        filepath = download_image(img["url"], filename)
        if filepath:
            img["local_path"] = filepath
            downloaded_images.append(img)
    
    print(f"    📊 Summary: Found {len(all_images)} images, downloaded {len(downloaded_images)}")
    
    return {
        "figure_name": figure_name,
        "category": category,
        "epoch": epoch,
        "total_found": len(all_images),
        "total_downloaded": len(downloaded_images),
        "images": downloaded_images
    }

def main():
    """Main execution function"""
    print("🧪 Test: Phase 2 (Revised) - Multi-Source Image Acquisition")
    print("=" * 60)
    
    # Setup
    setup_directories()
    test_targets = load_test_targets()
    
    # Process each test figure
    results = []
    for i, figure_data in enumerate(test_targets):
        result = process_test_figure(figure_data)
        results.append(result)
        
        # Add delay to be respectful to APIs
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Save results
    output_file = "test_image_metadata.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    # Summary
    total_found = sum(r["total_found"] for r in results)
    total_downloaded = sum(r["total_downloaded"] for r in results)
    figures_with_images = sum(1 for r in results if r["total_downloaded"] > 0)
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Test Figures Processed: {len(test_targets)}")
    print(f"Figures with Images: {figures_with_images}")
    print(f"Total Images Found: {total_found}")
    print(f"Total Images Downloaded: {total_downloaded}")
    print(f"Average Images per Figure: {total_downloaded/len(test_targets):.1f}")
    print(f"Test Metadata Saved: {output_file}")
    print(f"Test Images Directory: {DOWNLOAD_DIR}")
    
    if total_downloaded > 0:
        print("\n✅ Test successful! Ready to run full Phase 2.")
        print("🎯 Next: Run phase2-integration-revised.py on all figures")
    else:
        print("\n❌ Test failed. No images found.")
        print("🔧 Debugging suggestions:")
        print("  1. Check internet connection")
        print("  2. Verify Wikidata and Commons APIs are accessible")
        print("  3. Try with different figure names")
        print("  4. Check if figure names need URL encoding")

if __name__ == "__main__":
    main() 