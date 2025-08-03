#!/usr/bin/env node

/**
 * Check Database Stories Script
 * Checks the actual stories in the database to see their structure
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function checkDatabaseStories() {
  console.log('🔍 Checking Database Stories...');
  
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
    
    // Get a few sample stories
    const sampleStories = await orbgameStories.find({}).limit(3).toArray();
    console.log(`📝 Found ${sampleStories.length} sample stories`);
    
    for (let i = 0; i < sampleStories.length; i++) {
      const story = sampleStories[i];
      console.log(`\n📖 Story ${i + 1}:`);
      console.log(`   ID: ${story._id}`);
      console.log(`   Category: ${story.category}`);
      console.log(`   Headline: ${story.headline}`);
      console.log(`   Source: ${story.source}`);
      console.log(`   Last Used: ${story.lastUsed || 'Never'}`);
      console.log(`   Use Count: ${story.useCount || 0}`);
      console.log(`   Is Fresh: ${story.isFresh}`);
      console.log(`   Has TTS: ${story.ttsAudio ? 'Yes' : 'No'}`);
      console.log(`   TTS Length: ${story.ttsAudio ? story.ttsAudio.length : 0} chars`);
      
      // Check all fields
      console.log(`   📋 All fields:`, Object.keys(story));
    }
    
    // Test the aggregation query that PositiveNewsService uses
    console.log('\n🔍 Testing PositiveNewsService aggregation query...');
    try {
      const aggregationResult = await orbgameStories.aggregate([
        { $match: { category: 'Technology' } },
        { $sort: { lastUsed: 1, useCount: 1 } },
        { $limit: 3 },
        { $group: { _id: '$source', stories: { $push: '$$ROOT' } } },
        { $project: { story: { $arrayElemAt: ['$stories', 0] } } },
        { $replaceRoot: { newRoot: '$story' } }
      ]).toArray();
      
      console.log(`📊 Aggregation result: ${aggregationResult.length} stories`);
      for (const story of aggregationResult) {
        console.log(`   - ${story.headline} (${story.source})`);
      }
    } catch (error) {
      console.error('❌ Aggregation failed:', error.message);
    }
    
    // Test a simpler query
    console.log('\n🔍 Testing simple query...');
    const simpleStories = await orbgameStories.find({ category: 'Technology' }).limit(3).toArray();
    console.log(`📊 Simple query result: ${simpleStories.length} stories`);
    for (const story of simpleStories) {
      console.log(`   - ${story.headline} (${story.source}) - TTS: ${story.ttsAudio ? 'Yes' : 'No'}`);
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
checkDatabaseStories().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 