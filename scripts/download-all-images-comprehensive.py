#!/usr/bin/env python3
"""
Comprehensive Image Download Script
Downloads all images from multi_source_image_results.json with proper error handling
"""

import json
import requests
import os
import time
import hashlib
from urllib.parse import urlparse, unquote
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('image_download.log'),
        logging.StreamHandler()
    ]
)

class ComprehensiveImageDownloader:
    def __init__(self):
        self.download_dir = Path("downloaded_images")
        self.download_dir.mkdir(exist_ok=True)
        
        # Headers to avoid 403 errors
        self.headers = {
            'User-Agent': 'OrbGame-ImageDownloader/1.0 (https://orbgame.us; contact@orbgame.us) Python/3.x',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        self.stats = {
            'total_images': 0,
            'downloaded': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
    
    def sanitize_filename(self, url, figure_name, image_type, index):
        """Create a safe filename from URL and metadata"""
        try:
            # Extract filename from URL
            parsed_url = urlparse(url)
            original_filename = os.path.basename(parsed_url.path)
            
            # Clean the filename
            clean_filename = unquote(original_filename)
            clean_filename = clean_filename.replace(' ', '_')
            clean_filename = ''.join(c for c in clean_filename if c.isalnum() or c in '._-')
            
            # Create final filename
            safe_filename = f"{figure_name}_{image_type}_{index}_{clean_filename}"
            
            # Ensure it's not too long
            if len(safe_filename) > 200:
                extension = os.path.splitext(clean_filename)[1]
                safe_filename = f"{figure_name}_{image_type}_{index}{extension}"
            
            return safe_filename
        except Exception as e:
            # Fallback filename
            return f"{figure_name}_{image_type}_{index}.jpg"
    
    def download_image(self, url, figure_name, image_type, index):
        """Download a single image with error handling"""
        try:
            # Create safe filename
            filename = self.sanitize_filename(url, figure_name, image_type, index)
            filepath = self.download_dir / filename
            
            # Skip if already exists
            if filepath.exists():
                logging.info(f"⏭️  Skipped (exists): {filename}")
                self.stats['skipped'] += 1
                return True
            
            # Download image
            logging.info(f"⬇️  Downloading: {filename}")
            response = requests.get(url, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                # Save image
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                # Verify file size
                if filepath.stat().st_size > 0:
                    logging.info(f"✅ Downloaded: {filename} ({filepath.stat().st_size} bytes)")
                    self.stats['downloaded'] += 1
                    return True
                else:
                    logging.error(f"❌ Empty file: {filename}")
                    filepath.unlink(missing_ok=True)
                    self.stats['failed'] += 1
                    self.stats['errors'].append(f"Empty file: {url}")
                    return False
            else:
                logging.error(f"❌ HTTP {response.status_code}: {url}")
                self.stats['failed'] += 1
                self.stats['errors'].append(f"HTTP {response.status_code}: {url}")
                return False
                
        except requests.exceptions.Timeout:
            logging.error(f"⏰ Timeout: {url}")
            self.stats['failed'] += 1
            self.stats['errors'].append(f"Timeout: {url}")
            return False
        except requests.exceptions.RequestException as e:
            logging.error(f"🌐 Network error: {url} - {e}")
            self.stats['failed'] += 1
            self.stats['errors'].append(f"Network error: {url} - {e}")
            return False
        except Exception as e:
            logging.error(f"💥 Unexpected error: {url} - {e}")
            self.stats['failed'] += 1
            self.stats['errors'].append(f"Unexpected error: {url} - {e}")
            return False
    
    def process_figure(self, figure_data):
        """Process all images for a single figure"""
        figure_name = figure_data.get('figureName', 'Unknown')
        logging.info(f"\n🎯 Processing figure: {figure_name}")
        
        # Get the images object
        images_obj = figure_data.get('images', {})
        if not images_obj:
            logging.info(f"  ⚠️  No images found for {figure_name}")
            return
        
        # Process each image type
        image_types = ['portraits', 'achievements', 'inventions', 'artifacts']
        
        for image_type in image_types:
            images = images_obj.get(image_type, [])
            if not images:
                continue
                
            logging.info(f"  📸 {image_type}: {len(images)} images")
            
            for i, image in enumerate(images):
                url = image.get('url')
                if not url:
                    continue
                
                self.stats['total_images'] += 1
                self.download_image(url, figure_name, image_type, i)
                
                # Small delay to be respectful
                time.sleep(0.1)
    
    def download_all_images(self):
        """Download all images from the JSON file"""
        logging.info("🚀 Starting comprehensive image download...")
        
        try:
            # Load image data
            with open('multi_source_image_results.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            figures = data.get('figures', [])
            logging.info(f"📊 Found {len(figures)} figures with images")
            
            # Process each figure
            for i, figure in enumerate(figures, 1):
                logging.info(f"\n📋 Progress: {i}/{len(figures)} figures")
                self.process_figure(figure)
                
                # Progress update every 10 figures
                if i % 10 == 0:
                    self.print_stats()
            
            # Final stats
            self.print_final_stats()
            
        except FileNotFoundError:
            logging.error("❌ multi_source_image_results.json not found!")
            return False
        except json.JSONDecodeError as e:
            logging.error(f"❌ Invalid JSON: {e}")
            return False
        except Exception as e:
            logging.error(f"💥 Unexpected error: {e}")
            return False
        
        return True
    
    def print_stats(self):
        """Print current statistics"""
        logging.info(f"📈 Progress: {self.stats['downloaded']}/{self.stats['total_images']} downloaded, {self.stats['failed']} failed, {self.stats['skipped']} skipped")
    
    def print_final_stats(self):
        """Print final statistics"""
        logging.info("\n" + "="*50)
        logging.info("📊 FINAL DOWNLOAD STATISTICS")
        logging.info("="*50)
        logging.info(f"📸 Total Images: {self.stats['total_images']}")
        logging.info(f"✅ Downloaded: {self.stats['downloaded']}")
        logging.info(f"❌ Failed: {self.stats['failed']}")
        logging.info(f"⏭️  Skipped: {self.stats['skipped']}")
        logging.info(f"📁 Files in directory: {len(list(self.download_dir.glob('*')))}")
        
        if self.stats['errors']:
            logging.info(f"\n❌ Top 10 Errors:")
            for error in self.stats['errors'][:10]:
                logging.info(f"  - {error}")
        
        success_rate = (self.stats['downloaded'] / self.stats['total_images'] * 100) if self.stats['total_images'] > 0 else 0
        logging.info(f"\n🎯 Success Rate: {success_rate:.1f}%")

def main():
    downloader = ComprehensiveImageDownloader()
    success = downloader.download_all_images()
    
    if success:
        logging.info("🎉 Download process completed!")
    else:
        logging.error("💥 Download process failed!")
        exit(1)

if __name__ == "__main__":
    main() 