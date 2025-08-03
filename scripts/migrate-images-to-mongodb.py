#!/usr/bin/env python3
"""
Image Migration Script
Migrates all images from downloaded_images folder to MongoDB as base64 data.
"""

import os
import base64
import json
import requests
from pathlib import Path
import time
from urllib.parse import urlparse
import argparse
from typing import Dict, List, Optional

def encode_image_to_base64(file_path: str) -> Optional[str]:
    """Convert image file to base64 string."""
    try:
        with open(file_path, 'rb') as image_file:
            image_data = image_file.read()
            base64_string = base64.b64encode(image_data).decode('utf-8')
            
            # Determine MIME type based on file extension
            ext = Path(file_path).suffix.lower()
            mime_types = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg', 
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml'
            }
            mime_type = mime_types.get(ext, 'image/jpeg')
            
            return f"data:{mime_type};base64,{base64_string}"
    except Exception as e:
        print(f"❌ Error encoding {file_path}: {e}")
        return None

def get_figure_name_from_filename(filename: str) -> str:
    """Extract figure name from filename."""
    # Remove file extension and common suffixes
    name = Path(filename).stem
    name = name.replace('_portrait_0', '')
    name = name.replace('_portraits_0', '')
    name = name.replace('_achievement_0', '')
    name = name.replace('_invention_0', '')
    name = name.replace('_artifact_0', '')
    return name

def categorize_image_type(filename: str) -> str:
    """Determine image type based on filename."""
    filename_lower = filename.lower()
    if 'portrait' in filename_lower:
        return 'portrait'
    elif 'achievement' in filename_lower:
        return 'achievement'
    elif 'invention' in filename_lower:
        return 'invention'
    elif 'artifact' in filename_lower:
        return 'artifact'
    else:
        return 'portrait'  # Default to portrait

def get_category_and_epoch_for_figure(figure_name: str) -> tuple:
    """Get category and epoch for a figure from the data file."""
    try:
        with open("OrbGameInfluentialPeopleSeeds", "r") as f:
            data = json.load(f)
            
        for category, epochs in data.items():
            for epoch, figures in epochs.items():
                for figure in figures:
                    if figure.get('name', '').lower() == figure_name.lower():
                        return category, epoch
    except Exception as e:
        print(f"⚠️ Error reading figure data: {e}")
    
    # Default fallback
    return 'Technology', 'Modern'

def migrate_images_to_mongodb():
    """Main migration function."""
    image_dir = Path("downloaded_images")
    
    if not image_dir.exists():
        print("❌ downloaded_images directory not found!")
        return
    
    # Get all image files
    image_files = list(image_dir.glob("*.jpg")) + list(image_dir.glob("*.png")) + \
                  list(image_dir.glob("*.jpeg")) + list(image_dir.glob("*.gif")) + \
                  list(image_dir.glob("*.svg"))
    
    print(f"📁 Found {len(image_files)} images to migrate")
    
    # Group images by figure
    figures_data = {}
    
    for image_file in image_files:
        figure_name = get_figure_name_from_filename(image_file.name)
        image_type = categorize_image_type(image_file.name)
        
        if figure_name not in figures_data:
            figures_data[figure_name] = {
                'portrait': None,
                'achievement': None,
                'invention': None,
                'artifact': None,
                'gallery': []
            }
        
        # Encode image to base64
        base64_data = encode_image_to_base64(str(image_file))
        if base64_data:
            figures_data[figure_name][image_type] = base64_data
            figures_data[figure_name]['gallery'].append(base64_data)
            print(f"✅ Encoded {image_file.name} for {figure_name}")
        else:
            print(f"❌ Failed to encode {image_file.name}")
    
    # Create MongoDB-ready data structure
    mongodb_data = []
    
    for figure_name, images in figures_data.items():
        category, epoch = get_category_and_epoch_for_figure(figure_name)
        
        # Create MongoDB document
        doc = {
            'figureName': figure_name,
            'category': category,
            'epoch': epoch,
            'portraits': [{
                'url': images['portrait'],
                'base64': images['portrait'],
                'source': 'Migrated',
                'reliability': 'High',
                'priority': 100,
                'createdAt': 'new Date()'
            }] if images['portrait'] else [],
            'gallery': [{
                'url': img,
                'base64': img,
                'source': 'Migrated',
                'reliability': 'High',
                'priority': 90 - i,
                'createdAt': 'new Date()'
            } for i, img in enumerate(images['gallery'])],
            'createdAt': 'new Date()',
            'updatedAt': 'new Date()'
        }
        
        mongodb_data.append(doc)
        print(f"📋 Prepared {figure_name} ({category}/{epoch}) with {len(images['gallery'])} images")
    
    # Save to JSON file for MongoDB import
    output_file = "mongodb_images_migration.json"
    with open(output_file, 'w') as f:
        json.dump(mongodb_data, f, indent=2)
    
    print(f"\n✅ Migration data saved to {output_file}")
    print(f"📊 Summary:")
    print(f"   - Figures processed: {len(figures_data)}")
    print(f"   - Total images: {sum(len(fig['gallery']) for fig in figures_data.values())}")
    print(f"   - MongoDB documents: {len(mongodb_data)}")
    
    return mongodb_data

def create_mongodb_import_script():
    """Create a Node.js script to import the data to MongoDB."""
    script_content = '''#!/usr/bin/env node
/**
 * MongoDB Image Import Script
 * Imports migrated image data to MongoDB
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');

async function importImagesToMongoDB() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('❌ MONGO_URI environment variable not set');
        process.exit(1);
    }
    
    try {
        // Connect to MongoDB
        const client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('orbgame');
        const collection = db.collection('historical_figure_images');
        
        // Read migration data
        const migrationData = JSON.parse(fs.readFileSync('mongodb_images_migration.json', 'utf8'));
        
        console.log(`📊 Importing ${migrationData.length} figure documents...`);
        
        // Import data
        for (const doc of migrationData) {
            // Convert string dates to Date objects
            doc.createdAt = new Date();
            doc.updatedAt = new Date();
            
            for (const portrait of doc.portraits) {
                portrait.createdAt = new Date();
            }
            
            for (const galleryItem of doc.gallery) {
                galleryItem.createdAt = new Date();
            }
            
            await collection.updateOne(
                { figureName: doc.figureName, category: doc.category, epoch: doc.epoch },
                { $set: doc },
                { upsert: true }
            );
            
            console.log(`✅ Imported ${doc.figureName} (${doc.category}/${doc.epoch})`);
        }
        
        console.log('🎉 Migration completed successfully!');
        await client.close();
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

importImagesToMongoDB();
'''
    
    with open('scripts/import-images-to-mongodb.js', 'w') as f:
        f.write(script_content)
    
    print("✅ Created import script: scripts/import-images-to-mongodb.js")

def main():
    parser = argparse.ArgumentParser(description='Migrate images to MongoDB')
    parser.add_argument('--create-import-script', action='store_true', 
                       help='Create the MongoDB import script')
    
    args = parser.parse_args()
    
    print("🔄 Starting image migration to MongoDB...")
    
    # Migrate images
    mongodb_data = migrate_images_to_mongodb()
    
    if args.create_import_script:
        create_mongodb_import_script()
    
    print("\n📋 Next steps:")
    print("1. Run: node scripts/import-images-to-mongodb.js")
    print("2. Verify images are in MongoDB")
    print("3. Remove downloaded_images folder")
    print("4. Update .gitignore to exclude downloaded_images")

if __name__ == "__main__":
    main() 