#!/usr/bin/env python3
"""
Download Google Custom Search Images
Downloads images from the google_custom_search_results.json file to the downloaded_images folder.
"""

import json
import os
import requests
from pathlib import Path
import time
from urllib.parse import urlparse

def download_image(url, filename, folder="downloaded_images"):
    """Download an image from URL to the specified folder."""
    try:
        # Create folder if it doesn't exist
        Path(folder).mkdir(exist_ok=True)
        
        # Full path for the image
        filepath = os.path.join(folder, filename)
        
        # Skip if file already exists
        if os.path.exists(filepath):
            print(f"⏭️  Skipping {filename} (already exists)")
            return True
        
        # Set proper headers for different sites
        headers = {
            'User-Agent': 'OrbGame-ImageDownloader/1.0 (https://orbgame.us; contact@orbgame.us) Python/3.x',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        # Download the image
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Save the image
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded {filename}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {filename}: {e}")
        return False

def sanitize_filename(name):
    """Convert a name to a safe filename."""
    # Replace spaces and special characters
    safe_name = name.replace(' ', '_').replace('/', '_').replace('\\', '_')
    safe_name = ''.join(c for c in safe_name if c.isalnum() or c in '_-')
    return safe_name

def download_all_images():
    """Download all images from the Google Custom Search results."""
    
    # Load the results
    try:
        with open('google_custom_search_results.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ google_custom_search_results.json not found!")
        print("Run python3 scripts/google-custom-search.py first")
        return
    except Exception as e:
        print(f"❌ Error reading JSON file: {e}")
        return
    
    print("📥 DOWNLOADING GOOGLE CUSTOM SEARCH IMAGES")
    print("=" * 50)
    
    total_images = 0
    successful_downloads = 0
    failed_downloads = 0
    
    # Process each figure in the figures array
    for figure in data.get('figures', []):
        figure_name = figure.get('figureName', 'Unknown')
        print(f"\n👤 Processing {figure_name}...")
        
        # Get images for this figure
        images = figure.get('images', {})
        
        # Download each image type
        for image_type, image_list in images.items():
            if image_list and len(image_list) > 0:
                # Get the first image URL
                image_data = image_list[0]
                image_url = image_data.get('url', '')
                
                if image_url and image_url.startswith('http'):
                    # Create filename
                    safe_name = sanitize_filename(figure_name)
                    filename = f"{safe_name}_{image_type}_0.jpg"
                    
                    total_images += 1
                    if download_image(image_url, filename):
                        successful_downloads += 1
                    else:
                        failed_downloads += 1
                    
                    # Small delay to be respectful to servers
                    time.sleep(0.2)
    
    # Summary
    print(f"\n📊 DOWNLOAD SUMMARY")
    print("=" * 30)
    print(f"📁 Total images: {total_images}")
    print(f"✅ Successful: {successful_downloads}")
    print(f"❌ Failed: {failed_downloads}")
    print(f"📈 Success rate: {(successful_downloads/total_images*100):.1f}%" if total_images > 0 else "📈 Success rate: 0%")
    
    if successful_downloads > 0:
        print(f"\n🎉 Successfully downloaded {successful_downloads} images!")
        print(f"📁 Check the 'downloaded_images' folder for your images")
    else:
        print(f"\n⚠️  No images were downloaded successfully")

if __name__ == "__main__":
    download_all_images() 