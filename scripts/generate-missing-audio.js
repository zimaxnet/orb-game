#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

class MissingAudioGenerator {
  constructor() {
    this.client = null;
    this.db = null;
    this.storiesCollection = null;
    this.isConnected = false;
    this.azureOpenAIApiKey = null;
    this.azureOpenAIEndpoint = null;
    
    this.errorStats = {
      ttsErrors: 0,
      apiErrors: 0,
      mongoErrors: 0,
      networkErrors: 0,
      totalErrors: 0,
      successfulAudio: 0,
      failedAudio: 0
    };
  }

  async initialize() {
    console.log('🎵 Initializing Missing Audio Generator...');
    
    // Load Azure OpenAI credentials from Key Vault
    await this.loadCredentialsFromKeyVault();
    
    return await this.connect();
  }

  async loadCredentialsFromKeyVault() {
    try {
      console.log('🔐 Loading credentials from Azure Key Vault...');
      
      const credential = new DefaultAzureCredential();
      const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
      const secretClient = new SecretClient(keyVaultUrl, credential);
      
      const apiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
      
      this.azureOpenAIApiKey = apiKeySecret.value;
      this.azureOpenAIEndpoint = 'https://aimcs-foundry.cognitiveservices.azure.com/';
      
      console.log('✅ Credentials loaded from Key Vault successfully');
      
    } catch (error) {
      console.error('❌ Failed to load credentials from Key Vault:', error.message);
      throw new Error('❌ Azure Key Vault credentials not found');
    }
  }

  async connect() {
    try {
      // Load MongoDB connection from Key Vault
      const credential = new DefaultAzureCredential();
      const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
      const secretClient = new SecretClient(keyVaultUrl, credential);
      
      const mongoSecret = await secretClient.getSecret('MONGO-URI');
      const mongoUri = mongoSecret.value;

      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      
      this.db = this.client.db('orbgame');
      this.storiesCollection = this.db.collection('stories');
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    }
  }

  // Generate TTS audio using Azure OpenAI TTS
  async generateTTSAudio(text, language = 'en') {
    try {
      // Use 'alloy' for both languages since 'jorge' is not supported
      const voice = 'alloy';
      
      const response = await fetch(`${this.azureOpenAIEndpoint}openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2024-12-01-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.azureOpenAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          input: text,
          voice: voice,
          response_format: 'mp3',
          speed: 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer).toString('base64');
    } catch (error) {
      this.errorStats.ttsErrors++;
      this.errorStats.totalErrors++;
      console.warn(`⚠️ TTS generation failed: ${error.message}`);
      return null;
    }
  }

  // Update story with TTS audio
  async updateStoryWithAudio(storyId, ttsAudio) {
    if (!this.isConnected) {
      console.warn('⚠️ Not connected to MongoDB, skipping update');
      return false;
    }

    try {
      const result = await this.storiesCollection.updateOne(
        { _id: storyId },
        { 
          $set: { 
            ttsAudio: ttsAudio,
            lastUpdated: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated story ${storyId} with audio`);
        return true;
      } else {
        console.warn(`⚠️ No story found with ID ${storyId}`);
        return false;
      }
    } catch (error) {
      this.errorStats.mongoErrors++;
      this.errorStats.totalErrors++;
      console.error('❌ Failed to update story with audio:', error);
      return false;
    }
  }

  // Generate audio for stories that need it
  async generateMissingAudio() {
    console.log('🎵 Starting missing audio generation...');
    
    if (!this.isConnected) {
      console.error('❌ Not connected to MongoDB');
      return;
    }

    // Get stories without audio
    const storiesNeedingAudio = await this.storiesCollection.find({
      storyType: 'historical-figure',
      $or: [
        { ttsAudio: { $exists: false } },
        { ttsAudio: null },
        { ttsAudio: '' }
      ]
    }).toArray();

    console.log(`📊 Found ${storiesNeedingAudio.length} stories needing audio`);

    if (storiesNeedingAudio.length === 0) {
      console.log('✅ All stories already have audio!');
      return;
    }

    // Group stories by language for better progress tracking
    const storiesByLanguage = {};
    storiesNeedingAudio.forEach(story => {
      if (!storiesByLanguage[story.language]) {
        storiesByLanguage[story.language] = [];
      }
      storiesByLanguage[story.language].push(story);
    });

    console.log('\n📚 Stories by language:');
    Object.entries(storiesByLanguage).forEach(([language, stories]) => {
      console.log(`  ${language}: ${stories.length} stories`);
    });

    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;

    // Process stories by language
    for (const [language, stories] of Object.entries(storiesByLanguage)) {
      console.log(`\n🌍 Processing ${language} stories (${stories.length} stories)`);
      
      for (const story of stories) {
        processedCount++;
        console.log(`\n📝 [${processedCount}/${storiesNeedingAudio.length}] Generating audio for: ${story.headline}`);
        console.log(`   Language: ${story.language}, Category: ${story.category}, Epoch: ${story.epoch}`);
        
        try {
          // Generate TTS audio for the story text
          const ttsAudio = await this.generateTTSAudio(story.fullText, story.language);
          
          if (ttsAudio) {
            // Update the story with the audio
            const updateSuccess = await this.updateStoryWithAudio(story._id, ttsAudio);
            
            if (updateSuccess) {
              successCount++;
              this.errorStats.successfulAudio++;
              console.log(`   ✅ Audio generated successfully (${ttsAudio.length} characters)`);
            } else {
              failureCount++;
              this.errorStats.failedAudio++;
              console.log(`   ❌ Failed to update story with audio`);
            }
          } else {
            failureCount++;
            this.errorStats.failedAudio++;
            console.log(`   ❌ Failed to generate TTS audio`);
          }
          
        } catch (error) {
          failureCount++;
          this.errorStats.totalErrors++;
          console.error(`   ❌ Error processing story: ${error.message}`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n📊 Audio Generation Summary:');
    console.log(`✅ Successfully generated: ${successCount}`);
    console.log(`❌ Failed generations: ${failureCount}`);
    console.log(`📈 Success rate: ${Math.round((successCount / storiesNeedingAudio.length) * 100)}%`);
    
    console.log('\n🔍 Error Analysis:');
    console.log(`   TTS Generation Errors: ${this.errorStats.ttsErrors}`);
    console.log(`   API Errors: ${this.errorStats.apiErrors}`);
    console.log(`   MongoDB Errors: ${this.errorStats.mongoErrors}`);
    console.log(`   Network Errors: ${this.errorStats.networkErrors}`);
    console.log(`   Total Errors: ${this.errorStats.totalErrors}`);
    
    return {
      totalStories: storiesNeedingAudio.length,
      successfulAudio: successCount,
      failedAudio: failureCount,
      successRate: Math.round((successCount / storiesNeedingAudio.length) * 100),
      errorStats: this.errorStats
    };
  }
}

// Main execution
async function main() {
  const generator = new MissingAudioGenerator();
  
  try {
    console.log('🎵 Orb Game Missing Audio Generator');
    console.log('===================================');
    
    await generator.initialize();
    
    // Run missing audio generation
    const results = await generator.generateMissingAudio();
    
    if (results) {
      console.log('\n🎉 Audio generation complete!');
      console.log(`📊 Results: ${results.successfulAudio}/${results.totalStories} stories updated`);
    }
    
  } catch (error) {
    console.error('💥 Audio generation failed:', error);
    process.exit(1);
  } finally {
    await generator.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MissingAudioGenerator }; 