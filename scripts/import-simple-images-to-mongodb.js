#!/usr/bin/env node
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
        
        console.log(`📊 Importing ${Object.keys(migrationData).length} figure documents...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Import data - migrationData is an object with figure names as keys
        for (const [figureName, figureData] of Object.entries(migrationData)) {
            try {
                // Create document structure
                const doc = {
                    figureName: figureName,
                    category: figureData.category,
                    epoch: figureData.epoch,
                    images: figureData.images || [],
                    gallery: figureData.gallery || [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                await collection.updateOne(
                    { figureName: figureName, category: figureData.category, epoch: figureData.epoch },
                    { $set: doc },
                    { upsert: true }
                );
                
                successCount++;
                console.log(`✅ Imported ${figureName} (${figureData.category}/${figureData.epoch})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to import ${figureName}:`, error.message);
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
