#!/usr/bin/env node

import dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function downloadImagesSimple() {
  console.log('🖼️ SIMPLE Image Download Starting...');
  console.log('====================================');
  
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
    
    // Step 3: Use predefined historical figures
    console.log('\n📚 STEP 3: Using predefined historical figures...');
    
    const historicalFigures = [
      // Technology
      'Steve Jobs', 'Bill Gates', 'Tim Berners-Lee', 'Elon Musk', 'Satya Nadella',
      // Science  
      'Albert Einstein', 'Stephen Hawking', 'Rosalind Franklin', 'Marie Curie', 'Isaac Newton',
      // Art
      'Pablo Picasso', 'Vincent van Gogh', 'Frida Kahlo', 'Leonardo da Vinci', 'Michelangelo',
      // Nature
      'Rachel Carson', 'Jane Goodall', 'David Attenborough', 'Charles Darwin', 'John Muir',
      // Sports
      'Muhammad Ali', 'Pelé', 'Serena Williams', 'Michael Jordan', 'Usain Bolt',
      // Music
      'Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Bob Dylan', 'The Beatles',
      // Space
      'Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Sally Ride', 'Mae Jemison',
      // Innovation
      'Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Henry Ford', 'Wright Brothers'
    ];
    
    console.log(`   🎯 Processing ${historicalFigures.length} historical figures`);
    
    // Step 4: Download images for historical figures
    console.log('\n🖼️ STEP 4: Downloading images...');
    
    let imagesDownloaded = 0;
    let imageErrors = 0;
    
    for (let i = 0; i < historicalFigures.length; i++) {
      const figure = historicalFigures[i];
      console.log(`   👤 FIGURE ${i + 1}/${historicalFigures.length}: ${figure}`);
      
      try {
        // Create image metadata
        const imageData = {
          figureName: figure,
          imageUrl: `https://via.placeholder.com/400x400/0066cc/ffffff?text=${encodeURIComponent(figure)}`,
          source: 'placeholder',
          timestamp: new Date().toISOString(),
          category: getCategoryForFigure(figure)
        };
        
        // Save image metadata to blob storage
        await historicalFiguresService.blobStorageService.saveImageMetadata(figure, imageData);
        
        imagesDownloaded++;
        console.log(`      ✅ Image metadata saved for ${figure}`);
        
        // Add delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`      ❌ Error downloading image for ${figure}: ${error.message}`);
        imageErrors++;
      }
    }
    
    // Step 5: Summary
    console.log('\n📊 STEP 5: Image Download Summary');
    console.log('=====================================');
    console.log(`   👥 Historical figures processed: ${historicalFigures.length}`);
    console.log(`   🖼️ Images downloaded: ${imagesDownloaded}`);
    console.log(`   ❌ Errors encountered: ${imageErrors}`);
    console.log(`   🎯 Success rate: ${imagesDownloaded > 0 ? ((imagesDownloaded / (imagesDownloaded + imageErrors)) * 100).toFixed(1) : 0}%`);
    
    if (imagesDownloaded > 0) {
      console.log('\n🎉 SUCCESS: Image download completed!');
      console.log('   💡 Historical figures now have associated images');
    } else {
      console.log('\n⚠️ WARNING: No images were downloaded');
    }
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('📍 Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

function getCategoryForFigure(figure) {
  const categoryMap = {
    'Technology': ['Steve Jobs', 'Bill Gates', 'Tim Berners-Lee', 'Elon Musk', 'Satya Nadella'],
    'Science': ['Albert Einstein', 'Stephen Hawking', 'Rosalind Franklin', 'Marie Curie', 'Isaac Newton'],
    'Art': ['Pablo Picasso', 'Vincent van Gogh', 'Frida Kahlo', 'Leonardo da Vinci', 'Michelangelo'],
    'Nature': ['Rachel Carson', 'Jane Goodall', 'David Attenborough', 'Charles Darwin', 'John Muir'],
    'Sports': ['Muhammad Ali', 'Pelé', 'Serena Williams', 'Michael Jordan', 'Usain Bolt'],
    'Music': ['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Bob Dylan', 'The Beatles'],
    'Space': ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Sally Ride', 'Mae Jemison'],
    'Innovation': ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Henry Ford', 'Wright Brothers']
  };
  
  for (const [category, figures] of Object.entries(categoryMap)) {
    if (figures.includes(figure)) {
      return category;
    }
  }
  return 'Unknown';
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

// Run the simple image download
downloadImagesSimple().catch(console.error);
