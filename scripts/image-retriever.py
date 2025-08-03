#!/usr/bin/env python3
"""
Orb Game Image Retriever
Systematic image gathering for historical figures
"""

import requests
import json
import hashlib
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse
import time
from tqdm import tqdm
from PIL import Image
import io
import pymongo
from pathlib import Path

class ImageRetriever:
    """
    Systematic image retriever for historical figures
    """
    
    def __init__(self, mongo_uri: str, output_dir: str = "images"):
        self.session = requests.Session()
        self.mongo_client = pymongo.MongoClient(mongo_uri)
        self.db = self.mongo_client.orbgame
        self.images_collection = self.db.historical_figure_images
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # API endpoints
        self.apis = {
            "wikimedia": "https://commons.wikimedia.org/api/rest_v1/",
            "smithsonian": "https://api.si.edu/openaccess/api/v1.0/",
            "met": "https://collectionapi.metmuseum.org/public/collection/v1/",
            "europeana": "https://api.europeana.eu/record/v2/search.json",
            "nasa": "https://images-api.nasa.gov/search"
        }
        
        # Image types to search for
        self.image_types = ["portrait", "achievement", "invention", "artifact"]
        
    def load_historical_figures(self) -> Dict:
        """Load historical figures from JSON file"""
        try:
            with open("historical-figures-achievements.json", "r") as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ historical-figures-achievements.json not found")
            return {}
    
    def generate_search_terms(self, figure_name: str, category: str, achievement: str) -> Dict[str, List[str]]:
        """Generate search terms for each image type"""
        base_terms = [
            f'"{figure_name}"',
            f'"{figure_name} {category.lower()}"'
        ]
        
        # Extract key words from achievement
        achievement_words = achievement.lower().split()
        key_words = [word for word in achievement_words if len(word) > 3]
        
        return {
            "portrait": [
                f'"{figure_name} portrait"',
                f'"{figure_name} bust"',
                f'"{figure_name} statue"',
                f'"{figure_name} painting"'
            ],
            "achievement": [
                f'"{figure_name} {achievement_words[0]}"',
                f'"{figure_name} {achievement_words[1]}"' if len(achievement_words) > 1 else f'"{figure_name} achievement"',
                f'"{figure_name} discovery"',
                f'"{figure_name} contribution"'
            ],
            "invention": [
                f'"{figure_name} invention"',
                f'"{figure_name} device"',
                f'"{figure_name} machine"',
                f'"{figure_name} tool"'
            ],
            "artifact": [
                f'"{figure_name} artifact"',
                f'"{figure_name} object"',
                f'"{figure_name} relic"',
                f'"{figure_name} instrument"'
            ]
        }
    
    def search_wikimedia(self, search_term: str, image_type: str) -> List[Dict]:
        """Search Wikimedia Commons for images"""
        images = []
        
        try:
            # Wikimedia Commons API search
            search_url = f"{self.apis['wikimedia']}search/page"
            params = {
                "q": search_term,
                "type": "bitmap",
                "limit": 10
            }
            
            response = self.session.get(search_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            for page in data.get("pages", []):
                if "thumbnail" in page:
                    image_info = {
                        "url": page["thumbnail"]["source"],
                        "source": "Wikimedia Commons",
                        "license": "Public Domain",
                        "attribution": page.get("title", ""),
                        "type": image_type,
                        "confidence": 0.9
                    }
                    images.append(image_info)
                    
        except Exception as e:
            print(f"⚠️ Wikimedia search failed for '{search_term}': {e}")
            
        return images
    
    def search_smithsonian(self, search_term: str, image_type: str) -> List[Dict]:
        """Search Smithsonian Open Access API"""
        images = []
        
        try:
            search_url = self.apis["smithsonian"]
            params = {
                "q": search_term,
                "type": "edanmdm",
                "size": 10
            }
            
            response = self.session.get(search_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            for record in data.get("response", {}).get("rows", []):
                if "content" in record and "descriptiveNonRepeating" in record["content"]:
                    content = record["content"]["descriptiveNonRepeating"]
                    if "online_media" in content and "media" in content["online_media"]:
                        for media in content["online_media"]["media"]:
                            if "thumbnail" in media:
                                image_info = {
                                    "url": media["thumbnail"],
                                    "source": "Smithsonian Collections",
                                    "license": "Public Domain",
                                    "attribution": content.get("title", {}).get("content", ""),
                                    "type": image_type,
                                    "confidence": 0.85
                                }
                                images.append(image_info)
                                
        except Exception as e:
            print(f"⚠️ Smithsonian search failed for '{search_term}': {e}")
            
        return images
    
    def download_and_validate(self, image_info: Dict, figure_name: str) -> Optional[Dict]:
        """Download, validate, and process image"""
        try:
            # Download image
            response = self.session.get(image_info["url"], timeout=30)
            response.raise_for_status()
            
            # Open with PIL for validation
            img = Image.open(io.BytesIO(response.content))
            
            # Validate dimensions
            width, height = img.size
            if width < 200 or height < 200:
                return None  # Too small
            if width > 1024 or height > 1024:
                # Resize if too large
                img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                width, height = img.size
            
            # Check aspect ratio
            ratio = width / height
            if ratio < 0.3 or ratio > 3.0:
                return None  # Poor aspect ratio
            
            # Generate filename
            url_hash = hashlib.md5(image_info["url"].encode()).hexdigest()[:8]
            filename = f"{figure_name.lower().replace(' ', '_')}_{image_info['type']}_{url_hash}.jpg"
            filepath = self.output_dir / filename
            
            # Save image
            img.save(filepath, "JPEG", quality=85)
            
            # Update image info
            image_info.update({
                "localPath": str(filepath),
                "width": width,
                "height": height,
                "fileSize": filepath.stat().st_size,
                "retrieved": datetime.now().isoformat()
            })
            
            return image_info
            
        except Exception as e:
            print(f"⚠️ Failed to download {image_info['url']}: {e}")
            return None
    
    def search_figure_images(self, figure_name: str, category: str, epoch: str, achievement: str) -> List[Dict]:
        """Search for all image types for a figure"""
        all_images = []
        search_terms = self.generate_search_terms(figure_name, category, achievement)
        
        print(f"🔍 Searching for images of {figure_name} ({category}/{epoch})")
        
        for image_type, terms in search_terms.items():
            print(f"  📸 Searching {image_type} images...")
            
            for search_term in terms:
                # Search multiple sources
                images = []
                images.extend(self.search_wikimedia(search_term, image_type))
                images.extend(self.search_smithsonian(search_term, image_type))
                
                # Download and validate
                for image_info in images:
                    processed_image = self.download_and_validate(image_info, figure_name)
                    if processed_image:
                        processed_image["figureName"] = figure_name
                        processed_image["category"] = category
                        processed_image["epoch"] = epoch
                        all_images.append(processed_image)
                        break  # Take first valid image of this type
                
                time.sleep(1)  # Rate limiting
        
        return all_images
    
    def store_figure_images(self, figure_name: str, category: str, epoch: str, images: List[Dict]) -> bool:
        """Store images in MongoDB"""
        try:
            if not images:
                return False
            
            # Calculate coverage
            coverage = {}
            for img_type in self.image_types:
                coverage[img_type] = len([img for img in images if img["type"] == img_type])
            
            # Prepare document
            doc = {
                "figureName": figure_name,
                "category": category,
                "epoch": epoch,
                "images": images,
                "lastUpdated": datetime.now(),
                "totalImages": len(images),
                "coverage": coverage
            }
            
            # Upsert to database
            filter_query = {
                "figureName": figure_name,
                "category": category,
                "epoch": epoch
            }
            
            result = self.images_collection.replace_one(
                filter_query, doc, upsert=True
            )
            
            print(f"✅ Stored {len(images)} images for {figure_name}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to store images for {figure_name}: {e}")
            return False
    
    def process_all_figures(self) -> Dict:
        """Process all historical figures"""
        figures_data = self.load_historical_figures()
        
        if not figures_data:
            print("❌ No figures data loaded")
            return {}
        
        results = {
            "total_figures": 0,
            "processed_figures": 0,
            "successful_figures": 0,
            "total_images": 0,
            "coverage": {}
        }
        
        # Count total figures
        for category, epochs in figures_data.items():
            if category == "metadata":
                continue
            for epoch, figures in epochs.items():
                results["total_figures"] += len(figures)
        
        print(f"🎯 Processing {results['total_figures']} historical figures...")
        
        # Process each figure
        for category, epochs in figures_data.items():
            if category == "metadata":
                continue
                
            for epoch, figures in epochs.items():
                for figure in figures:
                    figure_name = figure["name"]
                    achievement = figure["achievement"]
                    
                    results["processed_figures"] += 1
                    
                    print(f"\n📋 Processing {results['processed_figures']}/{results['total_figures']}: {figure_name}")
                    
                    # Search for images
                    images = self.search_figure_images(figure_name, category, epoch, achievement)
                    
                    if images:
                        # Store in database
                        success = self.store_figure_images(figure_name, category, epoch, images)
                        if success:
                            results["successful_figures"] += 1
                            results["total_images"] += len(images)
                            
                            # Update coverage
                            for img in images:
                                img_type = img["type"]
                                if img_type not in results["coverage"]:
                                    results["coverage"][img_type] = 0
                                results["coverage"][img_type] += 1
                    
                    time.sleep(2)  # Rate limiting between figures
        
        return results
    
    def generate_report(self, results: Dict):
        """Generate coverage report"""
        print("\n" + "="*50)
        print("📊 IMAGE RETRIEVAL REPORT")
        print("="*50)
        print(f"Total Figures: {results['total_figures']}")
        print(f"Processed: {results['processed_figures']}")
        print(f"Successful: {results['successful_figures']}")
        print(f"Total Images: {results['total_images']}")
        print(f"Success Rate: {(results['successful_figures']/results['total_figures']*100):.1f}%")
        
        print("\nCoverage by Type:")
        for img_type, count in results["coverage"].items():
            percentage = (count / results["total_figures"]) * 100
            print(f"  {img_type.capitalize()}: {count}/{results['total_figures']} ({percentage:.1f}%)")
        
        print("="*50)

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Orb Game Image Retriever")
    parser.add_argument("--mongo-uri", required=True, help="MongoDB connection string")
    parser.add_argument("--output-dir", default="images", help="Output directory for images")
    parser.add_argument("--test", action="store_true", help="Test with first 5 figures only")
    
    args = parser.parse_args()
    
    # Initialize retriever
    retriever = ImageRetriever(args.mongo_uri, args.output_dir)
    
    if args.test:
        print("🧪 TEST MODE: Processing first 5 figures only")
        # Test with first 5 figures
        figures_data = retriever.load_historical_figures()
        count = 0
        for category, epochs in figures_data.items():
            if category == "metadata":
                continue
            for epoch, figures in epochs.items():
                for figure in figures[:2]:  # Take first 2 from each epoch
                    if count >= 5:
                        break
                    figure_name = figure["name"]
                    achievement = figure["achievement"]
                    
                    print(f"🧪 Testing with {figure_name}")
                    images = retriever.search_figure_images(figure_name, category, epoch, achievement)
                    retriever.store_figure_images(figure_name, category, epoch, images)
                    count += 1
                if count >= 5:
                    break
            if count >= 5:
                break
    else:
        # Process all figures
        results = retriever.process_all_figures()
        retriever.generate_report(results)

if __name__ == "__main__":
    main() 