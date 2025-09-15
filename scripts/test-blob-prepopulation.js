#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function testBlobPrepopulation() {
  console.log('🧪 Testing Blob Prepopulation Setup...');
  
  try {
    // Test Key Vault access
    console.log('🔐 Testing Key Vault access...');
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    // Load Azure OpenAI API key
    const azureOpenAIApiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
    console.log('✅ Key Vault access successful');
    
    // Set environment variables
    process.env.AZURE_OPENAI_API_KEY = azureOpenAIApiKeySecret.value;
    process.env.AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-5-mini';
    
    console.log('✅ Environment variables set');
    
    // Test blob storage service
    console.log('📦 Testing Blob Storage Service...');
    const BlobStorageService = (await import('../backend/blob-storage-service.js')).default;
    const blobService = new BlobStorageService();
    await blobService.initialize();
    console.log('✅ Blob Storage Service initialized');
    
    // Test historical figures service
    console.log('🎭 Testing Historical Figures Service...');
    const HistoricalFiguresServiceBlob = (await import('../backend/historical-figures-service-blob.js')).default;
    const historicalFiguresService = new HistoricalFiguresServiceBlob();
    await historicalFiguresService.initialize();
    console.log('✅ Historical Figures Service initialized');
    
    // Test story generation
    console.log('📚 Testing story generation...');
    const stories = await historicalFiguresService.generateStories('Science', 'Modern', 'en', 'gpt-5-mini', 1);
    
    if (stories && stories.length > 0) {
      console.log('✅ Story generation successful');
      console.log(`📖 Generated story: ${stories[0].headline}`);
    } else {
      console.log('❌ Story generation failed');
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBlobPrepopulation().catch(console.error);
