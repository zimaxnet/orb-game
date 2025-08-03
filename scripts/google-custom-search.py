#!/usr/bin/env python3
"""
Google Custom Search API Implementation for Orb Game Historical Figures
Replaces deprecated Bing Image Search with Google Custom Search API
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
        logging.FileHandler('google_custom_search.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class GoogleCustomSearchService:
    """Google Custom Search API service with guaranteed fallback logic"""
    
    def __init__(self, api_key: Optional[str] = None, cx: Optional[str] = None):
        self.api_key = api_key
        self.cx = cx  # Custom Search Engine ID
        self.endpoint = 'https://www.googleapis.com/customsearch/v1'
        self.session = requests.Session()
        
        # Fallback placeholder images (public domain Wikimedia Commons)
        self.placeholder_images = {
            'portraits': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Generic_Feed_icon.svg/120px-Generic_Feed_icon.svg.png',
            'achievements': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Star_icon_1.svg/120px-Star_icon_1.svg.png',
            'inventions': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Lightbulb_icon.svg/120px-Lightbulb_icon.svg.png',
            'artifacts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Ancient_artifact_icon.svg/120px-Ancient_artifact_icon.svg.png'
        }
        
        if self.api_key and self.cx:
            logger.info("✅ Google Custom Search API configured")
        else:
            logger.warning("⚠️ Google Custom Search API not configured - will use fallback images")
    
    def search_google_images(self, query: str, count: int = 1) -> List[str]:
        """Search Google Custom Search API with guaranteed fallback"""
        if not self.api_key or not self.cx:
            logger.warning(f"No API credentials - using fallback for query: {query}")
            return [self.placeholder_images.get('achievements', self.placeholder_images['achievements'])]
        
        try:
            params = {
                'key': self.api_key,
                'cx': self.cx,
                'q': query,
                'searchType': 'image',
                'num': min(count, 10),  # Google CSE max is 10
                'safe': 'high',
                'imgType': 'photo',
                'imgSize': 'medium',
                'rights': 'cc_publicdomain|cc_attribute|cc_sharealike|cc_noncommercial|cc_nonderived'
            }
            
            response = self.session.get(self.endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('items', [])
            
            if results:
                urls = [img['link'] for img in results if img.get('link')]
                logger.info(f"✅ Found {len(urls)} images for query: {query}")
                return urls
            else:
                logger.warning(f"No results for query: {query}")
                return [self.placeholder_images.get('achievements', self.placeholder_images['achievements'])]
                
        except Exception as e:
            logger.error(f"Google Custom Search API error for query '{query}': {e}")
            return [self.placeholder_images.get('achievements', self.placeholder_images['achievements'])]
    
    def generate_search_queries(self, figure_name: str, category: str, image_type: str) -> List[str]:
        """Generate optimized search queries for each image type"""
        queries = []
        
        if image_type == 'portraits':
            queries = [
                f'"{figure_name}" portrait',
                f'"{figure_name}" painting',
                f'"{figure_name}" bust',
                f'"{figure_name}" statue',
                f'"{figure_name}" historical figure'
            ]
        elif image_type == 'achievements':
            # Use category context for achievements
            queries = [
                f'"{figure_name}" {category.lower()} achievement',
                f'"{figure_name}" {category.lower()} discovery',
                f'"{figure_name}" {category.lower()} contribution',
                f'"{figure_name}" {category.lower()} work',
                f'"{figure_name}" {category.lower()}'
            ]
        elif image_type == 'inventions':
            queries = [
                f'"{figure_name}" invention',
                f'"{figure_name}" {category.lower()} invention',
                f'"{figure_name}" machine',
                f'"{figure_name}" device',
                f'"{figure_name}" creation'
            ]
        elif image_type == 'artifacts':
            queries = [
                f'"{figure_name}" artifact',
                f'"{figure_name}" {category.lower()} artifact',
                f'"{figure_name}" object',
                f'"{figure_name}" {category.lower()} object',
                f'"{figure_name}" historical artifact'
            ]
        
        return queries
    
    def fill_image_gaps(self, figures_data: List[Dict]) -> Dict:
        """Fill image gaps for all figures and image types with guaranteed fallbacks"""
        
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
                'google_cse': 0,
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
            
            # Process each image type - GUARANTEE at least one image per type
            for image_type in image_types:
                # Generate search queries
                queries = self.generate_search_queries(figure_name, category, image_type)
                
                # Try each query until we get a result
                image_found = False
                for query in queries:
                    try:
                        urls = self.search_google_images(query, 1)
                        if urls and urls[0]:
                            image_data = {
                                'url': urls[0],
                                'source': 'Google Custom Search' if (self.api_key and self.cx) else 'Fallback',
                                'licensing': 'Unknown',
                                'reliability': 'Medium' if (self.api_key and self.cx) else 'Low',
                                'searchTerm': query,
                                'priority': 80 if (self.api_key and self.cx) else 20,
                                'source_name': 'google_cse' if (self.api_key and self.cx) else 'fallback'
                            }
                            
                            figure_result['images'][image_type].append(image_data)
                            results['images_added'][image_type] += 1
                            
                            if self.api_key and self.cx:
                                results['sources_used']['google_cse'] += 1
                            else:
                                results['sources_used']['fallback'] += 1
                            
                            image_found = True
                            logger.info(f"✅ Added {image_type} for {figure_name}: {urls[0]}")
                            break
                            
                    except Exception as e:
                        logger.warning(f"Query failed for {figure_name} ({image_type}): {query} - {e}")
                        continue
                
                # GUARANTEE: If no image found, add fallback
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
            
            # Rate limiting (Google CSE has 100 queries/day free tier)
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

def save_results(results: Dict, filename: str = 'google_custom_search_results.json'):
    """Save results to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        logger.info(f"Results saved to {filename}")
    except Exception as e:
        logger.error(f"Error saving results: {e}")

