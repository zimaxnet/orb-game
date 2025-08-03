#!/usr/bin/env python3
"""
Azure Blob Storage Image Upload Script
Uploads images to Azure Blob Storage and generates SAS tokens for secure access
"""

import os
import json
import requests
import time
from datetime import datetime, timedelta
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from azure.identity import DefaultAzureCredential
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('azure_blob_upload.log'),
        logging.StreamHandler()
    ]
)

class AzureBlobImageUploader:
    def __init__(self):
        self.account_name = "orbgameimages"
        self.container_name = "historical-figures"
        self.account_key = os.getenv('AZURE_STORAGE_ACCOUNT_KEY', '')
        self.blob_service_client = BlobServiceClient(
            account_url=f"https://{self.account_name}.blob.core.windows.net",
            credential=self.account_key
        )
        self.container_client = self.blob_service_client.get_container_client(self.container_name)
        
        self.stats = {
            'total_images': 0,
            'uploaded': 0,
            'failed': 0,
            'sas_tokens_generated': 0,
            'errors': []
        }
    
    def generate_sas_token(self, blob_name, expiry_hours=8760):  # 1 year
        """Generate a SAS token for a blob"""
        try:
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=self.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
            )
            return sas_token
        except Exception as e:
            logging.error(f"Failed to generate SAS token for {blob_name}: {e}")
            return None
    
    def get_blob_url_with_sas(self, blob_name):
        """Get the full URL with SAS token for a blob"""
        sas_token = self.generate_sas_token(blob_name)
        if sas_token:
            return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
        return None
    
    def upload_image(self, file_path, blob_name):
        """Upload a single image to blob storage"""
        try:
            # Check if blob already exists
            blob_client = self.container_client.get_blob_client(blob_name)
            if blob_client.exists():
                logging.info(f"⏭️  Blob already exists: {blob_name}")
                self.stats['uploaded'] += 1
                return self.get_blob_url_with_sas(blob_name)
            
            # Upload the image
            logging.info(f"⬆️  Uploading: {blob_name}")
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
            
            logging.info(f"✅ Uploaded: {blob_name}")
            self.stats['uploaded'] += 1
            
            # Generate SAS token
            url_with_sas = self.get_blob_url_with_sas(blob_name)
            if url_with_sas:
                self.stats['sas_tokens_generated'] += 1
                return url_with_sas
            else:
                self.stats['failed'] += 1
                return None
                
        except Exception as e:
            logging.error(f"❌ Failed to upload {blob_name}: {e}")
            self.stats['failed'] += 1
            self.stats['errors'].append(f"Upload failed: {blob_name} - {e}")
            return None
    
    def upload_test_image(self):
        """Upload the test image to verify the system works"""
        test_file = "test_downloaded_images/test_Hero_of_Alexandria_portrait_0.jpg"
        if os.path.exists(test_file):
            blob_name = "Hero_of_Alexandria_portrait.jpg"
            url = self.upload_image(test_file, blob_name)
            if url:
                logging.info(f"🎯 Test image URL: {url}")
                return url
        return None
    
    def create_placeholder_images(self):
        """Create placeholder images for all figures"""
        logging.info("🎨 Creating placeholder images for all figures...")
        
        # Load figure data
        with open('multi_source_image_results.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        figures = data.get('figures', [])
        placeholder_data = {}
        
        for figure in figures:
            figure_name = figure.get('figureName', 'Unknown')
            category = figure.get('category', 'Unknown')
            epoch = figure.get('epoch', 'Unknown')
            
            placeholder_data[figure_name] = {
                'category': category,
                'epoch': epoch,
                'images': {
                    'portraits': [],
                    'achievements': [],
                    'inventions': [],
                    'artifacts': []
                }
            }
            
            # Create placeholder URLs for each image type
            image_types = ['portraits', 'achievements', 'inventions', 'artifacts']
            for image_type in image_types:
                blob_name = f"{figure_name}_{image_type}.jpg"
                url = self.get_blob_url_with_sas(blob_name)
                if url:
                    placeholder_data[figure_name]['images'][image_type].append({
                        'url': url,
                        'source': 'Azure Blob Storage',
                        'type': 'placeholder'
                    })
        
        # Save placeholder data
        with open('azure_blob_placeholder_images.json', 'w', encoding='utf-8') as f:
            json.dump(placeholder_data, f, indent=2, ensure_ascii=False)
        
        logging.info(f"📝 Created placeholder data for {len(figures)} figures")
        return placeholder_data
    
    def print_stats(self):
        """Print upload statistics"""
        logging.info("\n" + "="*50)
        logging.info("📊 AZURE BLOB UPLOAD STATISTICS")
        logging.info("="*50)
        logging.info(f"📸 Total Images: {self.stats['total_images']}")
        logging.info(f"✅ Uploaded: {self.stats['uploaded']}")
        logging.info(f"❌ Failed: {self.stats['failed']}")
        logging.info(f"🔑 SAS Tokens Generated: {self.stats['sas_tokens_generated']}")
        
        if self.stats['errors']:
            logging.info(f"\n❌ Top 10 Errors:")
            for error in self.stats['errors'][:10]:
                logging.info(f"  - {error}")
        
        success_rate = (self.stats['uploaded'] / max(self.stats['total_images'], 1) * 100)
        logging.info(f"\n🎯 Success Rate: {success_rate:.1f}%")

def main():
    uploader = AzureBlobImageUploader()
    
    # Test upload
    logging.info("🧪 Testing Azure Blob Storage upload...")
    test_url = uploader.upload_test_image()
    
    if test_url:
        logging.info("✅ Test upload successful!")
        
        # Create placeholder images
        placeholder_data = uploader.create_placeholder_images()
        
        # Print stats
        uploader.print_stats()
        
        logging.info("🎉 Azure Blob Storage setup completed!")
        logging.info(f"📁 Container: {uploader.container_name}")
        logging.info(f"🌐 Account: {uploader.account_name}")
        logging.info(f"📄 Placeholder data saved to: azure_blob_placeholder_images.json")
        
    else:
        logging.error("💥 Test upload failed!")
        exit(1)

if __name__ == "__main__":
    main() 