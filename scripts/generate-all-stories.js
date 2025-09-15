#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function generateAllStories() {
  console.log('🎯 Generating All Historical Figure Stories...');
  
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
    
    // Generate stories for all combinations
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    let totalGenerated = 0;
    let totalErrors = 0;
    
    for (const category of categories) {
      for (const epoch of epochs) {
        for (const language of languages) {
          try {
            console.log(`\n📚 Generating stories for: ${category}/${epoch}/${language}`);
            
            const stories = await historicalFiguresService.generateStories(
              category, 
              epoch, 
              language, 
              'gpt-5-mini', 
              3 // Generate 3 stories per combination
            );
            
            if (stories && stories.length > 0) {
              totalGenerated += stories.length;
              console.log(`✅ Generated ${stories.length} stories`);
              console.log(`   Sample: ${stories[0].headline}`);
            } else {
              console.log(`⚠️ No stories generated`);
              totalErrors++;
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.error(`❌ Error generating stories for ${category}/${epoch}/${language}:`, error.message);
            totalErrors++;
          }
        }
      }
    }
    
    console.log(`\n📊 Generation Summary:`);
    console.log(`   Total stories generated: ${totalGenerated}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`   Expected total: ${categories.length * epochs.length * languages.length * 3}`);
    
    console.log('\n🎉 Story generation completed!');
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

generateAllStories().catch(console.error);
