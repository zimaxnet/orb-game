#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function verifyStoryCompletion() {
  let client = null;
  
  try {
    console.log('🔍 Story Completion Verification');
    console.log('===============================');
    
    // Load credentials from Key Vault
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const mongoSecret = await secretClient.getSecret('MONGO-URI');
    const mongoUri = mongoSecret.value;
    
    // Connect to MongoDB with retry logic
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('orbgame');
    const storiesCollection = db.collection('stories');
    
    // Get basic counts
    const totalStories = await storiesCollection.countDocuments();
    const historicalFigureStories = await storiesCollection.countDocuments({ storyType: 'historical-figure' });
    
    console.log(`📊 Basic Counts:`);
    console.log(`   Total stories in database: ${totalStories}`);
    console.log(`   Historical figure stories: ${historicalFigureStories}`);
    
    // Check by language
    const englishStories = await storiesCollection.countDocuments({ language: 'en', storyType: 'historical-figure' });
    const spanishStories = await storiesCollection.countDocuments({ language: 'es', storyType: 'historical-figure' });
    
    console.log(`\n🌍 Language Distribution:`);
    console.log(`   English stories: ${englishStories}`);
    console.log(`   Spanish stories: ${spanishStories}`);
    
    // Check by category
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    
    console.log(`\n📚 Stories by Category:`);
    for (const category of categories) {
      const count = await storiesCollection.countDocuments({ 
        category, 
        storyType: 'historical-figure' 
      });
      console.log(`   ${category}: ${count}`);
    }
    
    // Check by epoch
    console.log(`\n⏰ Stories by Epoch:`);
    for (const epoch of epochs) {
      const count = await storiesCollection.countDocuments({ 
        epoch, 
        storyType: 'historical-figure' 
      });
      console.log(`   ${epoch}: ${count}`);
    }
    
    // Check for stories with TTS audio
    const storiesWithAudio = await storiesCollection.countDocuments({
      storyType: 'historical-figure',
      ttsAudio: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log(`\n🎵 Audio Status:`);
    console.log(`   Stories with TTS audio: ${storiesWithAudio}`);
    console.log(`   Stories without audio: ${historicalFigureStories - storiesWithAudio}`);
    
    // Check for complete sets (3 stories per category-epoch-language combination)
    console.log(`\n✅ Complete Sets Analysis:`);
    let completeSets = 0;
    let incompleteSets = 0;
    
    for (const category of categories) {
      for (const epoch of epochs) {
        for (const language of ['en', 'es']) {
          const count = await storiesCollection.countDocuments({
            category,
            epoch,
            language,
            storyType: 'historical-figure'
          });
          
          if (count >= 3) {
            completeSets++;
          } else if (count > 0) {
            incompleteSets++;
            console.log(`   ⚠️ Incomplete: ${category}-${epoch}-${language} (${count}/3)`);
          }
        }
      }
    }
    
    console.log(`   Complete sets: ${completeSets}`);
    console.log(`   Incomplete sets: ${incompleteSets}`);
    
    // Calculate completion percentage
    const totalPossibleSets = categories.length * epochs.length * 2; // 2 languages
    const completionPercentage = Math.round((completeSets / totalPossibleSets) * 100);
    
    console.log(`\n🎯 Overall Completion:`);
    console.log(`   Expected sets: ${totalPossibleSets} (8 categories × 5 epochs × 2 languages)`);
    console.log(`   Complete sets: ${completeSets}`);
    console.log(`   Completion: ${completionPercentage}%`);
    
    // Final assessment
    console.log(`\n🏆 Final Assessment:`);
    if (completionPercentage >= 95) {
      console.log(`   🎉 EXCELLENT! Story generation is nearly complete!`);
      console.log(`   The Orb Game is ready for production use.`);
    } else if (completionPercentage >= 80) {
      console.log(`   ✅ GOOD! Most stories are generated.`);
      console.log(`   Consider running the missing stories script to fill gaps.`);
    } else if (completionPercentage >= 60) {
      console.log(`   ⚠️ FAIR progress. Many stories still need generation.`);
      console.log(`   Run the missing stories script to complete the set.`);
    } else {
      console.log(`   ❌ NEEDS WORK. Many stories are missing.`);
      console.log(`   Run the full story generation script again.`);
    }
    
    // Check for any obvious issues
    console.log(`\n🔍 Quality Checks:`);
    
    // Check for stories with empty content
    const emptyContentStories = await storiesCollection.countDocuments({
      storyType: 'historical-figure',
      $or: [
        { fullText: { $exists: false } },
        { fullText: null },
        { fullText: '' },
        { headline: { $exists: false } },
        { headline: null },
        { headline: '' }
      ]
    });
    
    if (emptyContentStories > 0) {
      console.log(`   ⚠️ Found ${emptyContentStories} stories with empty content`);
    } else {
      console.log(`   ✅ All stories have content`);
    }
    
    // Check for duplicate cache keys
    const duplicateGroups = await storiesCollection.aggregate([
      {
        $match: { storyType: 'historical-figure' }
      },
      {
        $group: {
          _id: '$cacheKey',
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    if (duplicateGroups.length > 0) {
      console.log(`   ⚠️ Found ${duplicateGroups.length} duplicate cache keys`);
    } else {
      console.log(`   ✅ No duplicate cache keys found`);
    }
    
    console.log(`\n🎮 Ready for Testing:`);
    console.log(`   Frontend: http://localhost:5173`);
    console.log(`   Backend: http://localhost:3000`);
    console.log(`   Test the game interface to verify stories load correctly.`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    
    if (error.code === 16500) {
      console.log('\n💡 MongoDB is rate limited. Wait a few minutes and try again.');
    }
  } finally {
    if (client) {
      await client.close();
    }
  }
}

verifyStoryCompletion().catch(console.error); 