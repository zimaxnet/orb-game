#!/usr/bin/env node

/**
 * Migrate AIMCS to ORBGAME Script
 * Moves all stories from aimcs database to orbgame database
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function migrateAimcsToOrbgame() {
  console.log('🔄 Migrating AIMCS database to ORBGAME database...');
  
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Get database references
    const aimcsDb = client.db('aimcs');
    const orbgameDb = client.db('orbgame');
    
    // Get collection references
    const aimcsStories = aimcsDb.collection('positive_news_stories');
    const orbgameStories = orbgameDb.collection('positive_news_stories');
    
    // Check current counts
    console.log('\n📊 Current Database Status:');
    const aimcsCount = await aimcsStories.countDocuments();
    const orbgameCount = await orbgameStories.countDocuments();
    console.log(`   AIMCS stories: ${aimcsCount}`);
    console.log(`   ORBGAME stories: ${orbgameCount}`);
    
    if (aimcsCount === 0) {
      console.log('✅ No stories to migrate from AIMCS database');
      return;
    }
    
    // Get all stories from AIMCS
    console.log('\n📖 Fetching stories from AIMCS database...');
    const aimcsStoriesList = await aimcsStories.find({}).toArray();
    console.log(`✅ Found ${aimcsStoriesList.length} stories in AIMCS`);
    
    // Count stories with TTS
    const aimcsStoriesWithTTS = aimcsStoriesList.filter(story => story.ttsAudio);
    console.log(`📊 AIMCS stories with TTS: ${aimcsStoriesWithTTS.length}`);
    
    // Migrate stories to ORBGAME
    console.log('\n🔄 Migrating stories to ORBGAME database...');
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const story of aimcsStoriesList) {
      try {
        // Check if story already exists in ORBGAME (by headline and category)
        const existingStory = await orbgameStories.findOne({
          headline: story.headline,
          category: story.category
        });
        
        if (existingStory) {
          console.log(`⏭️ Skipping duplicate story: ${story.headline}`);
          skippedCount++;
          continue;
        }
        
        // Insert story into ORBGAME
        await orbgameStories.insertOne(story);
        migratedCount++;
        
        if (migratedCount % 100 === 0) {
          console.log(`📝 Migrated ${migratedCount} stories...`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrating story: ${story.headline}`, error.message);
        errorCount++;
      }
    }
    
    // Final status
    console.log('\n📊 Migration Summary:');
    console.log(`   Total stories in AIMCS: ${aimcsStoriesList.length}`);
    console.log(`   Successfully migrated: ${migratedCount}`);
    console.log(`   Skipped (duplicates): ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const finalOrbgameCount = await orbgameStories.countDocuments();
    const finalOrbgameWithTTS = await orbgameStories.countDocuments({
      ttsAudio: { $exists: true, $ne: null }
    });
    
    console.log(`📊 Final ORBGAME status:`);
    console.log(`   Total stories: ${finalOrbgameCount}`);
    console.log(`   Stories with TTS: ${finalOrbgameWithTTS}`);
    
    if (migratedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️ No stories were migrated (all were duplicates)');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the migration
migrateAimcsToOrbgame().catch(error => {
  console.error('💥 Migration runner failed:', error.message);
  process.exit(1);
}); 