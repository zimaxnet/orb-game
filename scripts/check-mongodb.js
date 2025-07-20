#!/usr/bin/env node

/**
 * Check MongoDB Database Script
 * Checks what's in the MongoDB database
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';

async function checkMongoDB() {
  console.log('🔍 Checking MongoDB Database...');
  console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    console.log(`📊 Database name: ${db.databaseName}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`  - ${collection.name}`);
      
      // Count documents in each collection
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`    📄 Documents: ${count}`);
      
      // Show a sample document
      if (count > 0) {
        const sample = await coll.findOne();
        console.log(`    📝 Sample fields:`, Object.keys(sample));
        if (sample.summary) {
          console.log(`    📖 Sample summary: ${sample.summary.substring(0, 100)}...`);
        }
      }
    }
    
    // List all databases
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();
    console.log('\n🗄️ Available databases:');
    for (const dbInfo of databases.databases) {
      console.log(`  - ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
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
checkMongoDB().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 