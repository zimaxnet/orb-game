#!/usr/bin/env node
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
