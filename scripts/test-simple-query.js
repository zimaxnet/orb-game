#!/usr/bin/env node

/**
 * Test Simple Query Script
 * Tests a simple database query to see what stories are available
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function testSimpleQuery() {
  console.log('🧪 Testing Simple Database Query...');
  
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
    
    // Simple query to get Technology stories with TTS
    console.log('\n📖 Testing simple query for Technology stories with TTS...');
    const storiesWithTTS = await orbgameStories.find({ 
      category: 'Technology',
      ttsAudio: { $exists: true, $ne: null }
    }).limit(10).toArray();
    
    console.log(`✅ Found ${storiesWithTTS.length} Technology stories with TTS`);
    
    if (storiesWithTTS.length > 0) {
      console.log('\n📖 First 3 stories with TTS:');
      for (let i = 0; i < Math.min(3, storiesWithTTS.length); i++) {
        const story = storiesWithTTS[i];
        console.log(`\n   Story ${i + 1}:`);
        console.log(`   ID: ${story._id}`);
        console.log(`   Headline: ${story.headline}`);
        console.log(`   Source: ${story.source}`);
        console.log(`   TTS Length: ${story.ttsAudio.length} characters`);
      }
    }
    
    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('https://api.orbgame.us/api/orb/positive-news/Technology?count=10');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API returned ${data.length} stories`);
      
      const apiStoriesWithTTS = data.filter(story => story.ttsAudio);
      console.log(`📊 API stories with TTS: ${apiStoriesWithTTS.length}`);
      
      if (apiStoriesWithTTS.length > 0) {
        console.log('\n📖 First API story with TTS:');
        const story = apiStoriesWithTTS[0];
        console.log(`   Headline: ${story.headline}`);
        console.log(`   Source: ${story.source}`);
        console.log(`   TTS Length: ${story.ttsAudio.length} characters`);
      }
    } else {
      console.error(`❌ API failed: ${response.status} ${response.statusText}`);
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
testSimpleQuery().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 