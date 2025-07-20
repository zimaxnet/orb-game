#!/usr/bin/env node

/**
 * Azure Cosmos DB for MongoDB Connection Test
 * Simplified test specifically for Azure Cosmos DB
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MONGO_URI not set in environment');
  process.exit(1);
}

console.log('🔧 Testing Azure Cosmos DB for MongoDB connection...');
console.log('📡 Connection string format:', uri.replace(/\/\/.*@/, '//***:***@'));

// Simplified client configuration for Azure Cosmos DB
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  // Minimal configuration for Azure Cosmos DB
});

async function testConnection() {
  try {
    console.log('🔌 Connecting to Azure Cosmos DB...');
    
    // Connect without specifying serverApi
    await client.connect();
    console.log('✅ Connected successfully');
    
    // Test basic database access
    const db = client.db('orbgame');
    console.log('✅ Database access successful');
    
    // Test collection creation and basic operations
    const testCollection = db.collection('connection_test');
    
    // Insert a test document
    const insertResult = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Azure Cosmos DB connection test'
    });
    console.log('✅ Write operation successful');
    
    // Read the test document
    const doc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Read operation successful');
    
    // Clean up
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Cleanup successful');
    
    console.log('🎉 Azure Cosmos DB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication issue detected:');
      console.log('   - Check your primary key');
      console.log('   - Verify account name');
    } else if (error.message.includes('Command Hello not supported')) {
      console.log('\n💡 Azure Cosmos DB specific issue:');
      console.log('   - This is a known issue with some Azure Cosmos DB configurations');
      console.log('   - The connection might still work for basic operations');
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection(); 