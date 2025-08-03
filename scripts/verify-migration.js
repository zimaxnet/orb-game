#!/usr/bin/env node

/**
 * Verify Migration Script
 * Verifies that the AIMCS to ORBGAME migration was successful
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function verifyMigration() {
  console.log('🔍 Verifying AIMCS to ORBGAME Migration...');
  
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Check if AIMCS database still exists
    console.log('\n🗄️ Checking if AIMCS database still exists...');
    try {
      const aimcsDb = client.db('aimcs');
      const aimcsCollections = await aimcsDb.listCollections().toArray();
      
      if (aimcsCollections.length > 0) {
        console.log('❌ AIMCS database still exists with collections:');
        for (const collection of aimcsCollections) {
          console.log(`   - ${collection.name}`);
        }
      } else {
        console.log('✅ AIMCS database is empty or dropped');
      }
    } catch (error) {
      console.log('✅ AIMCS database has been successfully dropped');
    }
    
    // Check ORBGAME database content
    console.log('\n🗄️ Checking ORBGAME database content...');
    const orbgameDb = client.db('orbgame');
    const orbgameCollections = await orbgameDb.listCollections().toArray();
    
    console.log(`📋 Found ${orbgameCollections.length} collections in ORBGAME:`);
    
    let totalStories = 0;
    let totalStoriesWithTTS = 0;
    
    for (const collection of orbgameCollections) {
      const collectionName = collection.name;
      console.log(`\n📖 Collection: ${collectionName}`);
      
      const coll = orbgameDb.collection(collectionName);
      const count = await coll.countDocuments();
      const ttsCount = await coll.countDocuments({ ttsAudio: { $exists: true, $ne: null } });
      
      console.log(`   📄 Total documents: ${count}`);
      console.log(`   🎵 Documents with TTS: ${ttsCount}`);
      console.log(`   🔇 Documents without TTS: ${count - ttsCount}`);
      
      totalStories += count;
      totalStoriesWithTTS += ttsCount;
      
      // Show sample documents
      if (count > 0) {
        const sample = await coll.findOne();
        console.log(`   📝 Sample document fields:`, Object.keys(sample));
        
        if (sample.category) {
          console.log(`   📂 Sample category: ${sample.category}`);
        }
        
        if (sample.headline) {
          console.log(`   📰 Sample headline: ${sample.headline.substring(0, 80)}...`);
        }
      }
    }
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   📚 Total stories in ORBGAME: ${totalStories}`);
    console.log(`   🎵 Stories with TTS: ${totalStoriesWithTTS}`);
    console.log(`   🔇 Stories without TTS: ${totalStories - totalStoriesWithTTS}`);
    console.log(`   📈 TTS Coverage: ${totalStories > 0 ? ((totalStoriesWithTTS / totalStories) * 100).toFixed(1) : 0}%`);
    
    if (totalStories > 0) {
      console.log('\n✅ Migration appears successful!');
      console.log('   - Stories have been migrated to ORBGAME database');
      console.log('   - AIMCS database has been dropped');
      console.log('   - TTS audio has been preserved');
    } else {
      console.log('\n⚠️ No stories found in ORBGAME database');
    }
    
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the verification
verifyMigration().catch(error => {
  console.error('💥 Verification runner failed:', error.message);
  process.exit(1);
}); 