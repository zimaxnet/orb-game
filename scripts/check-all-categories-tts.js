#!/usr/bin/env node

/**
 * Check All Categories TTS Script
 * Checks how many stories with TTS exist across all categories
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function checkAllCategoriesTTS() {
  console.log('🔍 Checking All Categories TTS...');
  
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
    
    // Get all stories with TTS
    const allStoriesWithTTS = await orbgameStories.find({ 
      ttsAudio: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`📊 Total stories with TTS: ${allStoriesWithTTS.length}`);
    
    // Group by category
    const categories = {};
    for (const story of allStoriesWithTTS) {
      const category = story.category || 'Unknown';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(story);
    }
    
    console.log('\n📋 Stories with TTS by Category:');
    for (const [category, stories] of Object.entries(categories)) {
      console.log(`   ${category}: ${stories.length} stories`);
    }
    
    // Check total stories by category
    console.log('\n📊 Total stories by category:');
    const allStories = await orbgameStories.find({}).toArray();
    const totalByCategory = {};
    for (const story of allStories) {
      const category = story.category || 'Unknown';
      if (!totalByCategory[category]) {
        totalByCategory[category] = { total: 0, withTTS: 0 };
      }
      totalByCategory[category].total++;
      if (story.ttsAudio) {
        totalByCategory[category].withTTS++;
      }
    }
    
    for (const [category, stats] of Object.entries(totalByCategory)) {
      const percentage = ((stats.withTTS / stats.total) * 100).toFixed(1);
      console.log(`   ${category}: ${stats.withTTS}/${stats.total} (${percentage}%)`);
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
checkAllCategoriesTTS().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 