#!/usr/bin/env python3
"""
Fetch Real Images for Placeholder Figures using Google Custom Search API
Rate-limited version with better error handling
"""

import json
import requests
import time
import logging
import os
import sys
from typing import Dict, List, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('fetch_real_images_rate_limited.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class RateLimitedImageFetcher:
    """Fetch real images for placeholder figures using Google Custom Search API with rate limiting"""
    
    def __init__(self, api_key: Optional[str] = None, cx: Optional[str] = None):
        self.api_key = api_key
        self.cx = cx  # Custom Search Engine ID
        self.endpoint = 'https://www.googleapis.com/customsearch/v1'
        self.session = requests.Session()
        
        # Rate limiting - much more conservative
        self.requests_per_second = 1  # 1 request per second (very conservative)
        self.last_request_time = 0
        self.daily_queries = 0
        self.max_daily_queries = 9500  # Leave buffer for other uses
        
        if self.api_key and self.cx:
            logger.info("✅ Google Custom Search API configured")
        else:
            logger.warning("⚠️ Google Custom Search API not configured")
    
    def rate_limit(self):
        """Implement conservative rate limiting for Google CSE API"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < (1.0 / self.requests_per_second):
            sleep_time = (1.0 / self.requests_per_second) - time_since_last
            logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_request_time = time.time()
    
    def check_daily_limit(self):
        """Check if we've hit the daily query limit"""
        if self.daily_queries >= self.max_daily_queries:
            logger.warning(f"⚠️ Daily query limit reached ({self.daily_queries}/{self.max_daily_queries})")
            return False
        return True
    
    def search_google_images(self, query: str, count: int = 1) -> List[str]:
        """Search Google Custom Search API for images with rate limiting"""
        if not self.api_key or not self.cx:
            logger.warning(f"No API credentials - skipping query: {query}")
            return []
        
        if not self.check_daily_limit():
            logger.warning(f"Skipping query due to daily limit: {query}")
            return []
        
        try:
            self.rate_limit()
            
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
            
            response = self.session.get(self.endpoint, params=params, timeout=15)
            
            if response.status_code == 429:
                logger.error(f"Rate limit hit for query '{query}': 429 Too Many Requests")
                return []
            elif response.status_code == 403:
                logger.error(f"Daily quota exceeded for query '{query}': 403 Forbidden")
                return []
            
            response.raise_for_status()
            
            data = response.json()
            results = data.get('items', [])
            
            self.daily_queries += 1
            
            if results:
                urls = [img['link'] for img in results if img.get('link')]
                logger.info(f"✅ Found {len(urls)} images for query: {query}")
                return urls
            else:
                logger.warning(f"No results for query: {query}")
                return []
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error for query '{query}': {e}")
            return []
        except Exception as e:
            logger.error(f"Google Custom Search API error for query '{query}': {e}")
            return []
    
    def generate_search_queries(self, figure_name: str, category: str, image_type: str) -> List[str]:
        """Generate optimized search queries for each image type"""
        queries = []
        
        if image_type == 'portraits':
            queries = [
                f'"{figure_name}" portrait',
                f'"{figure_name}" painting'
            ]
        elif image_type == 'achievements':
            queries = [
                f'"{figure_name}" {category.lower()} achievement',
                f'"{figure_name}" {category.lower()} work'
            ]
        elif image_type == 'inventions':
            queries = [
                f'"{figure_name}" invention',
                f'"{figure_name}" creation'
            ]
        elif image_type == 'artifacts':
            queries = [
                f'"{figure_name}" artifact',
                f'"{figure_name}" work'
            ]
        
        return queries
    
    def fetch_images_for_figure(self, figure_name: str, category: str, epoch: str) -> Dict:
        """Fetch images for a single figure across all image types"""
        figure_data = {
            'figureName': figure_name,
            'category': category,
            'epoch': epoch,
            'images': {
                'portraits': [],
                'achievements': [],
                'inventions': [],
                'artifacts': []
            },
            'search_stats': {
                'total_queries': 0,
                'successful_searches': 0,
                'failed_searches': 0
            }
        }
        
        image_types = ['portraits', 'achievements', 'inventions', 'artifacts']
        
        for image_type in image_types:
            queries = self.generate_search_queries(figure_name, category, image_type)
            figure_data['search_stats']['total_queries'] += len(queries)
            
            for query in queries:
                urls = self.search_google_images(query, count=1)
                if urls:
                    figure_data['images'][image_type].extend(urls)
                    figure_data['search_stats']['successful_searches'] += 1
                else:
                    figure_data['search_stats']['failed_searches'] += 1
        
        return figure_data
    
    def load_figures_data(self) -> List[Dict]:
        """Load all figures from OrbGameInfluentialPeopleSeeds"""
        try:
            with open('OrbGameInfluentialPeopleSeeds', 'r') as f:
                data = json.load(f)
            
            figures = []
            for category, epochs in data.items():
                for epoch, figures_list in epochs.items():
                    for figure in figures_list:
                        figures.append({
                            'name': figure['name'],
                            'category': category,
                            'epoch': epoch,
                            'context': figure.get('context', '')
                        })
            
            logger.info(f"✅ Loaded {len(figures)} figures from OrbGameInfluentialPeopleSeeds")
            return figures
            
        except Exception as e:
            logger.error(f"Error loading figures data: {e}")
            return []
    
    def process_all_figures(self) -> Dict:
        """Process all figures and fetch real images with rate limiting"""
        figures = self.load_figures_data()
        
        if not figures:
            logger.error("No figures found to process")
            return {}
        
        results = {
            'metadata': {
                'total_figures': len(figures),
                'processed': 0,
                'successful': 0,
                'failed': 0,
                'start_time': datetime.now().isoformat(),
                'api_key_configured': bool(self.api_key and self.cx)
            },
            'figures': [],
            'summary_stats': {
                'total_images_found': 0,
                'total_queries': 0,
                'successful_searches': 0,
                'failed_searches': 0,
                'daily_queries_used': 0
            }
        }
        
        logger.info(f"🚀 Starting to fetch real images for {len(figures)} figures...")
        logger.info(f"⚠️ Using conservative rate limiting: 1 request per second")
        logger.info(f"⚠️ Daily query limit: {self.max_daily_queries}")
        
        for i, figure in enumerate(figures, 1):
            logger.info(f"Processing figure {i}/{len(figures)}: {figure['name']} ({figure['category']}, {figure['epoch']})")
            
            # Check daily limit before processing each figure
            if not self.check_daily_limit():
                logger.warning(f"⚠️ Stopping early due to daily query limit. Processed {i-1}/{len(figures)} figures.")
                break
            
            try:
                figure_data = self.fetch_images_for_figure(
                    figure['name'], 
                    figure['category'], 
                    figure['epoch']
                )
                
                results['figures'].append(figure_data)
                results['metadata']['processed'] += 1
                
                # Update summary stats
                total_images = sum(len(images) for images in figure_data['images'].values())
                results['summary_stats']['total_images_found'] += total_images
                results['summary_stats']['total_queries'] += figure_data['search_stats']['total_queries']
                results['summary_stats']['successful_searches'] += figure_data['search_stats']['successful_searches']
                results['summary_stats']['failed_searches'] += figure_data['search_stats']['failed_searches']
                results['summary_stats']['daily_queries_used'] = self.daily_queries
                
                if total_images > 0:
                    results['metadata']['successful'] += 1
                else:
                    results['metadata']['failed'] += 1
                
                logger.info(f"✅ {figure['name']}: Found {total_images} images (Daily queries: {self.daily_queries})")
                
                # Add a small delay between figures
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Error processing {figure['name']}: {e}")
                results['metadata']['failed'] += 1
        
        results['metadata']['end_time'] = datetime.now().isoformat()
        results['metadata']['processing_time'] = (
            datetime.fromisoformat(results['metadata']['end_time']) - 
            datetime.fromisoformat(results['metadata']['start_time'])
        ).total_seconds()
        
        return results

def get_google_credentials() -> tuple:
    """Get Google Custom Search API credentials from environment or Key Vault"""
    # Try environment variables first
    api_key = os.getenv('GOOGLE_CUSTOM_SEARCH_API_KEY')
    cx = os.getenv('GOOGLE_CUSTOM_SEARCH_CX')
    
    if api_key and cx:
        logger.info("✅ Found Google CSE credentials in environment variables")
        return api_key, cx
    
    # Try Azure Key Vault
    try:
        from azure.identity import DefaultAzureCredential
        from azure.keyvault.secrets import SecretClient
        
        credential = DefaultAzureCredential()
        key_vault_url = "https://orb-game-kv-eastus2.vault.azure.net/"
        secret_client = SecretClient(vault_url=key_vault_url, credential=credential)
        
        api_key = secret_client.get_secret("GOOGLE-CSE-API-KEY").value
        cx = secret_client.get_secret("GOOGLE-CSE-CX").value
        
        logger.info("✅ Found Google CSE credentials in Azure Key Vault")
        return api_key, cx
        
    except Exception as e:
        logger.warning(f"Could not get credentials from Key Vault: {e}")
        return None, None

def main():
    """Main execution function"""
    logger.info("🚀 Starting Rate-Limited Real Image Fetch for Placeholder Figures")
    
    # Get credentials
    api_key, cx = get_google_credentials()
    
    if not api_key or not cx:
        logger.error("❌ Google Custom Search API credentials not found!")
        logger.info("Please set GOOGLE_CUSTOM_SEARCH_API_KEY and GOOGLE_CUSTOM_SEARCH_CX environment variables")
        logger.info("Or add them to Azure Key Vault as 'GOOGLE-CSE-API-KEY' and 'GOOGLE-CSE-CX'")
        return
    
    # Initialize fetcher
    fetcher = RateLimitedImageFetcher(api_key, cx)
    
    # Process all figures
    results = fetcher.process_all_figures()
    
    if results:
        # Save results
        filename = f'real_images_rate_limited_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"✅ Results saved to {filename}")
        
        # Print summary
        metadata = results['metadata']
        summary = results['summary_stats']
        
        print("\n" + "="*60)
        print("🎉 RATE-LIMITED REAL IMAGE FETCH COMPLETE")
        print("="*60)
        print(f"📊 Total Figures: {metadata['total_figures']}")
        print(f"✅ Successful: {metadata['successful']}")
        print(f"❌ Failed: {metadata['failed']}")
        print(f"⏱️ Processing Time: {metadata['processing_time']:.2f} seconds")
        print(f"🖼️ Total Images Found: {summary['total_images_found']}")
        print(f"🔍 Total Queries: {summary['total_queries']}")
        print(f"✅ Successful Searches: {summary['successful_searches']}")
        print(f"❌ Failed Searches: {summary['failed_searches']}")
        print(f"📊 Daily Queries Used: {summary['daily_queries_used']}")
        print(f"📁 Results saved to: {filename}")
        print("="*60)
        
        # Calculate success rate
        if summary['total_queries'] > 0:
            success_rate = (summary['successful_searches'] / summary['total_queries']) * 100
            print(f"📈 Success Rate: {success_rate:.1f}%")
        
        # Show sample results
        if results['figures']:
            print("\n📋 Sample Results:")
            for figure in results['figures'][:3]:  # Show first 3 figures
                total_images = sum(len(images) for images in figure['images'].values())
                print(f"  • {figure['figureName']}: {total_images} images found")
    
    else:
        logger.error("❌ No results generated")

if __name__ == "__main__":
    main() 