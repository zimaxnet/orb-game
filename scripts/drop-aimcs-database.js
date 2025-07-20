#!/usr/bin/env node

/**
 * Drop AIMCS Database Script
 * Drops the AIMCS database and removes all references to it
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function dropAimcsDatabase() {
  console.log('🗑️ Dropping AIMCS database...');
  
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Check current status
    console.log('\n📊 Current Database Status:');
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();
    
    const aimcsDb = databases.databases.find(db => db.name === 'aimcs');
    const orbgameDb = databases.databases.find(db => db.name === 'orbgame');
    
    if (aimcsDb) {
      console.log(`   AIMCS database: ${aimcsDb.name} (${aimcsDb.sizeOnDisk} bytes)`);
    } else {
      console.log('   AIMCS database: Not found');
    }
    
    if (orbgameDb) {
      console.log(`   ORBGAME database: ${orbgameDb.name} (${orbgameDb.sizeOnDisk} bytes)`);
    } else {
      console.log('   ORBGAME database: Not found');
    }
    
    // Drop AIMCS database
    if (aimcsDb) {
      console.log('\n🗑️ Dropping AIMCS database...');
      await client.db('aimcs').dropDatabase();
      console.log('✅ AIMCS database dropped successfully');
    } else {
      console.log('\n⚠️ AIMCS database not found - nothing to drop');
    }
    
    // Verify AIMCS is gone
    console.log('\n🔍 Verifying AIMCS database is dropped...');
    const databasesAfter = await adminDb.admin().listDatabases();
    const aimcsAfter = databasesAfter.databases.find(db => db.name === 'aimcs');
    
    if (!aimcsAfter) {
      console.log('✅ AIMCS database successfully removed');
    } else {
      console.log('❌ AIMCS database still exists');
    }
    
    // Final status
    console.log('\n📊 Final Database Status:');
    const orbgameAfter = databasesAfter.databases.find(db => db.name === 'orbgame');
    if (orbgameAfter) {
      console.log(`   ORBGAME database: ${orbgameAfter.name} (${orbgameAfter.sizeOnDisk} bytes)`);
    }
    
    console.log('\n✅ AIMCS database cleanup completed!');
    
  } catch (error) {
    console.error('💥 Drop AIMCS failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the script
dropAimcsDatabase().catch(error => {
  console.error('💥 Drop AIMCS runner failed:', error.message);
  process.exit(1);
}); 