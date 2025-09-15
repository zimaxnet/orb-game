#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function generateAllStoriesComprehensive() {
  console.log('🎯 COMPREHENSIVE Story Generation Starting...');
  console.log('===============================================');
  console.log('🎯 Target: 8 categories × 5 epochs × 2 languages × 3 stories = 240 total stories');
  console.log('⏱️ Estimated time: ~40-60 minutes');
  console.log('===============================================\n');
  
  const startTime = Date.now();
  
  try {
    // Step 1: Load credentials
    console.log('🔐 STEP 1: Loading Azure Key Vault credentials...');
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const azureOpenAIApiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
    process.env.AZURE_OPENAI_API_KEY = azureOpenAIApiKeySecret.value;
    process.env.AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-5-mini';
    console.log('✅ Credentials loaded successfully\n');
    
    // Step 2: Initialize services
    console.log('🔧 STEP 2: Initializing services...');
    const HistoricalFiguresServiceBlob = (await import('../backend/historical-figures-service-blob.js')).default;
    const historicalFiguresService = new HistoricalFiguresServiceBlob();
    await historicalFiguresService.initialize();
    console.log('✅ Services initialized successfully\n');
    
    // Step 3: Generate all stories
    console.log('📚 STEP 3: Generating all stories...');
    
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    let totalGenerated = 0;
    let totalErrors = 0;
    let currentBatch = 0;
    const totalBatches = categories.length * epochs.length * languages.length;
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      console.log(`\n🏷️ CATEGORY ${i + 1}/8: ${category}`);
      
      for (let j = 0; j < epochs.length; j++) {
        const epoch = epochs[j];
        console.log(`   📅 EPOCH ${j + 1}/5: ${epoch}`);
        
        for (let k = 0; k < languages.length; k++) {
          const language = languages[k];
          currentBatch++;
          
          const progress = ((currentBatch / totalBatches) * 100).toFixed(1);
          console.log(`      🌍 LANGUAGE ${k + 1}/2: ${language} (${progress}% complete)`);
          
          try {
            const batchStartTime = Date.now();
            const stories = await historicalFiguresService.generateStories(
              category, 
              epoch, 
              language, 
              'gpt-5-mini', 
              3
            );
            const batchEndTime = Date.now();
            const batchDuration = ((batchEndTime - batchStartTime) / 1000).toFixed(1);
            
            if (stories && stories.length > 0) {
              totalGenerated += stories.length;
              console.log(`      ✅ Generated ${stories.length} stories in ${batchDuration}s`);
              
              // Show first story headline as sample
              if (stories[0]) {
                console.log(`         📖 Sample: "${stories[0].headline}"`);
              }
            } else {
              console.log(`      ⚠️ No stories generated`);
              totalErrors++;
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`      ❌ Error: ${error.message}`);
            totalErrors++;
          }
        }
      }
    }
    
    // Step 4: Final summary
    const endTime = Date.now();
    const totalDuration = ((endTime - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n📊 COMPREHENSIVE GENERATION SUMMARY');
    console.log('===============================================');
    console.log(`   ⏱️ Total time: ${totalDuration} minutes`);
    console.log(`   📈 Stories generated: ${totalGenerated}`);
    console.log(`   ❌ Errors encountered: ${totalErrors}`);
    console.log(`   🎯 Success rate: ${totalGenerated > 0 ? ((totalGenerated / (totalGenerated + totalErrors)) * 100).toFixed(1) : 0}%`);
    console.log(`   📊 Expected total: 240 stories`);
    console.log(`   📈 Completion: ${((totalGenerated / 240) * 100).toFixed(1)}%`);
    
    if (totalGenerated >= 200) {
      console.log('\n🎉 EXCELLENT: Comprehensive story generation completed!');
      console.log('   🚀 Your Orb Game now has a rich library of historical figure stories');
      console.log('   💡 Ready for frontend testing and audio generation');
    } else if (totalGenerated >= 100) {
      console.log('\n✅ GOOD: Substantial story generation completed');
      console.log('   📚 Good foundation for testing and further generation');
    } else {
      console.log('\n⚠️ PARTIAL: Some stories generated');
      console.log('   🔍 Check error messages above for troubleshooting');
    }
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('📍 Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Add process handlers
process.on('SIGINT', () => {
  console.log('\n\n🛑 Process interrupted by user');
  console.log('💡 You can resume generation later by running this script again');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Run the comprehensive generation
generateAllStoriesComprehensive().catch(console.error);
