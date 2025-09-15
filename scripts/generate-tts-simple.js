#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function generateTTSSimple() {
  console.log('🎵 SIMPLE TTS Audio Generation Starting...');
  console.log('===========================================');
  
  try {
    // Step 1: Load credentials
    console.log('\n🔐 STEP 1: Loading credentials...');
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const azureOpenAIApiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
    process.env.AZURE_OPENAI_API_KEY = azureOpenAIApiKeySecret.value;
    process.env.AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-5-mini';
    console.log('✅ Credentials loaded');
    
    // Step 2: Initialize services
    console.log('\n🔧 STEP 2: Initializing services...');
    const HistoricalFiguresServiceBlob = (await import('../backend/historical-figures-service-blob.js')).default;
    const historicalFiguresService = new HistoricalFiguresServiceBlob();
    await historicalFiguresService.initialize();
    console.log('✅ Services initialized');
    
    // Step 3: Generate TTS for specific combinations first
    console.log('\n🎵 STEP 3: Generating TTS audio for key combinations...');
    
    // Start with the most important combinations
    const priorityCombinations = [
      { category: 'Technology', epoch: 'Modern', language: 'en' },
      { category: 'Science', epoch: 'Modern', language: 'en' },
      { category: 'Art', epoch: 'Modern', language: 'en' },
      { category: 'Technology', epoch: 'Modern', language: 'es' },
      { category: 'Science', epoch: 'Modern', language: 'es' }
    ];
    
    let totalAudioGenerated = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < priorityCombinations.length; i++) {
      const { category, epoch, language } = priorityCombinations[i];
      console.log(`\n   🎯 COMBINATION ${i + 1}/${priorityCombinations.length}: ${category}/${epoch}/${language}`);
      
      try {
        // Get existing stories from blob storage
        const stories = await historicalFiguresService.blobStorageService.getStories(category, epoch, language, 'gpt-5-mini');
        
        if (stories && stories.length > 0) {
          console.log(`      📚 Found ${stories.length} stories to process`);
          
          for (let s = 0; s < stories.length; s++) {
            const story = stories[s];
            console.log(`         🎭 Story ${s + 1}: ${story.headline}`);
            
            try {
              const storyText = story.story || story.fullText || '';
              if (storyText.length > 0) {
                console.log(`         🎵 Generating audio (${storyText.length} chars)...`);
                
                const audioBuffer = await historicalFiguresService.generateAudio({ story: storyText, language: language });
                
                if (audioBuffer) {
                  // Save audio to blob storage
                  await historicalFiguresService.blobStorageService.saveAudio(category, epoch, language, 'gpt-5-mini', audioBuffer);
                  totalAudioGenerated++;
                  console.log(`         ✅ Audio generated and saved`);
                } else {
                  console.log(`         ⚠️ No audio generated`);
                  totalErrors++;
                }
              } else {
                console.log(`         ⚠️ No story text found`);
                totalErrors++;
              }
              
              // Add delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 2000));
              
            } catch (error) {
              console.error(`         ❌ Error generating audio: ${error.message}`);
              totalErrors++;
            }
          }
        } else {
          console.log(`      ⚠️ No stories found - may still be generating`);
          
          // Try to generate a sample story to test TTS
          console.log(`      🎭 Generating sample story to test TTS...`);
          try {
            const sampleStories = await historicalFiguresService.generateStories(category, epoch, language, 'gpt-5-mini', 1);
            
            if (sampleStories && sampleStories.length > 0) {
              const story = sampleStories[0];
              const storyText = story.story || story.fullText || '';
              
              if (storyText.length > 0) {
                console.log(`      🎵 Testing TTS with sample story...`);
                const audioBuffer = await historicalFiguresService.generateAudio({ story: storyText, language: language });
                
                if (audioBuffer) {
                  await historicalFiguresService.blobStorageService.saveAudio(category, epoch, language, 'gpt-5-mini', audioBuffer);
                  totalAudioGenerated++;
                  console.log(`      ✅ Sample TTS audio generated and saved`);
                } else {
                  console.log(`      ⚠️ No sample audio generated`);
                  totalErrors++;
                }
              }
            }
          } catch (error) {
            console.error(`      ❌ Error generating sample: ${error.message}`);
            totalErrors++;
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing ${category}/${epoch}/${language}: ${error.message}`);
        totalErrors++;
      }
    }
    
    // Step 4: Summary
    console.log('\n📊 TTS GENERATION SUMMARY');
    console.log('==========================');
    console.log(`   🎵 Audio files generated: ${totalAudioGenerated}`);
    console.log(`   ❌ Errors encountered: ${totalErrors}`);
    console.log(`   🎯 Success rate: ${totalAudioGenerated > 0 ? ((totalAudioGenerated / (totalAudioGenerated + totalErrors)) * 100).toFixed(1) : 0}%`);
    
    if (totalAudioGenerated > 0) {
      console.log('\n🎉 SUCCESS: TTS audio generation completed!');
      console.log('   🎵 Your Orb Game now has audio narration');
      console.log('   💡 Ready for frontend testing with audio');
    } else {
      console.log('\n⚠️ WARNING: No audio was generated');
      console.log('   🔍 Check the error messages above for troubleshooting');
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
  console.log('\n\n🛑 TTS generation interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Run the simple TTS generation
generateTTSSimple().catch(console.error);
