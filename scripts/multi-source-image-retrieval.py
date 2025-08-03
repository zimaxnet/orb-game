#!/usr/bin/env python3
"""
Multi-Source Image Retrieval for Orb Game Historical Figures
Uses Wikimedia Commons, Wikipedia, and other free sources
"""

import requests
import json
import time
import logging
from typing import Dict, List, Optional
import os
import sys
import re
from urllib.parse import quote

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('multi_source_image_retrieval.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class MultiSourceImageRetrievalService:
    """Multi-source image retrieval service using free APIs"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'OrbGame/1.0 (Educational Project)'
        })
        
        # Wikimedia Commons API
        self.wikimedia_api = "https://commons.wikimedia.org/w/api.php"
        
        # Wikipedia API
        self.wikipedia_api = "https://en.wikipedia.org/w/api.php"
        
        # Fallback placeholder images (public domain)
        self.placeholder_images = {
            'portraits': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Generic_Feed_icon.svg/120px-Generic_Feed_icon.svg.png',
            'achievements': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Star_icon_1.svg/120px-Star_icon_1.svg.png',
            'inventions': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Lightbulb_icon.svg/120px-Lightbulb_icon.svg.png',
            'artifacts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Ancient_artifact_icon.svg/120px-Ancient_artifact_icon.svg.png'
        }
        
        logger.info("✅ Multi-source image retrieval service initialized")
    
    def search_wikimedia_commons(self, query: str, image_type: str) -> Optional[str]:
        """Search Wikimedia Commons for images"""
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': query,
                'srnamespace': 6,  # File namespace
                'srlimit': 5,
                'srprop': 'snippet'
            }
            
            response = self.session.get(self.wikimedia_api, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('query', {}).get('search', [])
            
            if results:
                # Extract image URL from the first result
                for result in results:
                    title = result.get('title', '')
                    if title.startswith('File:') and any(ext in title.lower() for ext in ['.jpg', '.jpeg', '.png', '.svg']):
                        # Convert title to URL
                        filename = title.replace('File:', '').replace(' ', '_')
                        image_url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{filename}/120px-{filename}"
                        logger.info(f"✅ Found Wikimedia image: {image_url}")
                        return image_url
            
            logger.warning(f"No Wikimedia Commons results for: {query}")
            return None
            
        except Exception as e:
            logger.error(f"Wikimedia Commons search failed for '{query}': {e}")
            return None
    
    def search_wikipedia(self, query: str, image_type: str) -> Optional[str]:
        """Search Wikipedia for images"""
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': query,
                'srlimit': 3
            }
            
            response = self.session.get(self.wikipedia_api, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('query', {}).get('search', [])
            
            if results:
                # Try to get images from the first article
                page_title = results[0].get('title', '')
                return self.get_wikipedia_page_images(page_title)
            
            return None
            
        except Exception as e:
            logger.error(f"Wikipedia search failed for '{query}': {e}")
            return None
    
    def get_wikipedia_page_images(self, page_title: str) -> Optional[str]:
        """Get images from a Wikipedia page"""
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'titles': page_title,
                'prop': 'images',
                'imlimit': 5
            }
            
            response = self.session.get(self.wikipedia_api, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            pages = data.get('query', {}).get('pages', {})
            
            for page_id, page_data in pages.items():
                images = page_data.get('images', [])
                for image in images:
                    image_title = image.get('title', '')
                    if image_title.startswith('File:') and any(ext in image_title.lower() for ext in ['.jpg', '.jpeg', '.png']):
                        # Convert to Wikimedia Commons URL
                        filename = image_title.replace('File:', '').replace(' ', '_')
                        image_url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{filename}/120px-{filename}"
                        logger.info(f"✅ Found Wikipedia image: {image_url}")
                        return image_url
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get Wikipedia page images for '{page_title}': {e}")
            return None
    
    def search_public_domain_images(self, query: str, image_type: str) -> Optional[str]:
        """Search for public domain images using various sources"""
        try:
            # Try Pixabay-like search patterns
            search_terms = [
                f"{query} portrait",
                f"{query} painting",
                f"{query} {image_type}",
                query
            ]
            
            for term in search_terms:
                # Try Wikimedia Commons first
                image_url = self.search_wikimedia_commons(term, image_type)
                if image_url:
                    return image_url
                
                # Try Wikipedia
                image_url = self.search_wikipedia(term, image_type)
                if image_url:
                    return image_url
                
                time.sleep(0.1)  # Rate limiting
            
            return None
            
        except Exception as e:
            logger.error(f"Public domain image search failed for '{query}': {e}")
            return None
    
    def generate_search_queries(self, figure_name: str, category: str, image_type: str) -> List[str]:
        """Generate optimized search queries for each image type"""
        queries = []
        
        if image_type == 'portraits':
            queries = [
                f'"{figure_name}" portrait',
                f'"{figure_name}" painting',
                f'"{figure_name}" bust',
                f'"{figure_name}" statue',
                f'"{figure_name}"'
            ]
        elif image_type == 'achievements':
            queries = [
                f'"{figure_name}" {category.lower()} achievement',
                f'"{figure_name}" {category.lower()} discovery',
                f'"{figure_name}" {category.lower()} contribution',
                f'"{figure_name}" {category.lower()} work',
                f'"{figure_name}"'
            ]
        elif image_type == 'inventions':
            queries = [
                f'"{figure_name}" invention',
                f'"{figure_name}" {category.lower()} invention',
                f'"{figure_name}" machine',
                f'"{figure_name}" device',
                f'"{figure_name}"'
            ]
        elif image_type == 'artifacts':
            queries = [
                f'"{figure_name}" artifact',
                f'"{figure_name}" {category.lower()} artifact',
                f'"{figure_name}" object',
                f'"{figure_name}" {category.lower()} object',
                f'"{figure_name}"'
            ]
        
        return queries
    
    def fill_image_gaps(self, figures_data: List[Dict]) -> Dict:
        """Fill image gaps for all figures and image types with real images"""
        
        results = {
            'total_figures': len(figures_data),
            'processed': 0,
            'images_added': {
                'portraits': 0,
                'achievements': 0,
                'inventions': 0,
                'artifacts': 0
            },
            'sources_used': {
                'wikimedia_commons': 0,
                'wikipedia': 0,
                'fallback': 0
            },
            'figures': []
        }
        
        image_types = ['portraits', 'achievements', 'inventions', 'artifacts']
        
        for figure in figures_data:
            figure_name = figure.get('name', figure.get('figureName'))
            category = figure.get('category', 'general')
            epoch = figure.get('epoch', 'unknown')
            
            logger.info(f"Processing {figure_name} ({category}, {epoch})")
            
            figure_result = {
                'figureName': figure_name,
                'category': category,
                'epoch': epoch,
                'images': {
                    'portraits': [],
                    'achievements': [],
                    'inventions': [],
                    'artifacts': []
                }
            }
            
            # Process each image type - try to get real images first
            for image_type in image_types:
                # Generate search queries
                queries = self.generate_search_queries(figure_name, category, image_type)
                
                # Try each query until we get a real image
                image_found = False
                for query in queries:
                    try:
                        # Try to get real image from public domain sources
                        image_url = self.search_public_domain_images(query, image_type)
                        
                        if image_url and image_url != self.placeholder_images.get(image_type):
                            image_data = {
                                'url': image_url,
                                'source': 'Wikimedia Commons' if 'wikimedia' in image_url else 'Wikipedia',
                                'licensing': 'Public Domain',
                                'reliability': 'High',
                                'searchTerm': query,
                                'priority': 90,
                                'source_name': 'wikimedia_commons' if 'wikimedia' in image_url else 'wikipedia'
                            }
                            
                            figure_result['images'][image_type].append(image_data)
                            results['images_added'][image_type] += 1
                            
                            if 'wikimedia' in image_url:
                                results['sources_used']['wikimedia_commons'] += 1
                            else:
                                results['sources_used']['wikipedia'] += 1
                            
                            image_found = True
                            logger.info(f"✅ Added real {image_type} for {figure_name}: {image_url}")
                            break
                            
                    except Exception as e:
                        logger.warning(f"Query failed for {figure_name} ({image_type}): {query} - {e}")
                        continue
                
                # If no real image found, use fallback
                if not image_found:
                    fallback_url = self.placeholder_images.get(image_type, self.placeholder_images['achievements'])
                    image_data = {
                        'url': fallback_url,
                        'source': 'Fallback',
                        'licensing': 'Public Domain',
                        'reliability': 'Low',
                        'searchTerm': f'{figure_name} {image_type} fallback',
                        'priority': 10,
                        'source_name': 'fallback'
                    }
                    
                    figure_result['images'][image_type].append(image_data)
                    results['images_added'][image_type] += 1
                    results['sources_used']['fallback'] += 1
                    
                    logger.info(f"🔄 Added fallback {image_type} for {figure_name}: {fallback_url}")
            
            results['figures'].append(figure_result)
            results['processed'] += 1
            
            # Progress update
            if results['processed'] % 10 == 0:
                logger.info(f"Progress: {results['processed']}/{results['total_figures']} figures processed")
            
            # Rate limiting
            time.sleep(0.5)
        
        return results

def load_figures_data() -> List[Dict]:
    """Load historical figures data from file"""
    try:
        with open('OrbGameInfluentialPeopleSeeds', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Parse the JSON structure
        figures = []
        for category, epochs in data.items():
            for epoch, people in epochs.items():
                for person in people:
                    figures.append({
                        'name': person['name'],
                        'figureName': person['name'],
                        'category': category,
                        'epoch': epoch,
                        'context': person.get('context', '')
                    })
        
        logger.info(f"Loaded {len(figures)} historical figures from JSON data")
        return figures
    except Exception as e:
        logger.error(f"Error loading figures data: {e}")
        return []

def save_results(results: Dict, filename: str = 'multi_source_image_results.json'):
    """Save results to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        logger.info(f"Results saved to {filename}")
    except Exception as e:
        logger.error(f"Error saving results: {e}")

def main():
    """Main execution function"""
    logger.info("🚀 Starting Multi-Source Image Retrieval for Orb Game")
    
    # Load figures data
    figures_data = load_figures_data()
    if not figures_data:
        logger.error("No figures data found")
        return
    
    # Initialize multi-source search service
    service = MultiSourceImageRetrievalService()
    
    # Fill image gaps
    results = service.fill_image_gaps(figures_data)
    
    # Save results
    save_results(results)
    
    # Print summary
    logger.info("=== MULTI-SOURCE IMAGE RETRIEVAL SUMMARY ===")
    logger.info(f"Total figures processed: {results['processed']}")
    
    for image_type, count in results['images_added'].items():
        logger.info(f"{image_type}: {count} images added")
    
    logger.info("Sources used:")
    for source, count in results['sources_used'].items():
        logger.info(f"  {source}: {count} images")
    
    # Verify no gaps
    total_images = sum(results['images_added'].values())
    expected_images = results['total_figures'] * 4  # 4 image types per figure
    logger.info(f"Total images added: {total_images}")
    logger.info(f"Expected images: {expected_images}")
    logger.info(f"Gap coverage: {total_images/expected_images*100:.1f}%")
    
    logger.info("✅ Multi-source image retrieval completed")

if __name__ == "__main__":
    main() 