#!/usr/bin/env node

/**
 * Orb Game MongoDB Connection Test Script
 * Tests MongoDB Atlas connection and basic operations using ES Modules.
 */

import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Environment Setup ---
// Correctly resolve paths relative to this module file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from the project's .env file.
dotenv.config({ path: path.join(projectRoot, '.env') });

// --- Console Output Helper ---
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

// --- MongoDB Connection ---
const uri = process.env.MONGO_URI;

// Validate that the MongoDB URI is properly configured.
if (!uri || uri.includes('<db_password>') || uri.includes('YOUR_ACTUAL_PASSWORD')) {
  log('❌ Error: MONGO_URI is not configured in the .env file.', colors.red);
  log('Please edit the .env file and set the MONGO_URI with your database password.', colors.yellow);
  process.exit(1);
}

// Configure the MongoDB Client
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
  log('🚀 Orb Game MongoDB Connection Test Starting...', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  
  try {
    log('🔌 Attempting to connect to MongoDB Atlas...', colors.yellow);
    await client.connect();
    log('✅ Client connected successfully.', colors.green);
    
    await client.db("admin").command({ ping: 1 });
    log('✅ Ping command successful - MongoDB Atlas is reachable.', colors.green);
    
    const db = client.db('orbgame');
    log(`✅ Database "${db.databaseName}" accessible.`, colors.green);
    
    const collections = await db.listCollections().toArray();
    log(`📋 Found ${collections.length} collections:`, colors.blue);
    collections.forEach(c => log(`   - ${c.name}`, colors.blue));
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
    log('🎉 All MongoDB connection tests completed successfully!', colors.green);
    
  } catch (error) {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.red);
    log('❌ MongoDB Connection Test Failed:', colors.red);
    log(`Error: ${error.message}`, colors.red);
    
    if (error.message.includes('authentication failed')) {
      log('\n💡 Troubleshooting Tips:', colors.yellow);
      log('   - Double-check your MongoDB password in the .env file.', colors.yellow);
      log('   - Verify your user has the correct database permissions.', colors.yellow);
      log('   - Ensure your IP address is whitelisted in MongoDB Atlas.', colors.yellow);
    }
    
    process.exit(1);
  } finally {
    await client.close();
    log('🔌 MongoDB connection closed.', colors.blue);
  }
}

testConnection().catch(error => {
  log(`❌ An unexpected error occurred: ${error.message}`, colors.red);
  process.exit(1);
}); 