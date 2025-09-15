#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function generateTTSAudio() {
  console.log('🎵 TTS Audio Generation Starting...');
  console.log('====================================');
  console.log('🎯 Target: Generate audio for all historical figure stories');
  console.log('⏱️ Estimated time: ~30-45 minutes');
  console.log('====================================\n');
  
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
    
    // Step 3: Generate TTS audio for all stories
    console.log('🎵 STEP 3: Generating TTS audio for stories...');
    
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    let totalStoriesProcessed = 0;
    let totalAudioGenerated = 0;
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
            // Get existing stories from blob storage
            const stories = await historicalFiguresService.blobStorageService.getStories(category, epoch, language, 'gpt-5-mini');
            
            if (stories && stories.length > 0) {
              console.log(`      📚 Found ${stories.length} stories to process`);
              totalStoriesProcessed += stories.length;
              
              for (let s = 0; s < stories.length; s++) {
                const story = stories[s];
                console.log(`         🎭 Story ${s + 1}/${stories.length}: ${story.headline}`);
                
                try {
                  // Generate TTS audio for the story
                  const storyText = story.story || story.fullText || '';
                  if (storyText.length > 0) {
                    console.log(`         🎵 Generating audio (${storyText.length} chars)...`);
                    
                    const audioStartTime = Date.now();
                    const audioBuffer = await historicalFiguresService.generateTTSAudio(storyText, language);
                    const audioEndTime = Date.now();
                    const audioDuration = ((audioEndTime - audioStartTime) / 1000).toFixed(1);
                    
                    if (audioBuffer) {
                      // Save audio to blob storage
                      await historicalFiguresService.blobStorageService.saveAudio(category, epoch, language, 'gpt-5-mini', audioBuffer);
                      totalAudioGenerated++;
                      console.log(`         ✅ Audio generated and saved in ${audioDuration}s`);
                    } else {
                      console.log(`         ⚠️ No audio generated`);
                      totalErrors++;
                    }
                  } else {
                    console.log(`         ⚠️ No story text found`);
                    totalErrors++;
                  }
                  
                  // Add delay to avoid rate limiting
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                } catch (error) {
                  console.error(`         ❌ Error generating audio: ${error.message}`);
                  totalErrors++;
                }
              }
            } else {
              console.log(`      ⚠️ No stories found for ${category}/${epoch}/${language}`);
            }
            
          } catch (error) {
            console.error(`      ❌ Error processing ${category}/${epoch}/${language}: ${error.message}`);
            totalErrors++;
          }
        }
      }
    }
    
    // Step 4: Final summary
    const endTime = Date.now();
    const totalDuration = ((endTime - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n📊 TTS AUDIO GENERATION SUMMARY');
    console.log('=====================================');
    console.log(`   ⏱️ Total time: ${totalDuration} minutes`);
    console.log(`   📚 Stories processed: ${totalStoriesProcessed}`);
    console.log(`   🎵 Audio files generated: ${totalAudioGenerated}`);
    console.log(`   ❌ Errors encountered: ${totalErrors}`);
    console.log(`   🎯 Success rate: ${totalStoriesProcessed > 0 ? ((totalAudioGenerated / (totalStoriesProcessed + totalErrors)) * 100).toFixed(1) : 0}%`);
    
    if (totalAudioGenerated >= totalStoriesProcessed * 0.8) {
      console.log('\n🎉 EXCELLENT: TTS audio generation completed!');
      console.log('   🎵 Your Orb Game now has audio narration for most stories');
      console.log('   💡 Ready for frontend testing with full audio experience');
    } else if (totalAudioGenerated >= totalStoriesProcessed * 0.5) {
      console.log('\n✅ GOOD: Substantial TTS audio generation completed');
      console.log('   🎵 Good audio coverage for testing and further generation');
    } else {
      console.log('\n⚠️ PARTIAL: Some audio generated');
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
  console.log('\n\n🛑 TTS generation interrupted by user');
  console.log('💡 You can resume generation later by running this script again');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Run the TTS generation
generateTTSAudio().catch(console.error);