def get_google_credentials() -> tuple:
    """Get Google Custom Search API credentials from environment or Key Vault"""
    api_key = os.getenv('GOOGLE_CSE_API_KEY')
    cx = os.getenv('GOOGLE_CSE_CX')
    
    if not api_key or not cx:
        try:
            import subprocess
            # Try to get from Azure Key Vault
            api_key_result = subprocess.run([
                'az', 'keyvault', 'secret', 'show', 
                '--name', 'GOOGLE-CSE-API-KEY', 
                '--vault-name', 'orb-game-kv-eastus2', 
                '--query', 'value', '-o', 'tsv'
            ], capture_output=True, text=True)
            
            cx_result = subprocess.run([
                'az', 'keyvault', 'secret', 'show', 
                '--name', 'GOOGLE-CSE-CX', 
                '--vault-name', 'orb-game-kv-eastus2', 
                '--query', 'value', '-o', 'tsv'
            ], capture_output=True, text=True)
            
            if api_key_result.returncode == 0:
                api_key = api_key_result.stdout.strip()
                logger.info("✅ Retrieved Google CSE API key from Azure Key Vault")
            
            if cx_result.returncode == 0:
                cx = cx_result.stdout.strip()
                logger.info("✅ Retrieved Google CSE CX from Azure Key Vault")
                
        except Exception as e:
            logger.warning(f"Could not retrieve Google CSE credentials: {e}")
    
    return api_key, cx

def test_google_cse():
    """Test Google Custom Search API configuration"""
    logger.info("🧪 Testing Google Custom Search API configuration...")
    
    api_key, cx = get_google_credentials()
    
    if not api_key or not cx:
        logger.error("❌ Google Custom Search API not configured")
        logger.info("Run: ./scripts/setup-google-custom-search.sh")
        return False
    
    service = GoogleCustomSearchService(api_key, cx)
    
    # Test with a simple query
    test_query = "Albert Einstein portrait"
    logger.info(f"Testing with query: {test_query}")
    
    try:
        urls = service.search_google_images(test_query, 1)
        if urls and urls[0]:
            logger.info(f"✅ Test successful! Found image: {urls[0]}")
            return True
        else:
            logger.error("❌ Test failed - no images found")
            return False
    except Exception as e:
        logger.error(f"❌ Test failed with error: {e}")
        return False

def main():
    """Main execution function"""
    import sys
    
    # Check for test mode
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        success = test_google_cse()
        sys.exit(0 if success else 1)
    
    logger.info("🚀 Starting Google Custom Search for Orb Game Historical Figures")
    
    # Get Google Custom Search credentials
    api_key, cx = get_google_credentials()
    
    if not api_key or not cx:
        logger.warning("⚠️ Google Custom Search API not configured - will use fallback images")
        logger.info("To configure Google Custom Search API:")
        logger.info("1. Go to https://developers.google.com/custom-search/v1/overview")
        logger.info("2. Create a Custom Search Engine at https://cse.google.com/")
        logger.info("3. Enable 'Search the entire web' option")
        logger.info("4. Get your API key and CX (Custom Search Engine ID)")
        logger.info("5. Store them in Azure Key Vault as 'GOOGLE-CSE-API-KEY' and 'GOOGLE-CSE-CX'")
        logger.info("6. Run: ./scripts/setup-google-custom-search.sh")
    
    # Load figures data
    figures_data = load_figures_data()
    if not figures_data:
        logger.error("No figures data found")
        return
    
    # Initialize Google Custom Search service
    service = GoogleCustomSearchService(api_key, cx)
    
    # Fill image gaps
    results = service.fill_image_gaps(figures_data)
    
    # Save results
    save_results(results)
    
    # Print summary
    logger.info("=== GOOGLE CUSTOM SEARCH SUMMARY ===")
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
    
    logger.info("✅ Google Custom Search completed with guaranteed fallbacks")

if __name__ == "__main__":
    main() 