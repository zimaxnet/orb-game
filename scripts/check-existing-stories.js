#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function checkExistingStories() {
  console.log('🔍 Checking existing stories in MongoDB...');
  
  try {
    // Load credentials from Key Vault
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const mongoSecret = await secretClient.getSecret('MONGO-URI');
    const mongoUri = mongoSecret.value;
    
    // Connect to MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('orbgame');
    const storiesCollection = db.collection('stories');
    
    // Get statistics
    const totalStories = await storiesCollection.countDocuments();
    const historicalFigureStories = await storiesCollection.countDocuments({ storyType: 'historical-figure' });
    
    console.log(`📊 Total stories in database: ${totalStories}`);
    console.log(`👥 Historical figure stories: ${historicalFigureStories}`);
    
    // Get breakdown by category
    const categoryStats = await storiesCollection.aggregate([
      { $match: { storyType: 'historical-figure' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          epochs: { $addToSet: '$epoch' },
          languages: { $addToSet: '$language' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n📚 Stories by Category:');
    categoryStats.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} stories`);
      console.log(`    Epochs: ${cat.epochs.join(', ')}`);
      console.log(`    Languages: ${cat.languages.join(', ')}`);
    });
    
    // Get breakdown by epoch
    const epochStats = await storiesCollection.aggregate([
      { $match: { storyType: 'historical-figure' } },
      {
        $group: {
          _id: '$epoch',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n⏰ Stories by Epoch:');
    epochStats.forEach(epoch => {
      console.log(`  ${epoch._id}: ${epoch.count} stories`);
      console.log(`    Categories: ${epoch.categories.join(', ')}`);
    });
    
    // Check for incomplete sets
    console.log('\n🔍 Checking for incomplete story sets...');
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    for (const category of categories) {
      for (const epoch of epochs) {
        for (const language of languages) {
          const count = await storiesCollection.countDocuments({
            category,
            epoch,
            language,
            storyType: 'historical-figure'
          });
          
          if (count < 3) {
            console.log(`⚠️ Incomplete: ${category}-${epoch}-${language}: ${count}/3 stories`);
          }
        }
      }
    }
    
    await client.close();
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Failed to check existing stories:', error);
  }
}

checkExistingStories().catch(console.error); 