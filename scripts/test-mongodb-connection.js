#!/usr/bin/env node

/**
 * Test MongoDB Connection
 * 
 * This script tests if the MongoDB connection is working properly.
 */

import { MongoClient } from 'mongodb';

async function testMongoDBConnection() {
  console.log('🧪 Testing MongoDB Connection...\n');

  try {
    // Try to get MongoDB URI from environment
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGO_URI not set in environment');
      console.log('💡 This is expected for local testing - the production backend uses Azure Key Vault');
      return;
    }

    console.log('🔧 Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    const client = new MongoClient(mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    
    await client.connect();
    console.log('✅ MongoDB connection successful');
    
    const db = client.db('orbgame');
    console.log('✅ Database access successful');
    
    // Test collection access
    const stories = db.collection('historical_figures_stories');
    const count = await stories.countDocuments();
    console.log(`📚 Found ${count} historical figure stories in database`);
    
    if (count > 0) {
      const sampleStory = await stories.findOne();
      console.log('✅ Sample story found:', {
        headline: sampleStory.headline,
        historicalFigure: sampleStory.historicalFigure,
        category: sampleStory.category,
        epoch: sampleStory.epoch,
        language: sampleStory.language
      });
    }
    
    await client.close();
    console.log('✅ MongoDB connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMongoDBConnection().catch(console.error); 