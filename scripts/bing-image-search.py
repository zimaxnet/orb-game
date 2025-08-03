#!/usr/bin/env python3
"""
Bing Image Search Implementation for Orb Game Historical Figures
Fills gaps for achievements, inventions, and artifacts
"""

import requests
import json
import time
import logging
from typing import Dict, List, Optional
import os
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bing_image_search.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class BingImageSearchService:
    """Bing Image Search service with fallback logic"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.endpoint = 'https://api.bing.microsoft.com/v7.0/images/search'
        self.session = requests.Session()
        
        # Fallback placeholder images (public domain)
        self.placeholder_images = {
            'portrait': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Generic_Feed_icon.svg/120px-Generic_Feed_icon.svg.png',
            'achievement': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Star_icon_1.svg/120px-Star_icon_1.svg.png',
            'invention': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Lightbulb_icon.svg/120px-Lightbulb_icon.svg.png',
            'artifact': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Ancient_artifact_icon.svg/120px-Ancient_artifact_icon.svg.png'
        }
        
        if self.api_key:
            self.session.headers.update({
                'Ocp-Apim-Subscription-Key': self.api_key
            })
            logger.info("✅ Bing API key configured")
        else:
            logger.warning("⚠️ No Bing API key provided - will use fallback images")
    
    def search_bing_images(self, query: str, image_type: str = 'Photo', count: int = 1) -> List[str]:
        """Search Bing Images API"""
        if not self.api_key:
            logger.warning(f"No API key - using fallback for query: {query}")
            return [self.placeholder_images.get(image_type, self.placeholder_images['achievement'])]
        
        try:
            params = {
                'q': query,
                'license': 'Any',
                'imageType': image_type,
                'count': count,
                'safeSearch': 'Strict',
                'mkt': 'en-US'
            }
            
            response = self.session.get(self.endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('value', [])
            
            if results:
                urls = [img['contentUrl'] for img in results if img.get('contentUrl')]
                logger.info(f"✅ Found {len(urls)} images for query: {query}")
                return urls
            else:
                logger.warning(f"No results for query: {query}")
                return [self.placeholder_images.get(image_type, self.placeholder_images['achievement'])]
                
        except Exception as e:
            logger.error(f"Bing API error for query '{query}': {e}")
            return [self.placeholder_images.get(image_type, self.placeholder_images['achievement'])]
    
    def generate_search_queries(self, figure_name: str, category: str, image_type: str) -> List[str]:
        """Generate optimized search queries for each image type"""
        queries = []
        
        if image_type == 'portrait':
            queries = [
                f'"{figure_name}" portrait',
                f'"{figure_name}" painting',
                f'"{figure_name}" bust',
                f'"{figure_name}" statue'
            ]
        elif image_type == 'achievement':
            # Use category context for achievements
            queries = [
                f'"{figure_name}" {category.lower()} achievement',
                f'"{figure_name}" {category.lower()} discovery',
                f'"{figure_name}" {category.lower()} contribution',
                f'"{figure_name}" {category.lower()} work'
            ]
        elif image_type == 'invention':
            queries = [
                f'"{figure_name}" invention',
                f'"{figure_name}" {category.lower()} invention',
                f'"{figure_name}" machine',
                f'"{figure_name}" device'
            ]
        elif image_type == 'artifact':
            queries = [
                f'"{figure_name}" artifact',
                f'"{figure_name}" {category.lower()} artifact',
                f'"{figure_name}" object',
                f'"{figure_name}" {category.lower()} object'
            ]
        
        return queries
    
    def fill_image_gaps(self, figures_data: List[Dict]) -> Dict:
        """Fill image gaps for all figures and image types"""
        
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
                'bing_api': 0,
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
            
            # Process each image type
            for image_type in image_types:
                # Generate search queries
                queries = self.generate_search_queries(figure_name, category, image_type)
                
                # Try each query until we get a result
                image_found = False
                for query in queries:
                    try:
                        urls = self.search_bing_images(query, 'Photo', 1)
                        if urls and urls[0]:
                            image_data = {
                                'url': urls[0],
                                'source': 'Bing Image Search' if self.api_key else 'Fallback',
                                'licensing': 'Unknown',
                                'reliability': 'Medium' if self.api_key else 'Low',
                                'searchTerm': query,
                                'priority': 80 if self.api_key else 20,
                                'source_name': 'bing_api' if self.api_key else 'fallback'
                            }
                            
                            figure_result['images'][image_type].append(image_data)
                            results['images_added'][image_type] += 1
                            
                            if self.api_key:
                                results['sources_used']['bing_api'] += 1
                            else:
                                results['sources_used']['fallback'] += 1
                            
                            image_found = True
                            logger.info(f"✅ Added {image_type} for {figure_name}: {urls[0]}")
                            break
                            
                    except Exception as e:
                        logger.warning(f"Query failed for {figure_name} ({image_type}): {query} - {e}")
                        continue
                
                if not image_found:
                    logger.warning(f"❌ No image found for {figure_name} ({image_type})")
            
            results['figures'].append(figure_result)
            results['processed'] += 1
            
            # Progress update
            if results['processed'] % 10 == 0:
                logger.info(f"Progress: {results['processed']}/{results['total_figures']} figures processed")
            
            # Rate limiting
            time.sleep(0.25)
        
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

def save_results(results: Dict, filename: str = 'bing_image_results.json'):
    """Save results to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        logger.info(f"Results saved to {filename}")
    except Exception as e:
        logger.error(f"Error saving results: {e}")

def main():
    """Main execution function"""
    logger.info("🚀 Starting Bing Image Search for Orb Game")
    
    # Get Bing API key from environment or Key Vault
    bing_api_key = os.getenv('BING_API_KEY')
    if not bing_api_key:
        try:
            import subprocess
            result = subprocess.run([
                'az', 'keyvault', 'secret', 'show', 
                '--name', 'BING-API-KEY', 
                '--vault-name', 'orb-game-kv-eastus2', 
                '--query', 'value', '-o', 'tsv'
            ], capture_output=True, text=True)
            if result.returncode == 0:
                bing_api_key = result.stdout.strip()
                logger.info("✅ Retrieved Bing API key from Azure Key Vault")
            else:
                logger.warning("⚠️ No Bing API key found in Key Vault - will use fallbacks")
        except Exception as e:
            logger.warning(f"Could not retrieve Bing API key: {e}")
    
    # Load figures data
    figures_data = load_figures_data()
    if not figures_data:
        logger.error("No figures data found")
        return
    
    # Initialize Bing search service
    service = BingImageSearchService(bing_api_key)
    
    # Fill image gaps
    results = service.fill_image_gaps(figures_data)
    
    # Save results
    save_results(results)
    
    # Print summary
    logger.info("=== BING IMAGE SEARCH SUMMARY ===")
    logger.info(f"Total figures processed: {results['processed']}")
    
    for image_type, count in results['images_added'].items():
        logger.info(f"{image_type}: {count} images added")
    
    logger.info("Sources used:")
    for source, count in results['sources_used'].items():
        logger.info(f"  {source}: {count} images")
    
    logger.info("✅ Bing image search completed")

if __name__ == "__main__":
    main() 