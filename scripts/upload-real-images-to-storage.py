#!/usr/bin/env python3
"""
Upload Real Images to Azure Blob Storage and Update MongoDB
Uploads images from the rate-limited fetch results to blob storage
"""

import json
import requests
import time
import logging
import os
import sys
from typing import Dict, List, Optional
from datetime import datetime
from urllib.parse import urlparse
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('upload_real_images_to_storage.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class RealImageUploader:
    """Upload real images to Azure Blob Storage and update MongoDB"""
    
    def __init__(self):
        self.account_name = "orbgameimages"
        self.container_name = "historical-figures"
        self.blob_service_client = None
        self.container_client = None
        
        # Get storage account key from Key Vault
        try:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.secrets import SecretClient
            from azure.storage.blob import BlobServiceClient
            
            credential = DefaultAzureCredential()
            key_vault_url = "https://orb-game-kv-eastus2.vault.azure.net/"
            secret_client = SecretClient(vault_url=key_vault_url, credential=credential)
            account_key = secret_client.get_secret("azure-storage-account-key").value
            
            self.blob_service_client = BlobServiceClient(
                account_url=f"https://{self.account_name}.blob.core.windows.net",
                credential=account_key
            )
            self.container_client = self.blob_service_client.get_container_client(self.container_name)
            logger.info("✅ Connected to Azure Blob Storage")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Azure Blob Storage: {e}")
            raise
    
    def download_image(self, url: str) -> Optional[bytes]:
        """Download image from URL"""
        try:
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            # Check if it's actually an image
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                logger.warning(f"URL does not return an image: {url} (Content-Type: {content_type})")
                return None
            
            return response.content
            
        except Exception as e:
            logger.error(f"Failed to download image from {url}: {e}")
            return None
    
    def generate_blob_name(self, figure_name: str, image_type: str, url: str) -> str:
        """Generate a unique blob name for the image"""
        # Create a hash of the URL to ensure uniqueness
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        
        # Clean figure name for filename
        clean_name = figure_name.replace(' ', '_').replace('-', '_')
        clean_name = ''.join(c for c in clean_name if c.isalnum() or c == '_')
        
        # Get file extension from URL
        parsed_url = urlparse(url)
        path = parsed_url.path
        extension = os.path.splitext(path)[1]
        if not extension or extension not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            extension = '.jpg'  # Default to jpg
        
        return f"{clean_name}_{image_type}_{url_hash}{extension}"
    
    def upload_image_to_blob(self, image_data: bytes, blob_name: str) -> Optional[str]:
        """Upload image to Azure Blob Storage"""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            blob_client.upload_blob(image_data, overwrite=True)
            
            # Return the public URL
            return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}"
            
        except Exception as e:
            logger.error(f"Failed to upload {blob_name}: {e}")
            return None
    
    def process_figure_images(self, figure_data: Dict) -> Dict:
        """Process all images for a single figure"""
        figure_name = figure_data['figureName']
        category = figure_data['category']
        epoch = figure_data['epoch']
        
        logger.info(f"Processing images for {figure_name} ({category}, {epoch})")
        
        uploaded_images = {
            'figureName': figure_name,
            'category': category,
            'epoch': epoch,
            'images': {
                'portraits': [],
                'achievements': [],
                'inventions': [],
                'artifacts': []
            },
            'upload_stats': {
                'total_found': 0,
                'successful_uploads': 0,
                'failed_uploads': 0,
                'skipped_uploads': 0
            }
        }
        
        image_types = ['portraits', 'achievements', 'inventions', 'artifacts']
        
        for image_type in image_types:
            urls = figure_data['images'].get(image_type, [])
            uploaded_images['upload_stats']['total_found'] += len(urls)
            
            for url in urls:
                logger.info(f"Downloading {image_type} image: {url}")
                
                # Download image
                image_data = self.download_image(url)
                if not image_data:
                    logger.warning(f"Failed to download image: {url}")
                    uploaded_images['upload_stats']['failed_uploads'] += 1
                    continue
                
                # Generate blob name
                blob_name = self.generate_blob_name(figure_name, image_type, url)
                
                # Upload to blob storage
                blob_url = self.upload_image_to_blob(image_data, blob_name)
                if blob_url:
                    uploaded_images['images'][image_type].append({
                        'original_url': url,
                        'blob_url': blob_url,
                        'blob_name': blob_name
                    })
                    uploaded_images['upload_stats']['successful_uploads'] += 1
                    logger.info(f"✅ Uploaded {blob_name}")
                else:
                    uploaded_images['upload_stats']['failed_uploads'] += 1
                    logger.error(f"❌ Failed to upload {blob_name}")
                
                # Rate limiting for blob uploads
                time.sleep(0.5)
        
        return uploaded_images
    
    def load_fetch_results(self, filename: str) -> Dict:
        """Load the results from the rate-limited fetch"""
        try:
            with open(filename, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load fetch results from {filename}: {e}")
            return {}
    
    def update_mongodb_image_service(self, uploaded_results: List[Dict]) -> str:
        """Generate updated image service file for MongoDB"""
        image_service_content = '''import { MongoClient } from 'mongodb';

class BlobStorageImageService {
    constructor() {
        this.mongoClient = null;
        this.db = null;
        this.collection = null;
        this.imageDatabase = {
            // Real images uploaded to blob storage
            figures: {
'''
        
        # Add each figure's images
        for figure_data in uploaded_results:
            figure_name = figure_data['figureName']
            category = figure_data['category']
            epoch = figure_data['epoch']
            
            # Create the figure entry
            image_service_content += f'''                "{figure_name}": {{
                    name: "{figure_name}",
                    category: "{category}",
                    epoch: "{epoch}",
                    images: {{
'''
            
            # Add each image type
            image_types = ['portraits', 'achievements', 'inventions', 'artifacts']
            for image_type in image_types:
                images = figure_data['images'].get(image_type, [])
                if images:
                    image_service_content += f'''                        {image_type}: [
'''
                    for img in images:
                        image_service_content += f'''                            "{img['blob_url']}",
'''
                    image_service_content += '''                        ],
'''
                else:
                    image_service_content += f'''                        {image_type}: [],
'''
            
            image_service_content += '''                    }
                },
'''
        
        # Close the image database
        image_service_content += '''            }
        };
    }

    async connect(mongoUri) {
        try {
            this.mongoClient = new MongoClient(mongoUri);
            await this.mongoClient.connect();
            this.db = this.mongoClient.db('orbgame');
            this.collection = this.db.collection('historical_figures_images');
            console.log('✅ BlobStorageImageService connected to MongoDB');
        } catch (error) {
            console.error('❌ BlobStorageImageService MongoDB connection failed:', error);
        }
    }

    async getImagesForFigure(figureName, imageType = 'portraits') {
        try {
            // First try to get from blob storage database
            const figure = this.imageDatabase.figures[figureName];
            if (figure && figure.images[imageType] && figure.images[imageType].length > 0) {
                return figure.images[imageType];
            }
            
            // Fallback to MongoDB
            const result = await this.collection.findOne({ figureName });
            if (result && result.images && result.images[imageType]) {
                return result.images[imageType];
            }
            
            return [];
        } catch (error) {
            console.error('Error getting images for figure:', error);
            return [];
        }
    }

    async getAllFigures() {
        return Object.keys(this.imageDatabase.figures);
    }

    async getFigureStats() {
        const stats = {
            totalFigures: Object.keys(this.imageDatabase.figures).length,
            figuresWithImages: 0,
            totalImages: 0,
            imagesByType: {
                portraits: 0,
                achievements: 0,
                inventions: 0,
                artifacts: 0
            }
        };

        for (const figureName in this.imageDatabase.figures) {
            const figure = this.imageDatabase.figures[figureName];
            let hasImages = false;
            
            for (const imageType in figure.images) {
                const images = figure.images[imageType];
                stats.imagesByType[imageType] += images.length;
                stats.totalImages += images.length;
                if (images.length > 0) hasImages = true;
            }
            
            if (hasImages) stats.figuresWithImages++;
        }

        return stats;
    }

    async close() {
        if (this.mongoClient) {
            await this.mongoClient.close();
        }
    }
}

export default BlobStorageImageService;
'''
        
        return image_service_content
    
    def process_all_figures(self, fetch_results_file: str) -> Dict:
        """Process all figures from the fetch results"""
        # Load fetch results
        fetch_results = self.load_fetch_results(fetch_results_file)
        if not fetch_results or 'figures' not in fetch_results:
            logger.error("No valid fetch results found")
            return {}
        
        figures = fetch_results['figures']
        logger.info(f"Processing {len(figures)} figures from fetch results")
        
        results = {
            'metadata': {
                'total_figures': len(figures),
                'processed': 0,
                'successful': 0,
                'failed': 0,
                'start_time': datetime.now().isoformat()
            },
            'figures': [],
            'summary_stats': {
                'total_images_found': 0,
                'successful_uploads': 0,
                'failed_uploads': 0,
                'skipped_uploads': 0
            }
        }
        
        for i, figure_data in enumerate(figures, 1):
            logger.info(f"Processing figure {i}/{len(figures)}: {figure_data['figureName']}")
            
            try:
                uploaded_figure = self.process_figure_images(figure_data)
                results['figures'].append(uploaded_figure)
                results['metadata']['processed'] += 1
                
                # Update summary stats
                upload_stats = uploaded_figure['upload_stats']
                results['summary_stats']['total_images_found'] += upload_stats['total_found']
                results['summary_stats']['successful_uploads'] += upload_stats['successful_uploads']
                results['summary_stats']['failed_uploads'] += upload_stats['failed_uploads']
                results['summary_stats']['skipped_uploads'] += upload_stats['skipped_uploads']
                
                if upload_stats['successful_uploads'] > 0:
                    results['metadata']['successful'] += 1
                else:
                    results['metadata']['failed'] += 1
                
                logger.info(f"✅ {figure_data['figureName']}: {upload_stats['successful_uploads']} uploaded, {upload_stats['failed_uploads']} failed")
                
                # Add delay between figures
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error processing {figure_data['figureName']}: {e}")
                results['metadata']['failed'] += 1
        
        results['metadata']['end_time'] = datetime.now().isoformat()
        results['metadata']['processing_time'] = (
            datetime.fromisoformat(results['metadata']['end_time']) - 
            datetime.fromisoformat(results['metadata']['start_time'])
        ).total_seconds()
        
        return results

def main():
    """Main execution function"""
    logger.info("🚀 Starting Real Image Upload to Azure Blob Storage")
    
    # Find the most recent fetch results file
    fetch_files = [f for f in os.listdir('.') if f.startswith('real_images_rate_limited_') and f.endswith('.json')]
    if not fetch_files:
        logger.error("No fetch results files found!")
        logger.info("Please run the fetch script first: python3 scripts/fetch-real-images-rate-limited.py")
        return
    
    # Use the most recent file
    fetch_results_file = sorted(fetch_files)[-1]
    logger.info(f"Using fetch results from: {fetch_results_file}")
    
    # Initialize uploader
    uploader = RealImageUploader()
    
    # Process all figures
    results = uploader.process_all_figures(fetch_results_file)
    
    if results and results['figures']:
        # Save upload results
        upload_filename = f'real_images_upload_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(upload_filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"✅ Upload results saved to {upload_filename}")
        
        # Generate updated image service file
        image_service_content = uploader.update_mongodb_image_service(results['figures'])
        image_service_file = 'backend/historical-figures-image-service-blob-real.js'
        
        with open(image_service_file, 'w') as f:
            f.write(image_service_content)
        
        logger.info(f"✅ Updated image service file: {image_service_file}")
        
        # Print summary
        metadata = results['metadata']
        summary = results['summary_stats']
        
        print("\n" + "="*60)
        print("🎉 REAL IMAGE UPLOAD COMPLETE")
        print("="*60)
        print(f"📊 Total Figures: {metadata['total_figures']}")
        print(f"✅ Successful: {metadata['successful']}")
        print(f"❌ Failed: {metadata['failed']}")
        print(f"⏱️ Processing Time: {metadata['processing_time']:.2f} seconds")
        print(f"🖼️ Total Images Found: {summary['total_images_found']}")
        print(f"✅ Successful Uploads: {summary['successful_uploads']}")
        print(f"❌ Failed Uploads: {summary['failed_uploads']}")
        print(f"⏭️ Skipped Uploads: {summary['skipped_uploads']}")
        print(f"📁 Upload results saved to: {upload_filename}")
        print(f"📁 Image service file: {image_service_file}")
        print("="*60)
        
        # Calculate success rate
        if summary['total_images_found'] > 0:
            success_rate = (summary['successful_uploads'] / summary['total_images_found']) * 100
            print(f"📈 Upload Success Rate: {success_rate:.1f}%")
        
        # Show sample results
        if results['figures']:
            print("\n📋 Sample Uploaded Figures:")
            for figure in results['figures'][:3]:  # Show first 3 figures
                total_uploaded = sum(len(images) for images in figure['images'].values())
                print(f"  • {figure['figureName']}: {total_uploaded} images uploaded")
        
        print("\n🚀 Next Steps:")
        print("1. Update backend-server.js to use the new image service")
        print("2. Deploy the updated backend to Azure")
        print("3. Test the new real images in the game")
    
    else:
        logger.error("❌ No upload results generated")

if __name__ == "__main__":
    main() 