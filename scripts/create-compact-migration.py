#!/usr/bin/env python3
"""
Create Compact Migration Script
Creates a compact migration file with just image metadata (no base64 data)
"""

import json
import os
from pathlib import Path

def create_compact_migration():
    """Create a compact migration file with just metadata."""
    
    # Read the original migration data
    try:
        with open("mongodb_images_migration.json", "r") as f:
            migration_data = json.load(f)
    except Exception as e:
        print(f"❌ Error reading migration file: {e}")
        return
    
    print(f"📊 Original migration data: {len(migration_data)} documents")
    
    # Create compact version with just metadata
    compact_data = []
    
    for doc in migration_data:
        # Create compact document with just metadata
        compact_doc = {
            'figureName': doc['figureName'],
            'category': doc['category'],
            'epoch': doc['epoch'],
            'portraits': [{
                'url': portrait.get('url', ''),
                'source': portrait.get('source', 'Migrated'),
                'reliability': portrait.get('reliability', 'High'),
                'priority': portrait.get('priority', 100),
                'createdAt': 'new Date()'
            } for portrait in doc.get('portraits', [])],
            'gallery': [{
                'url': item.get('url', ''),
                'source': item.get('source', 'Migrated'),
                'reliability': item.get('reliability', 'High'),
                'priority': item.get('priority', 90),
                'createdAt': 'new Date()'
            } for item in doc.get('gallery', [])],
            'createdAt': 'new Date()',
            'updatedAt': 'new Date()'
        }
        
        compact_data.append(compact_doc)
    
    # Save compact version
    output_file = "mongodb_images_migration_compact.json"
    with open(output_file, 'w') as f:
        json.dump(compact_data, f, indent=2)
    
    # Get file sizes
    original_size = os.path.getsize("mongodb_images_migration.json")
    compact_size = os.path.getsize(output_file)
    
    print(f"✅ Compact migration data saved to {output_file}")
    print(f"📊 Summary:")
    print(f"   - Original size: {original_size / (1024*1024):.1f} MB")
    print(f"   - Compact size: {compact_size / (1024*1024):.1f} MB")
    print(f"   - Size reduction: {((original_size - compact_size) / original_size * 100):.1f}%")
    print(f"   - Documents: {len(compact_data)}")
    
    return compact_data

def create_mongodb_import_script_compact():
    """Create a Node.js script to import the compact data to MongoDB."""
    script_content = '''#!/usr/bin/env node
/**
 * MongoDB Compact Image Import Script
 * Imports compact image metadata to MongoDB
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

async function importCompactImagesToMongoDB() {
    try {
        const mongoUri = await getMongoUriFromKeyVault();
        
        // Connect to MongoDB
        const client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('orbgame');
        const collection = db.collection('historical_figure_images');
        
        // Read compact migration data
        console.log('📖 Reading compact migration data...');
        const migrationData = JSON.parse(fs.readFileSync('mongodb_images_migration_compact.json', 'utf8'));
        
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

importCompactImagesToMongoDB();
'''
    
    with open('scripts/import-compact-images-to-mongodb.js', 'w') as f:
        f.write(script_content)
    
    print("✅ Created compact import script: scripts/import-compact-images-to-mongodb.js")

def main():
    print("🔄 Creating compact migration data...")
    
    # Create compact migration
    compact_data = create_compact_migration()
    
    # Create import script
    create_mongodb_import_script_compact()
    
    print("\n📋 Next steps:")
    print("1. Run: node scripts/import-compact-images-to-mongodb.js")
    print("2. Verify images are in MongoDB")
    print("3. Remove downloaded_images folder")
    print("4. Update .gitignore to exclude downloaded_images")

if __name__ == "__main__":
    main() 