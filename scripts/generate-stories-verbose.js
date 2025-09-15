#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function generateStoriesVerbose() {
  console.log('🎯 VERBOSE Story Generation Starting...');
  console.log('=====================================');
  
  try {
    // Step 1: Load credentials
    console.log('\n🔐 STEP 1: Loading Azure Key Vault credentials...');
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    console.log('   📡 Connecting to Key Vault...');
    const azureOpenAIApiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
    console.log('   ✅ API Key retrieved successfully');
    
    // Set environment variables
    process.env.AZURE_OPENAI_API_KEY = azureOpenAIApiKeySecret.value;
    process.env.AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-5-mini';
    
    console.log('   ✅ Environment variables configured');
    console.log('   📍 Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
    console.log('   🤖 Model:', process.env.AZURE_OPENAI_DEPLOYMENT);
    
    // Step 2: Initialize services
    console.log('\n🔧 STEP 2: Initializing services...');
    console.log('   📦 Loading Historical Figures Service...');
    const HistoricalFiguresServiceBlob = (await import('../backend/historical-figures-service-blob.js')).default;
    const historicalFiguresService = new HistoricalFiguresServiceBlob();
    
    console.log('   🚀 Initializing service...');
    await historicalFiguresService.initialize();
    console.log('   ✅ Historical Figures Service ready');
    
    // Step 3: Generate stories for specific combinations
    console.log('\n📚 STEP 3: Generating stories...');
    
    const categories = ['Technology', 'Science']; // Start with just 2 categories
    const epochs = ['Modern']; // Start with just Modern epoch
    const languages = ['en']; // Start with just English
    
    let totalGenerated = 0;
    let totalErrors = 0;
    
    console.log(`   🎯 Target: ${categories.length} categories × ${epochs.length} epochs × ${languages.length} languages × 3 stories = ${categories.length * epochs.length * languages.length * 3} total stories`);
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      console.log(`\n   🏷️ CATEGORY ${i + 1}/${categories.length}: ${category}`);
      
      for (let j = 0; j < epochs.length; j++) {
        const epoch = epochs[j];
        console.log(`      📅 EPOCH ${j + 1}/${epochs.length}: ${epoch}`);
        
        for (let k = 0; k < languages.length; k++) {
          const language = languages[k];
          console.log(`         🌍 LANGUAGE ${k + 1}/${languages.length}: ${language}`);
          
          try {
            console.log(`         🔄 Generating 3 stories...`);
            
            const startTime = Date.now();
            const stories = await historicalFiguresService.generateStories(
              category, 
              epoch, 
              language, 
              'gpt-5-mini', 
              3
            );
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);
            
            if (stories && stories.length > 0) {
              totalGenerated += stories.length;
              console.log(`         ✅ SUCCESS: Generated ${stories.length} stories in ${duration}s`);
              
              // Show story details
              stories.forEach((story, index) => {
                console.log(`            📖 Story ${index + 1}: "${story.headline}"`);
                console.log(`               👤 Figure: ${story.figureName}`);
                console.log(`               📝 Length: ${story.story?.length || story.fullText?.length || 0} characters`);
              });
            } else {
              console.log(`         ⚠️ WARNING: No stories generated`);
              totalErrors++;
            }
            
            // Add delay to avoid rate limiting
            console.log(`         ⏳ Waiting 2 seconds before next request...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.error(`         ❌ ERROR: ${error.message}`);
            if (error.stack) {
              console.error(`         📍 Stack: ${error.stack.split('\n')[1]}`);
            }
            totalErrors++;
          }
        }
      }
    }
    
    // Step 4: Summary
    console.log('\n📊 STEP 4: Generation Summary');
    console.log('=====================================');
    console.log(`   📈 Stories generated: ${totalGenerated}`);
    console.log(`   ❌ Errors encountered: ${totalErrors}`);
    console.log(`   🎯 Success rate: ${totalGenerated > 0 ? ((totalGenerated / (totalGenerated + totalErrors)) * 100).toFixed(1) : 0}%`);
    
    if (totalGenerated > 0) {
      console.log('\n🎉 SUCCESS: Story generation completed!');
      console.log('   💡 You can now test the frontend to see the new stories');
    } else {
      console.log('\n⚠️ WARNING: No stories were generated');
      console.log('   🔍 Check the error messages above for troubleshooting');
    }
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('📍 Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Add process handlers for better control
process.on('SIGINT', () => {
  console.log('\n\n🛑 Process interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Run the verbose generation
generateStoriesVerbose().catch(console.error);
