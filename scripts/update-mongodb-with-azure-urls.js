import { MongoClient } from 'mongodb';
import fs from 'fs';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function getMongoUriFromKeyVault() {
    try {
        // Try to get from Azure Key Vault first
        const credential = new DefaultAzureCredential();
        const keyVaultName = "orb-game-kv-eastus2";
        const url = `https://${keyVaultName}.vault.azure.net`;
        const client = new SecretClient(url, credential);
        
        try {
            const secret = await client.getSecret("MONGO-URI");
            console.log("✅ Retrieved MONGO_URI from Azure Key Vault");
            return secret.value;
        } catch (error) {
            console.log("⚠️  Could not retrieve from Key Vault, trying environment variable...");
        }
    } catch (error) {
        console.log("⚠️  Azure Key Vault not available, trying environment variable...");
    }
    
    // Fallback to environment variable
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI not found in environment or Azure Key Vault");
    }
    return mongoUri;
}

async function updateMongoDBWithAzureUrls() {
    console.log("🔄 Updating MongoDB with Azure Blob Storage URLs...");
    
    try {
        // Read the Azure placeholder data
        const placeholderData = JSON.parse(fs.readFileSync('azure_blob_placeholder_images.json', 'utf8'));
        console.log(`📊 Loaded placeholder data for ${Object.keys(placeholderData).length} figures`);
        
        // Connect to MongoDB
        const mongoUri = await getMongoUriFromKeyVault();
        const client = new MongoClient(mongoUri);
        await client.connect();
        console.log("✅ Connected to MongoDB");
        
        const db = client.db('orbgame');
        const collection = db.collection('historical_figure_images');
        
        let updatedCount = 0;
        let createdCount = 0;
        
        // Update each figure
        for (const [figureName, figureData] of Object.entries(placeholderData)) {
            try {
                // Create the document structure
                const doc = {
                    figureName: figureName,
                    category: figureData.category,
                    epoch: figureData.epoch,
                    images: figureData.images,
                    updatedAt: new Date(),
                    source: 'Azure Blob Storage'
                };
                
                // Update or insert the document
                const result = await collection.updateOne(
                    { figureName: figureName },
                    { $set: doc },
                    { upsert: true }
                );
                
                if (result.upsertedCount > 0) {
                    createdCount++;
                    console.log(`✅ Created: ${figureName}`);
                } else if (result.modifiedCount > 0) {
                    updatedCount++;
                    console.log(`🔄 Updated: ${figureName}`);
                } else {
                    console.log(`⏭️  No changes: ${figureName}`);
                }
                
            } catch (error) {
                console.error(`❌ Error updating ${figureName}:`, error.message);
            }
        }
        
        console.log("\n" + "="*50);
        console.log("📊 MONGODB UPDATE STATISTICS");
        console.log("="*50);
        console.log(`📝 Total Figures: ${Object.keys(placeholderData).length}`);
        console.log(`✅ Created: ${createdCount}`);
        console.log(`🔄 Updated: ${updatedCount}`);
        console.log(`🎯 Success Rate: ${((createdCount + updatedCount) / Object.keys(placeholderData).length * 100).toFixed(1)}%`);
        
        await client.close();
        console.log("✅ MongoDB connection closed");
        
    } catch (error) {
        console.error("💥 Error updating MongoDB:", error);
        process.exit(1);
    }
}

// Run the update
updateMongoDBWithAzureUrls().then(() => {
    console.log("🎉 MongoDB update completed successfully!");
}).catch((error) => {
    console.error("💥 MongoDB update failed:", error);
    process.exit(1);
}); 