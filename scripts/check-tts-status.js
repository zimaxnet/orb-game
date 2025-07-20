#!/usr/bin/env node

/**
 * Check TTS Status Script
 * Checks which stories have TTS audio and which don't
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function checkTTSStatus() {
  console.log('🔍 Checking TTS Status in MongoDB...');
  
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
    const orbgameCollections = await orbgameDb.listCollections().toArray();
    
    for (const collection of orbgameCollections) {
      const collectionName = collection.name;
      
      if (collectionName.includes('stories') || collectionName.includes('story')) {
        const coll = orbgameDb.collection(collectionName);
        
        // Count total stories
        const totalStories = await coll.countDocuments();
        
        // Count stories with TTS
        const storiesWithTTS = await coll.countDocuments({ ttsAudio: { $exists: true, $ne: null } });
        
        // Count stories without TTS
        const storiesWithoutTTS = await coll.countDocuments({ 
          $or: [
            { ttsAudio: { $exists: false } },
            { ttsAudio: null }
          ]
        });
        
        console.log(`\n📖 Collection: ${collectionName}`);
        console.log(`📊 Total stories: ${totalStories}`);
        console.log(`🎵 Stories with TTS: ${storiesWithTTS}`);
        console.log(`🔇 Stories without TTS: ${storiesWithoutTTS}`);
        
        if (storiesWithoutTTS > 0) {
          // Show a sample story without TTS
          const sampleWithoutTTS = await coll.findOne({ 
            $or: [
              { ttsAudio: { $exists: false } },
              { ttsAudio: null }
            ]
          });
          
          if (sampleWithoutTTS) {
            console.log(`📝 Sample story without TTS:`);
            console.log(`   ID: ${sampleWithoutTTS._id}`);
            console.log(`   Title: ${sampleWithoutTTS.title || sampleWithoutTTS.headline || 'No title'}`);
            console.log(`   Summary: ${(sampleWithoutTTS.summary || '').substring(0, 100)}...`);
          }
        }
      }
    }
    
    // AIMCS database has been migrated to ORBGAME and dropped
    console.log('\n✅ AIMCS database has been migrated to ORBGAME and dropped');
    
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
checkTTSStatus().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 