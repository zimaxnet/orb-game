#!/usr/bin/env python3
"""
Orb Game - Upload Images to Azure Blob Storage
This script uploads all historical figure images to Azure Blob Storage
"""

import json
import os
import sys
import requests
from urllib.parse import urlparse, quote
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.identity import DefaultAzureCredential
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageUploader:
    def __init__(self, storage_account_name="orbgameimages", container_name="historical-figures"):
        self.storage_account_name = storage_account_name
        self.container_name = container_name
        self.blob_service_client = None
        self.container_client = None
        self.upload_stats = {
            "total_images": 0,
            "successful_uploads": 0,
            "failed_uploads": 0,
            "skipped_images": 0,
            "errors": []
        }
        
    def connect_to_blob_storage(self):
        """Connect to Azure Blob Storage using managed identity"""
        try:
            # Use managed identity for authentication
            credential = DefaultAzureCredential()
            
            # Create blob service client
            account_url = f"https://{self.storage_account_name}.blob.core.windows.net"
            self.blob_service_client = BlobServiceClient(account_url=account_url, credential=credential)
            
            # Get container client
            self.container_client = self.blob_service_client.get_container_client(self.container_name)
            
            # Test connection
            self.container_client.get_container_properties()
            logger.info(f"✅ Connected to Azure Blob Storage: {self.storage_account_name}/{self.container_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Azure Blob Storage: {e}")
            return False
    
    def download_image(self, url):
        """Download image from URL"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.content
        except Exception as e:
            logger.warning(f"Failed to download image from {url}: {e}")
            return None
    
    def upload_image_to_blob(self, image_data, blob_name, content_type="image/jpeg"):
        """Upload image data to blob storage"""
        try:
            # Create blob client
            blob_client = self.container_client.get_blob_client(blob_name)
            
            # Upload with content settings
            content_settings = ContentSettings(content_type=content_type)
            blob_client.upload_blob(
                image_data,
                overwrite=True,
                content_settings=content_settings
            )
            
            logger.info(f"✅ Uploaded: {blob_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to upload {blob_name}: {e}")
            return False
    
    def generate_blob_url(self, blob_name, expiry_hours=8760):  # 1 year
        """Generate SAS URL for blob"""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            
            # Generate SAS token
            sas_token = blob_client.generate_sas(
                permission="r",
                expiry=time.time() + (expiry_hours * 3600),
                protocol="https"
            )
            
            return f"{blob_client.url}?{sas_token}"
            
        except Exception as e:
            logger.error(f"❌ Failed to generate URL for {blob_name}: {e}")
            return None
    
    def process_image_data(self, image_data_file="real_image_results.json"):
        """Process image data and upload to blob storage"""
        try:
            # Load image data
            with open(image_data_file, 'r') as f:
                data = json.load(f)
            
            logger.info(f"📊 Processing {len(data['figures'])} historical figures...")
            
            uploaded_images = []
            
            for figure in data['figures']:
                figure_name = figure['figureName']
                category = figure['category']
                epoch = figure['epoch']
                
                logger.info(f"🔄 Processing {figure_name} ({category}/{epoch})")
                
                # Process each image type
                for image_type, images in figure['images'].items():
                    if not images:
                        continue
                    
                    for i, image in enumerate(images):
                        image_url = image['url']
                        
                        # Download image
                        image_data = self.download_image(image_url)
                        if not image_data:
                            self.upload_stats['failed_uploads'] += 1
                            self.upload_stats['errors'].append(f"Failed to download: {image_url}")
                            continue
                        
                        # Generate blob name
                        safe_figure_name = figure_name.replace(' ', '_').replace('/', '_')
                        blob_name = f"{safe_figure_name}_{image_type}_{i}.jpg"
                        
                        # Upload to blob storage
                        if self.upload_image_to_blob(image_data, blob_name):
                            self.upload_stats['successful_uploads'] += 1
                            
                            # Generate public URL
                            public_url = self.generate_blob_url(blob_name)
                            
                            uploaded_images.append({
                                "figureName": figure_name,
                                "category": category,
                                "epoch": epoch,
                                "imageType": image_type,
                                "blobName": blob_name,
                                "publicUrl": public_url,
                                "source": image.get('source', 'Unknown'),
                                "licensing": image.get('licensing', 'Unknown')
                            })
                        else:
                            self.upload_stats['failed_uploads'] += 1
                
                self.upload_stats['total_images'] += sum(len(images) for images in figure['images'].values())
            
            # Save upload results
            with open('uploaded_images_results.json', 'w') as f:
                json.dump({
                    "upload_stats": self.upload_stats,
                    "uploaded_images": uploaded_images
                }, f, indent=2)
            
            logger.info(f"📈 Upload complete! Stats: {self.upload_stats}")
            return uploaded_images
            
        except Exception as e:
            logger.error(f"❌ Error processing image data: {e}")
            return []
    
    def create_placeholder_images(self):
        """Create placeholder images for missing figures"""
        try:
            # Load historical figures data
            with open('OrbGameInfluentialPeopleSeeds', 'r') as f:
                figures_data = json.load(f)
            
            logger.info("🎨 Creating placeholder images for missing figures...")
            
            placeholder_images = []
            
            for category, epochs in figures_data.items():
                for epoch, figures in epochs.items():
                    for figure in figures:
                        figure_name = figure['name']
                        safe_figure_name = figure_name.replace(' ', '_').replace('/', '_')
                        
                        # Create placeholder for each image type
                        for image_type in ['portraits', 'achievements', 'inventions', 'artifacts']:
                            blob_name = f"{safe_figure_name}_{image_type}.jpg"
                            
                            # Generate placeholder SVG
                            placeholder_svg = self.generate_placeholder_svg(figure_name, category, image_type)
                            
                            # Convert SVG to bytes (simplified - in practice you'd use a proper SVG to image converter)
                            placeholder_data = placeholder_svg.encode('utf-8')
                            
                            # Upload placeholder
                            if self.upload_image_to_blob(placeholder_data, blob_name, "image/svg+xml"):
                                public_url = self.generate_blob_url(blob_name)
                                
                                placeholder_images.append({
                                    "figureName": figure_name,
                                    "category": category,
                                    "epoch": epoch,
                                    "imageType": image_type,
                                    "blobName": blob_name,
                                    "publicUrl": public_url,
                                    "source": "Placeholder",
                                    "licensing": "Generated"
                                })
            
            # Save placeholder results
            with open('placeholder_images_results.json', 'w') as f:
                json.dump({
                    "placeholder_images": placeholder_images
                }, f, indent=2)
            
            logger.info(f"✅ Created {len(placeholder_images)} placeholder images")
            return placeholder_images
            
        except Exception as e:
            logger.error(f"❌ Error creating placeholder images: {e}")
            return []
    
    def generate_placeholder_svg(self, figure_name, category, image_type):
        """Generate placeholder SVG for missing images"""
        colors = {
            'Technology': '#42c3f3',
            'Science': '#1a73a8',
            'Art': '#f39f3f',
            'Sports': '#4caf50',
            'Music': '#f573a0',
            'Space': '#343a40',
            'Nature': '#42c383',
            'Innovation': '#f573a0'
        }
        
        color = colors.get(category, '#42c3f3')
        
        svg = f'''<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="400" fill="{color}"/>
            <text x="150" y="180" font-family="Arial" font-size="16" fill="white" text-anchor="middle">{figure_name}</text>
            <text x="150" y="200" font-family="Arial" font-size="12" fill="white" text-anchor="middle">{category}</text>
            <text x="150" y="220" font-family="Arial" font-size="10" fill="white" text-anchor="middle">{image_type}</text>
        </svg>'''
        
        return svg
    
    def update_image_service(self, uploaded_images):
        """Update the image service with new blob URLs"""
        try:
            # Load current image service data
            with open('backend/historical-figures-image-service-new.js', 'r') as f:
                service_content = f.read()
            
            # Create new image database with blob URLs
            new_image_database = {}
            
            for image in uploaded_images:
                figure_name = image['figureName']
                image_type = image['imageType']
                public_url = image['publicUrl']
                
                if figure_name not in new_image_database:
                    new_image_database[figure_name] = {
                        'portrait': None,
                        'gallery': []
                    }
                
                if image_type == 'portraits':
                    new_image_database[figure_name]['portrait'] = public_url
                else:
                    new_image_database[figure_name]['gallery'].append(public_url)
            
            # Generate new service content
            new_service_content = self.generate_updated_service_content(new_image_database)
            
            # Write updated service
            with open('backend/historical-figures-image-service-updated.js', 'w') as f:
                f.write(new_service_content)
            
            logger.info("✅ Updated image service with blob URLs")
            
        except Exception as e:
            logger.error(f"❌ Error updating image service: {e}")
    
    def generate_updated_service_content(self, image_database):
        """Generate updated image service content"""
        content = '''import { MongoClient } from 'mongodb';

class UpdatedImageService {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.mongoUri = null;
        
        // Updated image database with blob storage URLs
        this.imageDatabase = {
'''
        
        for figure_name, images in image_database.items():
            content += f'''            '{figure_name}': {{
                portrait: '{images['portrait'] or ''}',
                gallery: {json.dumps(images['gallery'], indent=16)}
            }},\n'''
        
        content += '''        };
        
        // Category fallbacks (unchanged)
        this.categoryFallbacks = {
            'Technology': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzQyYzNmIi8+PHRleHQgeD0iMTUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjaG5vbG9neTwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Science': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhNzNhOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNjaWVuY2U8L3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Art': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzOTNmMyIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFydDwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Sports': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzRjYWY1MCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNwb3J0czwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Music': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1NzNhMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk11c2ljPC90ZXh0Pjwvc3ZnPg==',
                gallery: []
            },
            'Space': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM0M2E0MCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNwYWNlPC90ZXh0Pjwvc3ZnPg==',
                gallery: []
            },
            'Nature': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzQyYzM4MyIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5hdHVyZTwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Innovation': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1NzNhMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPklubm92YXRpb248L3RleHQ+PC9zdmc+',
                gallery: []
            }
        };
    }

    // ... rest of the service methods remain the same ...
    async connect(mongoUri = null) {
        try {
            this.mongoUri = mongoUri || process.env.MONGO_URI;
            if (!this.mongoUri) {
                console.log('⚠️ No MongoDB URI provided, running in memory-only mode');
                return;
            }

            this.client = new MongoClient(this.mongoUri, {
                tls: true,
                tlsAllowInvalidCertificates: false,
            });
            await this.client.connect();
            this.db = this.client.db('orbgame');
            this.collection = this.db.collection('historical_figures_images');
            
            // Create indexes
            await this.collection.createIndex({ figureName: 1 });
            await this.collection.createIndex({ category: 1 });
            await this.collection.createIndex({ epoch: 1 });
            await this.collection.createIndex({ createdAt: 1 });
            
            console.log('✅ Updated Image Service connected to MongoDB');
        } catch (error) {
            console.error('❌ Updated Image Service connection failed:', error.message);
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Updated Image Service disconnected');
        }
    }

    extractFigureName(story) {
        if (story.historicalFigure) return story.historicalFigure;
        if (story.figureName) return story.figureName;
        if (story.headline) {
            const colonIndex = story.headline.indexOf(':');
            if (colonIndex > 0) {
                return story.headline.substring(0, colonIndex).trim();
            }
            return story.headline.trim();
        }
        return null;
    }

    getFigureImages(figureName) {
        if (!figureName) return null;
        
        const normalizedName = this.normalizeFigureName(figureName);
        return this.imageDatabase[normalizedName] || null;
    }

    normalizeFigureName(name) {
        if (!name) return '';
        
        let normalized = name.trim();
        
        // Handle common variations
        const variations = {
            'Johannes Gutenberg': 'Johannes Gutenberg',
            'Gutenberg': 'Johannes Gutenberg',
            'Tim Berners-Lee': 'Tim Berners-Lee',
            'Berners-Lee': 'Tim Berners-Lee',
            'Grace Hopper': 'Grace Hopper',
            'Alan Turing': 'Alan Turing',
            'Albert Einstein': 'Albert Einstein',
            'Einstein': 'Albert Einstein',
            'Isaac Newton': 'Isaac Newton',
            'Newton': 'Isaac Newton',
            'Marie Curie': 'Marie Curie',
            'Curie': 'Marie Curie',
            'Archimedes': 'Archimedes',
            'Leonardo da Vinci': 'Leonardo da Vinci',
            'Da Vinci': 'Leonardo da Vinci',
            'Vincent van Gogh': 'Vincent van Gogh',
            'Van Gogh': 'Vincent van Gogh',
            'Pablo Picasso': 'Pablo Picasso',
            'Picasso': 'Pablo Picasso',
            'Pelé': 'Pelé',
            'Pele': 'Pelé',
            'Muhammad Ali': 'Muhammad Ali',
            'Ali': 'Muhammad Ali',
            'Wolfgang Amadeus Mozart': 'Wolfgang Amadeus Mozart',
            'Mozart': 'Wolfgang Amadeus Mozart',
            'Ludwig van Beethoven': 'Ludwig van Beethoven',
            'Beethoven': 'Ludwig van Beethoven',
            'Yuri Gagarin': 'Yuri Gagarin',
            'Gagarin': 'Yuri Gagarin',
            'Neil Armstrong': 'Neil Armstrong',
            'Armstrong': 'Neil Armstrong'
        };
        
        return variations[normalized] || normalized;
    }

    getCategoryFallback(category) {
        return this.categoryFallbacks[category] || this.categoryFallbacks['Technology'];
    }

    async getImagesForStory(story, category, epoch) {
        try {
            const figureName = this.extractFigureName(story);
            console.log(`🔍 Looking for images for: "${figureName}" in category: ${category}`);
            
            if (!figureName) {
                console.log('❌ No figure name found in story');
                return this.getCategoryFallback(category);
            }
            
            // Try to get specific figure images
            const figureImages = this.getFigureImages(figureName);
            if (figureImages) {
                console.log(`✅ Found specific images for: ${figureName}`);
                return figureImages;
            }
            
            // Fallback to category images
            console.log(`⚠️ No specific images found for: ${figureName}, using category fallback`);
            return this.getCategoryFallback(category);
            
        } catch (error) {
            console.error('❌ Error getting images for story:', error.message);
            return this.getCategoryFallback(category);
        }
    }

    async storeImages(figureName, category, epoch, images) {
        if (!this.collection) return;
        
        try {
            const imageData = {
                figureName: this.normalizeFigureName(figureName),
                category,
                epoch,
                images,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await this.collection.updateOne(
                { figureName: imageData.figureName, category, epoch },
                { $set: imageData },
                { upsert: true }
            );
            
            console.log(`✅ Stored images for: ${figureName}`);
        } catch (error) {
            console.error('❌ Error storing images:', error.message);
        }
    }

    async getImageStats() {
        if (!this.collection) {
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                databaseConnected: false
            };
        }
        
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalStored: { $sum: 1 },
                        categories: { $addToSet: '$category' },
                        figures: { $addToSet: '$figureName' }
                    }
                }
            ]).toArray();
            
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                storedFigures: stats[0]?.totalStored || 0,
                storedCategories: stats[0]?.categories?.length || 0,
                databaseConnected: true
            };
        } catch (error) {
            console.error('❌ Error getting image stats:', error.message);
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                databaseConnected: false,
                error: error.message
            };
        }
    }
}

export default UpdatedImageService;
'''
        
        return content

def main():
    """Main function to upload all images to blob storage"""
    logger.info("🚀 Starting Orb Game Image Upload to Azure Blob Storage")
    
    # Initialize uploader
    uploader = ImageUploader()
    
    # Connect to blob storage
    if not uploader.connect_to_blob_storage():
        logger.error("❌ Failed to connect to Azure Blob Storage. Exiting.")
        sys.exit(1)
    
    # Upload real images
    logger.info("📤 Uploading real images...")
    uploaded_images = uploader.process_image_data()
    
    # Create placeholder images
    logger.info("🎨 Creating placeholder images...")
    placeholder_images = uploader.create_placeholder_images()
    
    # Update image service
    logger.info("🔧 Updating image service...")
    uploader.update_image_service(uploaded_images + placeholder_images)
    
    # Print final stats
    logger.info("📊 Upload Complete!")
    logger.info(f"✅ Successful uploads: {uploader.upload_stats['successful_uploads']}")
    logger.info(f"❌ Failed uploads: {uploader.upload_stats['failed_uploads']}")
    logger.info(f"⏭️ Skipped images: {uploader.upload_stats['skipped_images']}")
    logger.info(f"📁 Total images processed: {uploader.upload_stats['total_images']}")
    
    if uploader.upload_stats['errors']:
        logger.warning("⚠️ Errors encountered:")
        for error in uploader.upload_stats['errors'][:10]:  # Show first 10 errors
            logger.warning(f"  - {error}")

if __name__ == "__main__":
    main() 