#!/usr/bin/env python3
"""
Create Simple Migration Script
Creates a simple migration file with image file paths and metadata
"""

import json
import os
from pathlib import Path

def create_simple_migration():
    """Create a simple migration file with image file paths."""
    
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
        # Extract figure name from filename
        name = image_file.stem
        name = name.replace('_portrait_0', '')
        name = name.replace('_portraits_0', '')
        name = name.replace('_achievement_0', '')
        name = name.replace('_invention_0', '')
        name = name.replace('_artifact_0', '')
        
        # Determine image type
        filename_lower = image_file.name.lower()
        if 'portrait' in filename_lower:
            image_type = 'portrait'
        elif 'achievement' in filename_lower:
            image_type = 'achievement'
        elif 'invention' in filename_lower:
            image_type = 'invention'
        elif 'artifact' in filename_lower:
            image_type = 'artifact'
        else:
            image_type = 'portrait'
        
        if name not in figures_data:
            figures_data[name] = {
                'portrait': None,
                'achievement': None,
                'invention': None,
                'artifact': None,
                'gallery': []
            }
        
        # Store file path instead of base64
        file_path = str(image_file)
        figures_data[name][image_type] = file_path
        figures_data[name]['gallery'].append(file_path)
    
    # Create simple migration data
    simple_data = []
    
    for figure_name, images in figures_data.items():
        # Get category and epoch (simplified)
        category = 'Technology'  # Default
        epoch = 'Modern'  # Default
        
        # Create simple document
        doc = {
            'figureName': figure_name,
            'category': category,
            'epoch': epoch,
            'portraits': [{
                'filePath': images['portrait'],
                'source': 'Migrated',
                'reliability': 'High',
                'priority': 100,
                'createdAt': 'new Date()'
            }] if images['portrait'] else [],
            'gallery': [{
                'filePath': img,
                'source': 'Migrated',
                'reliability': 'High',
                'priority': 90 - i,
                'createdAt': 'new Date()'
            } for i, img in enumerate(images['gallery'])],
            'createdAt': 'new Date()',
            'updatedAt': 'new Date()'
        }
        
        simple_data.append(doc)
        print(f"📋 Prepared {figure_name} with {len(images['gallery'])} images")
    
    # Save simple version
    output_file = "mongodb_images_migration_simple.json"
    with open(output_file, 'w') as f:
        json.dump(simple_data, f, indent=2)
    
    print(f"\n✅ Simple migration data saved to {output_file}")
    print(f"📊 Summary:")
    print(f"   - Documents: {len(simple_data)}")
    print(f"   - Total images: {sum(len(fig['gallery']) for fig in figures_data.values())}")
    
    return simple_data

def create_mongodb_import_script_simple():
    """Create a Node.js script to import the simple data to MongoDB."""
    script_content = '''#!/usr/bin/env node
/**
 * MongoDB Simple Image Import Script
 * Imports simple image metadata to MongoDB
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function getMongoUriFromKeyVault() {
    try {
        console.log('🔐 Getting MongoDB URI from Azure Key Vault...');
        
        // Use DefaultAzureCredential for managed identity
        const credential = new DefaultAzureCredential();
        const keyVaultName = process.env.KEY_VAULT_NAME || 'orb-game-kv-eastus2';
        const keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
        
        console.log(`📡 Key Vault URL: ${keyVaultUrl}`);
        
        const secretClient = new SecretClient(keyVaultUrl, credential);
        
        // Fetch MONGO-URI secret
        const secret = await secretClient.getSecret('MONGO-URI');
        console.log('✅ Successfully retrieved MONGO-URI from Key Vault');
        
        return secret.value;
    } catch (error) {
        console.error('❌ Failed to get MONGO-URI from Key Vault:', error.message);
        console.error('🔍 Error details:', error);
        
        // Fallback to environment variable
        const mongoUri = process.env.MONGO_URI;
        if (mongoUri) {
            console.log('⚠️ Using MONGO_URI from environment variable');
            return mongoUri;
        }
        
        throw new Error('❌ MONGO-URI not available from Key Vault or environment');
    }
}

async function importSimpleImagesToMongoDB() {
    try {
        const mongoUri = await getMongoUriFromKeyVault();
        
        // Connect to MongoDB
        const client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('orbgame');
        const collection = db.collection('historical_figure_images');
        
        // Read simple migration data
        console.log('📖 Reading simple migration data...');
        const migrationData = JSON.parse(fs.readFileSync('mongodb_images_migration_simple.json', 'utf8'));
        
        console.log(`📊 Importing ${migrationData.length} figure documents...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Import data
        for (const doc of migrationData) {
            try {
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
                
                successCount++;
                console.log(`✅ Imported ${doc.figureName} (${doc.category}/${doc.epoch})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to import ${doc.figureName}:`, error.message);
            }
        }
        
        console.log('🎉 Migration completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Successfully imported: ${successCount}`);
        console.log(`   - Failed imports: ${errorCount}`);
        console.log(`   - Total processed: ${successCount + errorCount}`);
        
        await client.close();
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

importSimpleImagesToMongoDB();
'''
    
    with open('scripts/import-simple-images-to-mongodb.js', 'w') as f:
        f.write(script_content)
    
    print("✅ Created simple import script: scripts/import-simple-images-to-mongodb.js")

def main():
    print("🔄 Creating simple migration data...")
    
    # Create simple migration
    simple_data = create_simple_migration()
    
    # Create import script
    create_mongodb_import_script_simple()
    
    print("\n📋 Next steps:")
    print("1. Run: node scripts/import-simple-images-to-mongodb.js")
    print("2. Verify images are in MongoDB")
    print("3. Remove downloaded_images folder")
    print("4. Update .gitignore to exclude downloaded_images")

if __name__ == "__main__":
    main() 