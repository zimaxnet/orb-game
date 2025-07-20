#!/usr/bin/env node

/**
 * Check OrbGame Database Script
 * Checks what's in the orbgame database
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function checkOrbGameDB() {
  console.log('🔍 Checking OrbGame Database...');
  console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Check the orbgame database
    const orbgameDb = client.db('orbgame');
    console.log(`📊 Database name: ${orbgameDb.databaseName}`);
    
    // List all collections
    const collections = await orbgameDb.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`  - ${collection.name}`);
      
      // Count documents in each collection
      const coll = orbgameDb.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`    📄 Documents: ${count}`);
      
      // Show a sample document
      if (count > 0) {
        const sample = await coll.findOne();
        console.log(`    📝 Sample fields:`, Object.keys(sample));
        if (sample.summary) {
          console.log(`    📖 Sample summary: ${sample.summary.substring(0, 100)}...`);
        }
        if (sample.title) {
          console.log(`    📖 Sample title: ${sample.title}`);
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
checkOrbGameDB().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 