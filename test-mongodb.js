#!/usr/bin/env node

/**
 * AIMCS MongoDB Connection Test Script
 * Tests MongoDB Atlas connection and basic operations
 */

import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this script and load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from project root
dotenv.config({ path: path.join(projectRoot, '.env') });

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

const uri = process.env.MONGO_URI;

if (!uri || uri.includes('YOUR_ACTUAL_PASSWORD')) {
  log('❌ Error: MONGO_URI environment variable not set or contains placeholder password', colors.red);
  log('Please set MONGO_URI in your .env file with the actual password', colors.yellow);
  process.exit(1);
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: false,
});

async function testConnection() {
  log('🚀 AIMCS MongoDB Connection Test Starting...', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  
  try {
    log('🔌 Attempting to connect to MongoDB Atlas...', colors.yellow);
    
    // Connect the client to the server
    await client.connect();
    log('✅ Client connected successfully', colors.green);
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    log('✅ Ping command successful - MongoDB Atlas is reachable', colors.green);
    
    // Test database access
    const db = client.db('aimcs');
    log('✅ Database "aimcs" accessible', colors.green);
    
    // List collections to verify access
    const collections = await db.listCollections().toArray();
    log(`📋 Found ${collections.length} collections:`, colors.blue);
    collections.forEach(collection => {
      log(`   - ${collection.name}`, colors.blue);
    });
    
    // Test basic write operation
    log('📝 Testing write operation...', colors.yellow);
    const testCollection = db.collection('connection_test');
    const testDoc = { 
      test: true, 
      timestamp: new Date().toISOString(),
      message: 'MongoDB connection test successful',
      testId: `test_${Date.now()}`
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    log(`✅ Write operation successful - Document ID: ${insertResult.insertedId}`, colors.green);
    
    // Test read operation
    log('📖 Testing read operation...', colors.yellow);
    const result = await testCollection.findOne({ _id: insertResult.insertedId });
    if (result && result.test === true) {
      log('✅ Read operation successful - Document retrieved correctly', colors.green);
    } else {
      throw new Error('Read operation failed - Document not found or corrupted');
    }
    
    // Test update operation
    log('📝 Testing update operation...', colors.yellow);
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { updated: true, updateTime: new Date().toISOString() } }
    );
    if (updateResult.modifiedCount === 1) {
      log('✅ Update operation successful', colors.green);
    } else {
      throw new Error('Update operation failed');
    }
    
    // Clean up test data
    log('🧹 Cleaning up test data...', colors.yellow);
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    if (deleteResult.deletedCount === 1) {
      log('✅ Cleanup operation successful', colors.green);
    } else {
      log('⚠️ Warning: Test document cleanup may have failed', colors.yellow);
    }
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
    log('🎉 All MongoDB operations completed successfully!', colors.green);
    log('✅ Your MongoDB Atlas connection is working perfectly', colors.green);
    
  } catch (error) {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.red);
    log('❌ MongoDB connection test failed:', colors.red);
    log(`Error: ${error.message}`, colors.red);
    
    if (error.message.includes('authentication failed')) {
      log('\n💡 Troubleshooting tips:', colors.yellow);
      log('   - Check if your MongoDB password is correct in the .env file.', colors.yellow);
      log('   - Verify your database user exists and has the right permissions.', colors.yellow);
      log('   - Make sure your current IP address is whitelisted in MongoDB Atlas.', colors.yellow);
    } else if (error.message.includes('network')) {
      log('\n💡 Troubleshooting tips:', colors.yellow);
      log('   - Check your internet connection.', colors.yellow);
      log('   - Verify your MongoDB Atlas cluster is running.', colors.yellow);
      log('   - Check if a firewall or VPN is blocking the connection.', colors.yellow);
    }
    
    process.exit(1);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    log('🔌 MongoDB connection closed', colors.blue);
  }
}

// Run the test
testConnection().catch(error => {
  log(`❌ Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
}); 