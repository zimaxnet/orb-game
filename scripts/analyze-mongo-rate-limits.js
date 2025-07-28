#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function analyzeMongoRateLimits() {
  console.log('🔍 Analyzing MongoDB Rate Limiting...');
  
  try {
    // Load credentials from Key Vault
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const mongoSecret = await secretClient.getSecret('MONGO-URI');
    const mongoUri = mongoSecret.value;
    
    // Connect to MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('orbgame');
    const storiesCollection = db.collection('stories');
    
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Single document insert
    console.log('\n📝 Test 1: Single document insert');
    const startTime1 = Date.now();
    try {
      const result1 = await storiesCollection.insertOne({
        test: 'rate-limit-test-1',
        timestamp: new Date(),
        type: 'rate-limit-test'
      });
      const duration1 = Date.now() - startTime1;
      console.log(`✅ Single insert successful: ${duration1}ms`);
      
      // Clean up
      await storiesCollection.deleteOne({ _id: result1.insertedId });
    } catch (error) {
      console.log(`❌ Single insert failed: ${error.message}`);
    }
    
    // Test 2: Multiple sequential inserts
    console.log('\n📝 Test 2: Multiple sequential inserts (5 documents)');
    const startTime2 = Date.now();
    const testDocs = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < 5; i++) {
      try {
        const result = await storiesCollection.insertOne({
          test: `rate-limit-test-2-${i}`,
          timestamp: new Date(),
          type: 'rate-limit-test',
          index: i
        });
        testDocs.push(result.insertedId);
        successCount++;
        
        // Small delay between inserts
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        console.log(`❌ Insert ${i} failed: ${error.message}`);
      }
    }
    
    const duration2 = Date.now() - startTime2;
    console.log(`📊 Sequential inserts: ${successCount} success, ${errorCount} errors, ${duration2}ms`);
    
    // Clean up
    if (testDocs.length > 0) {
      await storiesCollection.deleteMany({ _id: { $in: testDocs } });
    }
    
    // Test 3: Bulk insert
    console.log('\n📝 Test 3: Bulk insert (5 documents)');
    const startTime3 = Date.now();
    try {
      const bulkDocs = Array.from({ length: 5 }, (_, i) => ({
        test: `rate-limit-test-3-${i}`,
        timestamp: new Date(),
        type: 'rate-limit-test',
        index: i
      }));
      
      const result3 = await storiesCollection.insertMany(bulkDocs);
      const duration3 = Date.now() - startTime3;
      console.log(`✅ Bulk insert successful: ${result3.insertedIds.length} documents, ${duration3}ms`);
      
      // Clean up
      await storiesCollection.deleteMany({ type: 'rate-limit-test' });
    } catch (error) {
      console.log(`❌ Bulk insert failed: ${error.message}`);
    }
    
    // Test 4: Different delay strategies
    console.log('\n📝 Test 4: Testing different delay strategies');
    const delays = [0, 500, 1000, 2000, 5000];
    
    for (const delay of delays) {
      console.log(`\n   Testing with ${delay}ms delay:`);
      const startTime = Date.now();
      let success = 0;
      let errors = 0;
      
      for (let i = 0; i < 3; i++) {
        try {
          const result = await storiesCollection.insertOne({
            test: `delay-test-${delay}-${i}`,
            timestamp: new Date(),
            type: 'delay-test',
            delay: delay
          });
          success++;
          
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (error) {
          errors++;
          console.log(`    ❌ Error: ${error.message}`);
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`    📊 Success: ${success}, Errors: ${errors}, Duration: ${duration}ms`);
      
      // Clean up
      await storiesCollection.deleteMany({ type: 'delay-test' });
    }
    
    // Test 5: Batch processing strategy
    console.log('\n📝 Test 5: Batch processing strategy');
    const batchSizes = [1, 3, 5, 10];
    
    for (const batchSize of batchSizes) {
      console.log(`\n   Testing batch size ${batchSize}:`);
      const startTime = Date.now();
      let totalSuccess = 0;
      let totalErrors = 0;
      
      for (let batch = 0; batch < 2; batch++) {
        try {
          const batchDocs = Array.from({ length: batchSize }, (_, i) => ({
            test: `batch-test-${batchSize}-${batch}-${i}`,
            timestamp: new Date(),
            type: 'batch-test',
            batchSize: batchSize,
            batch: batch
          }));
          
          const result = await storiesCollection.insertMany(batchDocs);
          totalSuccess += result.insertedIds.length;
          
          // Delay between batches
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          totalErrors += batchSize;
          console.log(`    ❌ Batch error: ${error.message}`);
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`    📊 Success: ${totalSuccess}, Errors: ${totalErrors}, Duration: ${duration}ms`);
      
      // Clean up
      await storiesCollection.deleteMany({ type: 'batch-test' });
    }
    
    await client.close();
    console.log('\n✅ Rate limit analysis complete!');
    
  } catch (error) {
    console.error('❌ Rate limit analysis failed:', error);
  }
}

// Main execution
async function main() {
  await analyzeMongoRateLimits();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeMongoRateLimits }; 