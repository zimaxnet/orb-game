#!/usr/bin/env python3
"""
Real Image Retrieval Script for Orb Game Historical Figures
Implements multi-source image search with validation and fallback logic
"""

import requests
import json
import time
import logging
from PIL import Image
from io import BytesIO
from typing import Dict, List, Optional, Tuple
import os
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('image_retrieval.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ImageRetrievalService:
    """Multi-source image retrieval service with validation and fallback logic"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'OrbGame-ImageRetrieval/1.0 (Educational Project)'
        })
        
        # Source priority configuration
        self.sources = {
            'portraits': [
                ('wikidata', self.get_wikidata_portrait, 100),
                ('wikipedia', self.get_wikipedia_portrait, 90),
                ('google_images', self.get_google_image, 80),
                ('bing_images', self.get_bing_image, 75),
                ('museum_apis', self.get_museum_image, 70)
            ],
            'achievements': [
                ('wikimedia_commons', self.get_wikimedia_achievement, 95),
                ('wikipedia', self.get_wikipedia_achievement, 85),
                ('google_images', self.get_google_image, 80),
                ('bing_images', self.get_bing_image, 75)
            ],
            'inventions': [
                ('wikimedia_commons', self.get_wikimedia_invention, 95),
                ('patent_apis', self.get_patent_image, 90),
                ('wikipedia', self.get_wikipedia_invention, 85),
                ('google_images', self.get_google_image, 80)
            ],
            'artifacts': [
                ('museum_apis', self.get_museum_artifact, 95),
                ('wikimedia_commons', self.get_wikimedia_artifact, 90),
                ('wikipedia', self.get_wikipedia_artifact, 85),
                ('google_images', self.get_google_image, 80)
            ]
        }
    
    def get_wikidata_portrait(self, figure_name: str) -> Optional[Dict]:
        """Retrieve portrait from Wikidata using SPARQL"""
        try:
            query = f"""
            SELECT ?image ?imageLabel WHERE {{
              ?person rdfs:label "{figure_name}"@en.
              ?person wdt:P18 ?image.
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            LIMIT 1
            """
            
            url = 'https://query.wikidata.org/sparql'
            params = {'format': 'json', 'query': query}
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            results = response.json().get('results', {}).get('bindings', [])
            if results:
                image_url = results[0]['image']['value']
                return {
                    'url': image_url,
                    'source': 'Wikidata',
                    'licensing': 'Public Domain',
                    'reliability': 'High',
                    'searchTerm': f"{figure_name} portrait"
                }
        except Exception as e:
            logger.warning(f"Wikidata search failed for {figure_name}: {e}")
        
        return None
    
    def get_wikipedia_portrait(self, figure_name: str) -> Optional[Dict]:
        """Retrieve portrait from Wikipedia/Wikimedia Commons"""
        try:
            # Search Wikipedia for the figure
            wiki_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{figure_name.replace(' ', '_')}"
            response = self.session.get(wiki_url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if 'thumbnail' in data:
                return {
                    'url': data['thumbnail']['source'],
                    'source': 'Wikipedia',
                    'licensing': 'Public Domain',
                    'reliability': 'High',
                    'searchTerm': f"{figure_name} portrait"
                }
        except Exception as e:
            logger.warning(f"Wikipedia search failed for {figure_name}: {e}")
        
        return None
    
    def get_wikipedia_achievement(self, figure_name: str, category: str) -> Optional[Dict]:
        """Retrieve achievement images from Wikipedia"""
        try:
            search_term = f"{figure_name} {category.lower()}"
            # This would need Wikipedia API integration
            # For now, return None as placeholder
            logger.info(f"Wikipedia achievement search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Wikipedia achievement search failed for {figure_name}: {e}")
        
        return None
    
    def get_wikipedia_invention(self, figure_name: str) -> Optional[Dict]:
        """Retrieve invention images from Wikipedia"""
        try:
            search_term = f"{figure_name} invention"
            # This would need Wikipedia API integration
            # For now, return None as placeholder
            logger.info(f"Wikipedia invention search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Wikipedia invention search failed for {figure_name}: {e}")
        
        return None
    
    def get_wikipedia_artifact(self, figure_name: str, category: str) -> Optional[Dict]:
        """Retrieve artifact images from Wikipedia"""
        try:
            search_term = f"{figure_name} artifact"
            # This would need Wikipedia API integration
            # For now, return None as placeholder
            logger.info(f"Wikipedia artifact search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Wikipedia artifact search failed for {figure_name}: {e}")
        
        return None
    
    def get_wikimedia_invention(self, figure_name: str) -> Optional[Dict]:
        """Retrieve invention images from Wikimedia Commons"""
        try:
            search_term = f"{figure_name} invention"
            # This would need Wikimedia Commons API integration
            # For now, return None as placeholder
            logger.info(f"Wikimedia Commons invention search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Wikimedia Commons invention search failed for {figure_name}: {e}")
        
        return None
    
    def get_wikimedia_artifact(self, figure_name: str, category: str) -> Optional[Dict]:
        """Retrieve artifact images from Wikimedia Commons"""
        try:
            search_term = f"{figure_name} artifact"
            # This would need Wikimedia Commons API integration
            # For now, return None as placeholder
            logger.info(f"Wikimedia Commons artifact search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Wikimedia Commons artifact search failed for {figure_name}: {e}")
        
        return None
    
    def get_wikimedia_achievement(self, figure_name: str, category: str) -> Optional[Dict]:
        """Retrieve achievement images from Wikimedia Commons"""
        try:
            search_term = f"{figure_name} {category.lower()}"
            # This would need Wikimedia Commons API integration
            # For now, return None as placeholder
            logger.info(f"Wikimedia Commons achievement search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Wikimedia Commons achievement search failed for {figure_name}: {e}")
        
        return None
    
    def get_museum_artifact(self, figure_name: str, category: str) -> Optional[Dict]:
        """Retrieve artifact images from museum APIs"""
        try:
            search_term = f"{figure_name} artifact"
            # This would integrate with various museum APIs
            # For now, return None as placeholder
            logger.info(f"Museum API artifact search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Museum API artifact search failed for {figure_name}: {e}")
        
        return None
    
    def get_google_image(self, figure_name: str, image_type: str) -> Optional[Dict]:
        """Retrieve images from Google Images (requires API key)"""
        try:
            # This would require Google Custom Search API
            # For now, return None as placeholder
            search_term = f"{figure_name} {image_type}"
            logger.info(f"Google Images search for {search_term} (requires API key)")
            return None
        except Exception as e:
            logger.warning(f"Google Images search failed for {figure_name}: {e}")
        
        return None
    
    def get_bing_image(self, figure_name: str, image_type: str) -> Optional[Dict]:
        """Retrieve images from Bing Images (requires API key)"""
        try:
            # This would require Bing Search API
            # For now, return None as placeholder
            search_term = f"{figure_name} {image_type}"
            logger.info(f"Bing Images search for {search_term} (requires API key)")
            return None
        except Exception as e:
            logger.warning(f"Bing Images search failed for {figure_name}: {e}")
        
        return None
    
    def get_museum_image(self, figure_name: str, image_type: str) -> Optional[Dict]:
        """Retrieve images from museum APIs"""
        try:
            # This would integrate with various museum APIs
            # For now, return None as placeholder
            search_term = f"{figure_name} {image_type}"
            logger.info(f"Museum API search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Museum API search failed for {figure_name}: {e}")
        
        return None
    
    def get_patent_image(self, figure_name: str) -> Optional[Dict]:
        """Retrieve patent images for inventions"""
        try:
            # This would integrate with patent databases
            # For now, return None as placeholder
            search_term = f"{figure_name} invention patent"
            logger.info(f"Patent API search for {search_term} (not implemented)")
            return None
        except Exception as e:
            logger.warning(f"Patent API search failed for {figure_name}: {e}")
        
        return None
    
    def is_valid_image(self, url: str) -> bool:
        """Validate image URL and format"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Check if it's actually an image
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                return False
            
            # Verify image can be opened
            img = Image.open(BytesIO(response.content))
            img.verify()
            
            return True
        except Exception as e:
            logger.warning(f"Image validation failed for {url}: {e}")
            return False
    
    def get_image_with_fallback(self, figure_name: str, image_type: str, category: str = None) -> Optional[Dict]:
        """Get image using multi-source fallback strategy"""
        
        if image_type not in self.sources:
            logger.error(f"Unknown image type: {image_type}")
            return None
        
        for source_name, source_func, priority in self.sources[image_type]:
            try:
                logger.info(f"Trying {source_name} for {figure_name} ({image_type})")
                
                if image_type == 'portraits':
                    image_data = source_func(figure_name)
                elif image_type == 'inventions':
                    image_data = source_func(figure_name)
                else:
                    image_data = source_func(figure_name, category or 'general')
                
                if image_data and self.is_valid_image(image_data['url']):
                    image_data['priority'] = priority
                    image_data['source_name'] = source_name
                    logger.info(f"✅ Found image via {source_name} for {figure_name}")
                    return image_data
                else:
                    logger.warning(f"❌ {source_name} failed for {figure_name}")
                
                # Rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Error with {source_name} for {figure_name}: {e}")
                continue
        
        logger.warning(f"No image found for {figure_name} ({image_type})")
        return None
    
    def process_historical_figures(self, figures_data: List[Dict]) -> Dict:
        """Process all historical figures and retrieve images"""
        
        results = {
            'total_figures': len(figures_data),
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'images_by_type': {
                'portraits': {'found': 0, 'missing': 0},
                'achievements': {'found': 0, 'missing': 0},
                'inventions': {'found': 0, 'missing': 0},
                'artifacts': {'found': 0, 'missing': 0}
            },
            'sources_used': {},
            'figures': []
        }
        
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
            
            # Try to get images for each type
            for image_type in ['portraits', 'achievements', 'inventions', 'artifacts']:
                image_data = self.get_image_with_fallback(figure_name, image_type, category)
                
                if image_data:
                    figure_result['images'][image_type].append(image_data)
                    results['images_by_type'][image_type]['found'] += 1
                    
                    # Track source usage
                    source_name = image_data.get('source_name', 'unknown')
                    results['sources_used'][source_name] = results['sources_used'].get(source_name, 0) + 1
                else:
                    results['images_by_type'][image_type]['missing'] += 1
            
            results['figures'].append(figure_result)
            results['processed'] += 1
            
            # Progress update
            if results['processed'] % 10 == 0:
                logger.info(f"Progress: {results['processed']}/{results['total_figures']} figures processed")
        
        # Calculate success rates
        for image_type in results['images_by_type']:
            total = results['images_by_type'][image_type]['found'] + results['images_by_type'][image_type]['missing']
            if total > 0:
                success_rate = (results['images_by_type'][image_type]['found'] / total) * 100
                logger.info(f"{image_type}: {success_rate:.1f}% success rate")
        
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

def save_results(results: Dict, filename: str = 'real_image_results.json'):
    """Save results to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        logger.info(f"Results saved to {filename}")
    except Exception as e:
        logger.error(f"Error saving results: {e}")

def main():
    """Main execution function"""
    logger.info("Starting real image retrieval process")
    
    # Load historical figures data
    figures_data = load_figures_data()
    if not figures_data:
        logger.error("No figures data found")
        return
    
    logger.info(f"Loaded {len(figures_data)} historical figures")
    
    # Initialize image retrieval service
    service = ImageRetrievalService()
    
    # Process all figures
    results = service.process_historical_figures(figures_data)
    
    # Save results
    save_results(results)
    
    # Print summary
    logger.info("=== IMAGE RETRIEVAL SUMMARY ===")
    logger.info(f"Total figures processed: {results['processed']}")
    
    for image_type, stats in results['images_by_type'].items():
        total = stats['found'] + stats['missing']
        if total > 0:
            success_rate = (stats['found'] / total) * 100
            logger.info(f"{image_type}: {stats['found']}/{total} ({success_rate:.1f}%)")
    
    logger.info("Top sources used:")
    for source, count in sorted(results['sources_used'].items(), key=lambda x: x[1], reverse=True)[:5]:
        logger.info(f"  {source}: {count} images")
    
    logger.info("Real image retrieval process completed")

if __name__ == "__main__":
    main() 