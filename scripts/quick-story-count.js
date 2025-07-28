#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function quickStoryCount() {
  let client = null;
  
  try {
    console.log('🔍 Quick Story Count Check');
    console.log('==========================');
    
    // Load credentials from Key Vault
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const mongoSecret = await secretClient.getSecret('MONGO-URI');
    const mongoUri = mongoSecret.value;
    
    // Connect to MongoDB
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('orbgame');
    const storiesCollection = db.collection('stories');
    
    // Get total count
    const totalStories = await storiesCollection.countDocuments();
    const historicalFigureStories = await storiesCollection.countDocuments({ storyType: 'historical-figure' });
    
    // Get counts by language
    const englishStories = await storiesCollection.countDocuments({ language: 'en', storyType: 'historical-figure' });
    const spanishStories = await storiesCollection.countDocuments({ language: 'es', storyType: 'historical-figure' });
    
    // Get counts by category
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const categoryCounts = {};
    
    for (const category of categories) {
      const count = await storiesCollection.countDocuments({ 
        category, 
        storyType: 'historical-figure' 
      });
      categoryCounts[category] = count;
    }
    
    console.log(`📊 Story Count Summary:`);
    console.log(`   Total stories: ${totalStories}`);
    console.log(`   Historical figure stories: ${historicalFigureStories}`);
    console.log(`   English stories: ${englishStories}`);
    console.log(`   Spanish stories: ${spanishStories}`);
    
    console.log(`\n📚 Stories by Category:`);
    for (const [category, count] of Object.entries(categoryCounts)) {
      console.log(`   ${category}: ${count}`);
    }
    
    // Expected total: 8 categories × 5 epochs × 2 languages × 3 figures = 240 stories
    const expectedTotal = 240;
    const completionPercentage = Math.round((historicalFigureStories / expectedTotal) * 100);
    
    console.log(`\n🎯 Completion Status:`);
    console.log(`   Expected: ${expectedTotal} stories`);
    console.log(`   Actual: ${historicalFigureStories} stories`);
    console.log(`   Completion: ${completionPercentage}%`);
    
    if (completionPercentage >= 95) {
      console.log(`\n🎉 Excellent! Story generation is nearly complete!`);
    } else if (completionPercentage >= 80) {
      console.log(`\n✅ Good progress! Most stories are generated.`);
    } else {
      console.log(`\n⚠️ Still need to generate more stories.`);
    }
    
  } catch (error) {
    console.error('❌ Error checking story count:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

quickStoryCount().catch(console.error); 