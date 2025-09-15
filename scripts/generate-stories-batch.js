#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function generateStoriesBatch(startCategory = 0, batchSize = 2) {
  console.log(`🎯 Generating Stories Batch: Categories ${startCategory} to ${startCategory + batchSize - 1}`);
  
  try {
    // Load credentials from Key Vault
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const azureOpenAIApiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
    
    // Set environment variables
    process.env.AZURE_OPENAI_API_KEY = azureOpenAIApiKeySecret.value;
    process.env.AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-5-mini';
    
    console.log('✅ Credentials loaded');
    
    // Initialize services
    const HistoricalFiguresServiceBlob = (await import('../backend/historical-figures-service-blob.js')).default;
    const historicalFiguresService = new HistoricalFiguresServiceBlob();
    await historicalFiguresService.initialize();
    
    console.log('✅ Services initialized');
    
    // Generate stories for batch of categories
    const allCategories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    const categories = allCategories.slice(startCategory, startCategory + batchSize);
    
    let totalGenerated = 0;
    let totalErrors = 0;
    
    console.log(`📚 Processing categories: ${categories.join(', ')}`);
    
    for (const category of categories) {
      console.log(`\n🏷️ Processing Category: ${category}`);
      
      for (const epoch of epochs) {
        for (const language of languages) {
          try {
            console.log(`   📖 ${epoch}/${language}...`);
            
            const stories = await historicalFiguresService.generateStories(
              category, 
              epoch, 
              language, 
              'gpt-5-mini', 
              3 // Generate 3 stories per combination
            );
            
            if (stories && stories.length > 0) {
              totalGenerated += stories.length;
              console.log(`   ✅ Generated ${stories.length} stories`);
            } else {
              console.log(`   ⚠️ No stories generated`);
              totalErrors++;
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            totalErrors++;
          }
        }
      }
    }
    
    console.log(`\n📊 Batch Summary:`);
    console.log(`   Categories processed: ${categories.length}`);
    console.log(`   Stories generated: ${totalGenerated}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`   Expected: ${categories.length * epochs.length * languages.length * 3}`);
    
    console.log('\n🎉 Batch completed!');
    
  } catch (error) {
    console.error('❌ Batch failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Get command line arguments
const startCategory = parseInt(process.argv[2]) || 0;
const batchSize = parseInt(process.argv[3]) || 2;

generateStoriesBatch(startCategory, batchSize).catch(console.error);
