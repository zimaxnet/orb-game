#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function checkStoriesNeedingAudio() {
  console.log('🔍 Checking for stories that need TTS audio...');
  
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
    
    // Get all historical figure stories
    const allStories = await storiesCollection.find({ 
      storyType: 'historical-figure' 
    }).toArray();
    
    console.log(`📊 Total historical figure stories: ${allStories.length}`);
    
    // Analyze stories by audio status
    const storiesWithAudio = allStories.filter(story => story.ttsAudio && story.ttsAudio.length > 0);
    const storiesWithoutAudio = allStories.filter(story => !story.ttsAudio || story.ttsAudio.length === 0);
    const storiesWithNullAudio = allStories.filter(story => story.ttsAudio === null);
    const storiesWithEmptyAudio = allStories.filter(story => story.ttsAudio === '');
    
    console.log(`✅ Stories with audio: ${storiesWithAudio.length}`);
    console.log(`❌ Stories without audio: ${storiesWithoutAudio.length}`);
    console.log(`⚠️ Stories with null audio: ${storiesWithNullAudio.length}`);
    console.log(`⚠️ Stories with empty audio: ${storiesWithEmptyAudio.length}`);
    
    // Get breakdown by category and epoch
    if (storiesWithoutAudio.length > 0) {
      console.log('\n📚 Stories needing audio by category:');
      const categoryStats = {};
      
      storiesWithoutAudio.forEach(story => {
        const key = `${story.category}-${story.epoch}-${story.language}`;
        if (!categoryStats[key]) {
          categoryStats[key] = {
            category: story.category,
            epoch: story.epoch,
            language: story.language,
            count: 0,
            stories: []
          };
        }
        categoryStats[key].count++;
        categoryStats[key].stories.push({
          headline: story.headline,
          id: story._id
        });
      });
      
      Object.values(categoryStats)
        .sort((a, b) => b.count - a.count)
        .forEach(stat => {
          console.log(`  ${stat.category}-${stat.epoch}-${stat.language}: ${stat.count} stories`);
          stat.stories.forEach(story => {
            console.log(`    - ${story.headline} (ID: ${story.id})`);
          });
        });
    }
    
    // Check for stories with partial audio (some stories in a set have audio, others don't)
    console.log('\n🔍 Checking for mixed audio status...');
    const mixedAudioSets = {};
    
    allStories.forEach(story => {
      const key = `${story.category}-${story.epoch}-${story.language}`;
      if (!mixedAudioSets[key]) {
        mixedAudioSets[key] = {
          withAudio: 0,
          withoutAudio: 0,
          stories: []
        };
      }
      
      if (story.ttsAudio && story.ttsAudio.length > 0) {
        mixedAudioSets[key].withAudio++;
      } else {
        mixedAudioSets[key].withoutAudio++;
      }
      mixedAudioSets[key].stories.push(story);
    });
    
    const incompleteSets = Object.entries(mixedAudioSets)
      .filter(([key, stats]) => stats.withAudio > 0 && stats.withoutAudio > 0)
      .map(([key, stats]) => ({ key, ...stats }));
    
    if (incompleteSets.length > 0) {
      console.log('\n⚠️ Sets with mixed audio status:');
      incompleteSets.forEach(set => {
        console.log(`  ${set.key}: ${set.withAudio} with audio, ${set.withoutAudio} without audio`);
      });
    }
    
    // Check audio quality (base64 length)
    console.log('\n🎵 Audio quality analysis:');
    const audioLengths = storiesWithAudio.map(story => story.ttsAudio.length);
    const avgAudioLength = audioLengths.reduce((sum, len) => sum + len, 0) / audioLengths.length;
    const minAudioLength = Math.min(...audioLengths);
    const maxAudioLength = Math.max(...audioLengths);
    
    console.log(`  Average audio size: ${Math.round(avgAudioLength)} characters`);
    console.log(`  Min audio size: ${minAudioLength} characters`);
    console.log(`  Max audio size: ${maxAudioLength} characters`);
    
    // Identify potentially corrupted or very small audio files
    const suspiciousAudio = storiesWithAudio.filter(story => 
      story.ttsAudio.length < 1000 || story.ttsAudio.length > 1000000
    );
    
    if (suspiciousAudio.length > 0) {
      console.log(`\n⚠️ Stories with suspicious audio sizes: ${suspiciousAudio.length}`);
      suspiciousAudio.forEach(story => {
        console.log(`  ${story.headline}: ${story.ttsAudio.length} characters`);
      });
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Total stories: ${allStories.length}`);
    console.log(`  Stories with good audio: ${storiesWithAudio.length - suspiciousAudio.length}`);
    console.log(`  Stories needing audio: ${storiesWithoutAudio.length}`);
    console.log(`  Stories with suspicious audio: ${suspiciousAudio.length}`);
    console.log(`  Incomplete audio sets: ${incompleteSets.length}`);
    
    if (storiesWithoutAudio.length > 0) {
      console.log('\n💡 Recommendation:');
      console.log(`  Run audio generation for ${storiesWithoutAudio.length} stories`);
      console.log(`  Focus on incomplete sets first`);
    }
    
    await client.close();
    console.log('\n✅ Audio analysis complete!');
    
    return {
      totalStories: allStories.length,
      storiesWithAudio: storiesWithAudio.length,
      storiesWithoutAudio: storiesWithoutAudio.length,
      suspiciousAudio: suspiciousAudio.length,
      incompleteSets: incompleteSets.length,
      storiesNeedingAudio: storiesWithoutAudio
    };
    
  } catch (error) {
    console.error('❌ Failed to check stories needing audio:', error);
    return null;
  }
}

// Main execution
async function main() {
  const results = await checkStoriesNeedingAudio();
  
  if (results) {
    console.log('\n🎯 Next Steps:');
    if (results.storiesWithoutAudio > 0) {
      console.log(`  1. Generate audio for ${results.storiesWithoutAudio} stories`);
      console.log(`  2. Focus on incomplete sets first`);
      console.log(`  3. Re-run this check after audio generation`);
    } else {
      console.log('  ✅ All stories have audio!');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkStoriesNeedingAudio }; 