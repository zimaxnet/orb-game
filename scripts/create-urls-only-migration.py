#!/usr/bin/env python3
"""
Create URLs-Only Migration Script
Creates a migration file with just image URLs (no base64 data)
"""

import json
import os
from pathlib import Path

def create_urls_only_migration():
    """Create a migration file with just image URLs."""
    
    # Read the original migration data
    try:
        with open("mongodb_images_migration.json", "r") as f:
            migration_data = json.load(f)
    except Exception as e:
        print(f"❌ Error reading migration file: {e}")
        return
    
    print(f"📊 Original migration data: {len(migration_data)} documents")
    
    # Create URLs-only version
    urls_only_data = []
    
    for doc in migration_data:
        # Create URLs-only document
        urls_only_doc = {
            'figureName': doc['figureName'],
            'category': doc['category'],
            'epoch': doc['epoch'],
            'portraits': [{
                'url': portrait.get('url', ''),
                'source': portrait.get('source', 'Migrated'),
                'reliability': portrait.get('reliability', 'High'),
                'priority': portrait.get('priority', 100),
                'createdAt': 'new Date()'
            } for portrait in doc.get('portraits', []) if portrait.get('url')],
            'gallery': [{
                'url': item.get('url', ''),
                'source': item.get('source', 'Migrated'),
                'reliability': item.get('reliability', 'High'),
                'priority': item.get('priority', 90),
                'createdAt': 'new Date()'
            } for item in doc.get('gallery', []) if item.get('url')],
            'createdAt': 'new Date()',
            'updatedAt': 'new Date()'
        }
        
        urls_only_data.append(urls_only_doc)
    
    # Save URLs-only version
    output_file = "mongodb_images_migration_urls.json"
    with open(output_file, 'w') as f:
        json.dump(urls_only_data, f, indent=2)
    
    # Get file sizes
    original_size = os.path.getsize("mongodb_images_migration.json")
    urls_size = os.path.getsize(output_file)
    
    print(f"✅ URLs-only migration data saved to {output_file}")
    print(f"📊 Summary:")
    print(f"   - Original size: {original_size / (1024*1024):.1f} MB")
    print(f"   - URLs-only size: {urls_size / (1024*1024):.1f} MB")
    print(f"   - Size reduction: {((original_size - urls_size) / original_size * 100):.1f}%")
    print(f"   - Documents: {len(urls_only_data)}")
    
    return urls_only_data

def create_mongodb_import_script_urls():
    """Create a Node.js script to import the URLs-only data to MongoDB."""
    script_content = '''#!/usr/bin/env node
/**
 * MongoDB URLs-Only Image Import Script
 * Imports URLs-only image metadata to MongoDB
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

async function importUrlsOnlyImagesToMongoDB() {
    try {
        const mongoUri = await getMongoUriFromKeyVault();
        
        // Connect to MongoDB
        const client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('orbgame');
        const collection = db.collection('historical_figure_images');
        
        // Read URLs-only migration data
        console.log('📖 Reading URLs-only migration data...');
        const migrationData = JSON.parse(fs.readFileSync('mongodb_images_migration_urls.json', 'utf8'));
        
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

importUrlsOnlyImagesToMongoDB();
'''
    
    with open('scripts/import-urls-only-images-to-mongodb.js', 'w') as f:
        f.write(script_content)
    
    print("✅ Created URLs-only import script: scripts/import-urls-only-images-to-mongodb.js")

def main():
    print("🔄 Creating URLs-only migration data...")
    
    # Create URLs-only migration
    urls_only_data = create_urls_only_migration()
    
    # Create import script
    create_mongodb_import_script_urls()
    
    print("\n📋 Next steps:")
    print("1. Run: node scripts/import-urls-only-images-to-mongodb.js")
    print("2. Verify images are in MongoDB")
    print("3. Remove downloaded_images folder")
    print("4. Update .gitignore to exclude downloaded_images")

if __name__ == "__main__":
    main() 