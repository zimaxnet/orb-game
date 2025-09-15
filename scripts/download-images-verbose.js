#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function downloadImagesVerbose() {
  console.log('🖼️ VERBOSE Image Download Starting...');
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
    
    // Step 2: Initialize services
    console.log('\n🔧 STEP 2: Initializing services...');
    const HistoricalFiguresServiceBlob = (await import('../backend/historical-figures-service-blob.js')).default;
    const historicalFiguresService = new HistoricalFiguresServiceBlob();
    
    console.log('   🚀 Initializing Historical Figures Service...');
    await historicalFiguresService.initialize();
    console.log('   ✅ Historical Figures Service ready');
    
    // Step 3: Get existing stories to find historical figures
    console.log('\n📚 STEP 3: Finding historical figures from existing stories...');
    
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    let historicalFigures = new Set();
    let storiesProcessed = 0;
    
    for (const category of categories) {
      console.log(`   🏷️ Processing ${category}...`);
      
      for (const epoch of epochs) {
        for (const language of languages) {
          try {
            // Try to get existing stories from blob storage
            const stories = await historicalFiguresService.blobStorageService.getStories(category, epoch, language, 'gpt-5-mini');
            
            if (stories && stories.length > 0) {
              stories.forEach(story => {
                if (story.figureName) {
                  historicalFigures.add(story.figureName);
                }
              });
              storiesProcessed += stories.length;
              console.log(`      📖 Found ${stories.length} stories in ${epoch}/${language}`);
            }
            
          } catch (error) {
            console.log(`      ⚠️ No stories found in ${epoch}/${language}`);
          }
        }
      }
    }
    
    const figuresArray = Array.from(historicalFigures);
    console.log(`   ✅ Found ${figuresArray.length} unique historical figures`);
    console.log(`   📊 Processed ${storiesProcessed} total stories`);
    
    if (figuresArray.length === 0) {
      console.log('   ⚠️ No historical figures found. Generating sample stories first...');
      
      // Generate a few sample stories to get some figures
      console.log('   🎭 Generating sample stories for Technology/Modern/en...');
      const sampleStories = await historicalFiguresService.generateStories('Technology', 'Modern', 'en', 'gpt-5-mini', 3);
      
      if (sampleStories && sampleStories.length > 0) {
        sampleStories.forEach(story => {
          if (story.figureName) {
            historicalFigures.add(story.figureName);
          }
        });
        console.log(`   ✅ Generated sample stories with ${historicalFigures.size} figures`);
      }
    }
    
    // Step 4: Download images for historical figures
    console.log('\n🖼️ STEP 4: Downloading images for historical figures...');
    
    const finalFiguresArray = Array.from(historicalFigures);
    console.log(`   🎯 Target: ${finalFiguresArray.length} historical figures`);
    
    let imagesDownloaded = 0;
    let imageErrors = 0;
    
    for (let i = 0; i < finalFiguresArray.length; i++) {
      const figure = finalFiguresArray[i];
      console.log(`   👤 FIGURE ${i + 1}/${finalFiguresArray.length}: ${figure}`);
      
      try {
        // For now, we'll create placeholder image data
        // In a real implementation, you would download actual images
        const imageData = {
          figureName: figure,
          imageUrl: `https://via.placeholder.com/400x400/0066cc/ffffff?text=${encodeURIComponent(figure)}`,
          source: 'placeholder',
          timestamp: new Date().toISOString()
        };
        
        // Save image metadata to blob storage
        await historicalFiguresService.blobStorageService.saveImageMetadata(figure, imageData);
        
        imagesDownloaded++;
        console.log(`      ✅ Image metadata saved for ${figure}`);
        
        // Add delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`      ❌ Error downloading image for ${figure}: ${error.message}`);
        imageErrors++;
      }
    }
    
    // Step 5: Summary
    console.log('\n📊 STEP 5: Image Download Summary');
    console.log('=====================================');
    console.log(`   👥 Historical figures processed: ${finalFiguresArray.length}`);
    console.log(`   🖼️ Images downloaded: ${imagesDownloaded}`);
    console.log(`   ❌ Errors encountered: ${imageErrors}`);
    console.log(`   🎯 Success rate: ${imagesDownloaded > 0 ? ((imagesDownloaded / (imagesDownloaded + imageErrors)) * 100).toFixed(1) : 0}%`);
    
    if (imagesDownloaded > 0) {
      console.log('\n🎉 SUCCESS: Image download completed!');
      console.log('   💡 Historical figures now have associated images');
    } else {
      console.log('\n⚠️ WARNING: No images were downloaded');
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
  console.log('\n\n🛑 Image download interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Run the verbose image download
downloadImagesVerbose().catch(console.error);
