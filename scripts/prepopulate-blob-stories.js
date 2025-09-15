#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

// Import the historical figures data
const historicalFiguresData = JSON.parse(fs.readFileSync('OrbGameInfluentialPeopleSeeds', 'utf8'));

// Import the sophisticated prompt management system
import promptManager from '../utils/promptManager.js';
import BlobStorageService from '../backend/blob-storage-service.js';
import HistoricalFiguresServiceBlob from '../backend/historical-figures-service-blob.js';

class BlobStoryPrepopulator {
  constructor() {
    this.blobService = null;
    this.historicalFiguresService = null;
    this.isInitialized = false;
    this.azureOpenAIApiKey = null;
    this.azureOpenAIEndpoint = null;
    
    // Enhanced error tracking
    this.errorStats = {
      jsonParseErrors: 0,
      ttsErrors: 0,
      apiErrors: 0,
      blobErrors: 0,
      networkErrors: 0,
      totalErrors: 0
    };
  }

  async initialize() {
    console.log('🚀 Initializing Blob Story Prepopulator...');
    
    // Load Azure OpenAI credentials from Key Vault
    await this.loadCredentialsFromKeyVault();
    
    // Initialize blob storage service
    this.blobService = new BlobStorageService();
    await this.blobService.initialize();
    
    // Initialize historical figures service
    this.historicalFiguresService = new HistoricalFiguresServiceBlob();
    await this.historicalFiguresService.initialize();
    
    this.isInitialized = true;
    console.log('✅ Blob Story Prepopulator initialized successfully');
  }

  async loadCredentialsFromKeyVault() {
    try {
      console.log('🔐 Loading credentials from Azure Key Vault...');
      
      const credential = new DefaultAzureCredential();
      const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
      const secretClient = new SecretClient(keyVaultUrl, credential);
      
      // Load Azure OpenAI API key
      const azureOpenAIApiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
      this.azureOpenAIApiKey = azureOpenAIApiKeySecret.value;
      
      // Set environment variables for the services
      process.env.AZURE_OPENAI_API_KEY = this.azureOpenAIApiKey;
      process.env.AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
      process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-5-mini';
      
      console.log('✅ Credentials loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load credentials from Key Vault:', error.message);
      throw error;
    }
  }

  async prepopulateStories() {
    if (!this.isInitialized) {
      throw new Error('Prepopulator not initialized');
    }

    console.log('🎯 Starting story prepopulation...');
    
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    let totalStories = 0;
    let successCount = 0;
    
    for (const category of categories) {
      for (const epoch of epochs) {
        for (const language of languages) {
          try {
            console.log(`\n📚 Processing: ${category}/${epoch}/${language}`);
            
            // Generate stories for this combination
            const stories = await this.historicalFiguresService.generateStories(
              category, 
              epoch, 
              language, 
              'gpt-5-mini', 
              3 // Generate 3 stories per combination
            );
            
            if (stories && stories.length > 0) {
              successCount += stories.length;
              console.log(`✅ Generated ${stories.length} stories for ${category}/${epoch}/${language}`);
            } else {
              console.log(`⚠️ No stories generated for ${category}/${epoch}/${language}`);
            }
            
            totalStories += 3; // Expected stories
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`❌ Error processing ${category}/${epoch}/${language}:`, error.message);
            this.errorStats.blobErrors++;
            this.errorStats.totalErrors++;
          }
        }
      }
    }
    
    console.log(`\n📊 Prepopulation Summary:`);
    console.log(`   Total expected: ${totalStories}`);
    console.log(`   Successfully generated: ${successCount}`);
    console.log(`   Success rate: ${((successCount / totalStories) * 100).toFixed(1)}%`);
    console.log(`   Errors: ${this.errorStats.totalErrors}`);
  }

  async generateAudioForStories() {
    console.log('🎵 Starting audio generation for stories...');
    
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    
    let audioGenerated = 0;
    let audioErrors = 0;
    
    for (const category of categories) {
      for (const epoch of epochs) {
        for (const language of languages) {
          try {
            // Get existing stories from blob storage
            const stories = await this.blobService.getStories(category, epoch, language, 'gpt-5-mini');
            
            if (stories && stories.length > 0) {
              console.log(`🎵 Processing audio for ${stories.length} stories in ${category}/${epoch}/${language}`);
              
              for (const story of stories) {
                try {
                  // Generate TTS audio for the story
                  const audioBuffer = await this.historicalFiguresService.generateTTSAudio(
                    story.story || story.fullText, 
                    language
                  );
                  
                  if (audioBuffer) {
                    // Save audio to blob storage
                    await this.blobService.saveAudio(category, epoch, language, 'gpt-5-mini', audioBuffer);
                    audioGenerated++;
                  }
                  
                  // Small delay to avoid rate limiting
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                } catch (error) {
                  console.error(`❌ Audio generation error for story:`, error.message);
                  audioErrors++;
                }
              }
            }
            
          } catch (error) {
            console.error(`❌ Error processing audio for ${category}/${epoch}/${language}:`, error.message);
            audioErrors++;
          }
        }
      }
    }
    
    console.log(`\n🎵 Audio Generation Summary:`);
    console.log(`   Audio files generated: ${audioGenerated}`);
    console.log(`   Audio errors: ${audioErrors}`);
  }
}

// Main execution
async function main() {
  const prepopulator = new BlobStoryPrepopulator();
  
  try {
    await prepopulator.initialize();
    
    // Generate stories
    await prepopulator.prepopulateStories();
    
    // Generate audio for stories
    await prepopulator.generateAudioForStories();
    
    console.log('\n🎉 Story prepopulation completed successfully!');
    
  } catch (error) {
    console.error('❌ Prepopulation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BlobStoryPrepopulator;
