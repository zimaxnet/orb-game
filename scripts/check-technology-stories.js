#!/usr/bin/env node

/**
 * Check Technology Stories Script
 * Checks specifically what Technology stories are in the database
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function checkTechnologyStories() {
  console.log('🔍 Checking Technology Stories in Database...');
  
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Check orbgame database
    console.log('\n🗄️ Checking orbgame database...');
    const orbgameDb = client.db('orbgame');
    const orbgameStories = orbgameDb.collection('positive_news_stories');
    
    // Get all Technology stories
    const technologyStories = await orbgameStories.find({ category: 'Technology' }).toArray();
    console.log(`📝 Found ${technologyStories.length} Technology stories`);
    
    // Count stories with TTS
    const storiesWithTTS = technologyStories.filter(story => story.ttsAudio);
    const storiesWithoutTTS = technologyStories.filter(story => !story.ttsAudio);
    
    console.log(`\n📊 Technology Stories Summary:`);
    console.log(`   Total stories: ${technologyStories.length}`);
    console.log(`   Stories with TTS: ${storiesWithTTS.length}`);
    console.log(`   Stories without TTS: ${storiesWithoutTTS.length}`);
    console.log(`   TTS success rate: ${((storiesWithTTS.length / technologyStories.length) * 100).toFixed(1)}%`);
    
    // Show all stories with their sources
    console.log(`\n📖 All Technology Stories:`);
    for (let i = 0; i < technologyStories.length; i++) {
      const story = technologyStories[i];
      console.log(`\n   Story ${i + 1}:`);
      console.log(`   ID: ${story._id}`);
      console.log(`   Headline: ${story.headline}`);
      console.log(`   Source: ${story.source}`);
      console.log(`   Published: ${story.publishedAt}`);
      console.log(`   Has TTS: ${story.ttsAudio ? 'Yes' : 'No'}`);
      if (story.ttsAudio) {
        console.log(`   TTS Length: ${story.ttsAudio.length} characters`);
      }
    }
    
    // Check sources
    const sources = [...new Set(technologyStories.map(story => story.source))];
    console.log(`\n📋 Sources found: ${sources.join(', ')}`);
    
    // Check stories by source
    for (const source of sources) {
      const sourceStories = technologyStories.filter(story => story.source === source);
      const sourceStoriesWithTTS = sourceStories.filter(story => story.ttsAudio);
      console.log(`\n   ${source}: ${sourceStories.length} stories (${sourceStoriesWithTTS.length} with TTS)`);
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the script
checkTechnologyStories().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 