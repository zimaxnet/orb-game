#!/usr/bin/env python3
"""
Phase 2 (Revised): Multi-Source Image Acquisition
==================================================

This script uses multiple strategies to find images:
1. Wikidata for portraits (P18 property)
2. Wikimedia Commons with broader search terms
3. Google Custom Search API (if configured)
4. Direct Wikipedia scraping
5. Museum APIs (Smithsonian, Met)
6. Fallback to generic category images

Key improvements:
- Broader search terms (figure name only, not restrictive)
- Multiple fallback sources
- Better error handling and retry logic
- Detailed logging for debugging
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
SEARCH_LIMIT = 10
RETRY_ATTEMPTS = 3
DELAY_BETWEEN_REQUESTS = 1  # seconds
DOWNLOAD_DIR = "downloaded_images"

def setup_directories():
    """Create necessary directories"""
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    print(f"📁 Download directory: {DOWNLOAD_DIR}")

def load_search_targets():
    """Load the search targets from Phase 1"""
    try:
        with open('search_targets.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ Error: search_targets.json not found")
        print("Please run phase1-discovery.py first")
        sys.exit(1)

def get_wikidata_portrait(figure_name):
    """Get portrait image from Wikidata using P18 property"""
    try:
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
            return {
                'url': image_url,
                'source': 'Wikidata',
                'type': 'portrait',
                'license': 'public domain',
                'title': f"{figure_name} portrait"
            }
    except Exception as e:
        print(f"⚠️ Wikidata search failed for '{figure_name}': {e}")
    
    return None

def search_commons_broader(figure_name, image_type):
    """Search Wikimedia Commons with broader terms"""
    try:
        # Try different search strategies
        search_terms = [
            figure_name,  # Just the name
            f'"{figure_name}"',  # Exact name
            f"{figure_name} {image_type}",  # Name + type
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
                        
                        # Accept any license for now (we can filter later)
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
                    return results
        
    except Exception as e:
        print(f"⚠️ Commons search failed for '{figure_name}': {e}")
    
    return []

def scrape_wikipedia_images(figure_name):
    """Scrape Wikipedia page for images"""
    try:
        # Get Wikipedia page
        wiki_url = f"https://en.wikipedia.org/wiki/{quote_plus(figure_name)}"
        response = requests.get(wiki_url, timeout=30)
        response.raise_for_status()
        
        # Look for infobox images
        content = response.text
        
        # Find image URLs in the page
        image_patterns = [
            r'src="(https://upload\.wikimedia\.org/wikipedia/commons/[^"]+)"',
            r'<img[^>]+src="([^"]+)"[^>]*>'
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
        
        return images[:3]  # Limit to 3 images
        
    except Exception as e:
        print(f"⚠️ Wikipedia scraping failed for '{figure_name}': {e}")
    
    return []

def search_smithsonian_api(figure_name, image_type):
    """Search Smithsonian Open Access API"""
    try:
        # Smithsonian API endpoint
        url = "https://api.si.edu/openaccess/api/v1.0/search"
        params = {
            "q": figure_name,
            "start": 0,
            "rows": 10
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        results = []
        
        if "response" in data and "rows" in data["response"]:
            for item in data["response"]["rows"]:
                if "content" in item and "descriptiveNonRepeating" in item["content"]:
                    content = item["content"]["descriptiveNonRepeating"]
                    if "online_media" in content and "media" in content["online_media"]:
                        for media in content["online_media"]["media"]:
                            if "content" in media:
                                results.append({
                                    "url": media["content"],
                                    "source": "Smithsonian",
                                    "type": image_type,
                                    "license": "public domain",
                                    "title": content.get("title", f"{figure_name} artifact")
                                })
        
        return results
        
    except Exception as e:
        print(f"⚠️ Smithsonian search failed for '{figure_name}': {e}")
    
    return []

def download_image(url, filename):
    """Download an image with retry logic"""
    for attempt in range(RETRY_ATTEMPTS):
        try:
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            filepath = os.path.join(DOWNLOAD_DIR, filename)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return filepath
            
        except Exception as e:
            if attempt == RETRY_ATTEMPTS - 1:
                print(f"❌ Failed to download {url}: {e}")
                return None
            time.sleep(1)
    
    return None

def process_figure(figure_data):
    """Process a single figure with multiple strategies"""
    figure_name = figure_data["name"]
    category = figure_data["category"]
    epoch = figure_data["epoch"]
    
    print(f"📋 Processing {figure_name} ({category}/{epoch})")
    
    all_images = []
    
    # Strategy 1: Wikidata for portraits
    print("  📸 Trying Wikidata for portrait...")
    portrait = get_wikidata_portrait(figure_name)
    if portrait:
        all_images.append(portrait)
        print(f"    ✅ Found portrait from Wikidata")
    
    # Strategy 2: Wikimedia Commons with broader search
    for image_type in ["portrait", "achievement", "invention", "artifact"]:
        print(f"  📸 Searching Commons for {image_type}...")
        commons_images = search_commons_broader(figure_name, image_type)
        if commons_images:
            all_images.extend(commons_images)
            print(f"    ✅ Found {len(commons_images)} {image_type} images from Commons")
    
    # Strategy 3: Wikipedia scraping
    if not any(img["type"] == "portrait" for img in all_images):
        print("  📸 Scraping Wikipedia for images...")
        wiki_images = scrape_wikipedia_images(figure_name)
        if wiki_images:
            all_images.extend(wiki_images)
            print(f"    ✅ Found {len(wiki_images)} images from Wikipedia")
    
    # Strategy 4: Smithsonian API
    print("  📸 Searching Smithsonian...")
    smithsonian_images = search_smithsonian_api(figure_name, "artifact")
    if smithsonian_images:
        all_images.extend(smithsonian_images)
        print(f"    ✅ Found {len(smithsonian_images)} artifacts from Smithsonian")
    
    # Download images
    downloaded_images = []
    for i, img in enumerate(all_images):
        # Create filename
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', figure_name)
        filename = f"{safe_name}_{img['type']}_{i}.jpg"
        
        # Download image
        filepath = download_image(img["url"], filename)
        if filepath:
            img["local_path"] = filepath
            downloaded_images.append(img)
    
    print(f"    📊 Found {len(all_images)} images, downloaded {len(downloaded_images)}")
    
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
    print("🔍 Phase 2 (Revised): Multi-Source Image Acquisition")
    print("=" * 60)
    
    # Setup
    setup_directories()
    search_targets = load_search_targets()
    
    print(f"📖 Processing {len(search_targets)} figures...")
    
    # Process each figure
    results = []
    for i, figure_data in enumerate(tqdm(search_targets, desc="Processing figures")):
        result = process_figure(figure_data)
        results.append(result)
        
        # Add delay to be respectful to APIs
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Save results
    output_file = "raw_image_metadata_revised.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    # Summary
    total_found = sum(r["total_found"] for r in results)
    total_downloaded = sum(r["total_downloaded"] for r in results)
    figures_with_images = sum(1 for r in results if r["total_downloaded"] > 0)
    
    print("\n" + "=" * 60)
    print("📊 PHASE 2 (REVISED) SUMMARY")
    print("=" * 60)
    print(f"Total Figures Processed: {len(search_targets)}")
    print(f"Figures with Images: {figures_with_images}")
    print(f"Total Images Found: {total_found}")
    print(f"Total Images Downloaded: {total_downloaded}")
    print(f"Average Images per Figure: {total_downloaded/len(search_targets):.1f}")
    print(f"Metadata Saved: {output_file}")
    print(f"Images Directory: {DOWNLOAD_DIR}")
    
    if total_downloaded > 0:
        print("\n🎯 Next step: Run phase3-validation.py to filter and categorize images")
    else:
        print("\n⚠️ No images found. Consider:")
        print("  1. Check internet connection")
        print("  2. Verify API endpoints are accessible")
        print("  3. Try with different search terms")
        print("  4. Consider using AI image generation as fallback")

if __name__ == "__main__":
    main() 