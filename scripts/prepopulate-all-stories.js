#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

// Import the story map and historical figures data
const storyMapData = JSON.parse(fs.readFileSync('EpochalCategoryStoryMap.md', 'utf8'));
const historicalFiguresData = JSON.parse(fs.readFileSync('OrbGameInfluentialPeopleSeeds', 'utf8'));

// Import the sophisticated prompt management system
import promptManager from '../utils/promptManager.js';

class StoryPrepopulator {
  constructor() {
    this.client = null;
    this.db = null;
    this.storiesCollection = null;
    this.isConnected = false;
    this.azureOpenAIApiKey = null;
    this.azureOpenAIEndpoint = null;
    this.azureOpenAIDeployment = null;
  }

  async initialize() {
    console.log('🚀 Initializing Story Prepopulator...');
    
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
      
      // Fetch secrets from Key Vault
      const [apiKeySecret, endpointSecret, mongoSecret] = await Promise.all([
        secretClient.getSecret('AZURE-OPENAI-API-KEY'),
        secretClient.getSecret('AZURE-OPENAI-ENDPOINT'),
        secretClient.getSecret('MONGO-URI')
      ]);
      
      this.azureOpenAIApiKey = apiKeySecret.value;
      this.azureOpenAIEndpoint = endpointSecret.value;
      this.mongoUri = mongoSecret.value;
      this.azureOpenAIDeployment = 'o4-mini';
      
      console.log('✅ Credentials loaded from Key Vault successfully');
      console.log(`   Endpoint: ${this.azureOpenAIEndpoint}`);
      console.log(`   API Key: ${this.azureOpenAIApiKey.substring(0, 8)}...`);
      console.log(`   MongoDB: ${this.mongoUri.substring(0, 20)}...`);
      
    } catch (error) {
      console.error('❌ Failed to load credentials from Key Vault:', error.message);
      throw new Error('❌ Azure Key Vault credentials not found');
    }
  }

  async connect() {
    try {
      if (!this.mongoUri) {
        throw new Error('❌ MONGO_URI not loaded from Key Vault');
      }

      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
      
      this.db = this.client.db('orbgame');
      this.storiesCollection = this.db.collection('stories');
      
      // Create indexes for efficient queries
      await this.storiesCollection.createIndex({ 
        category: 1, 
        epoch: 1, 
        model: 1, 
        language: 1 
      });
      
      await this.storiesCollection.createIndex({ 
        createdAt: 1 
      }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days TTL
      
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

  // Generate story using o4-mini with sophisticated prompt system
  async generateStoryWithO4Mini(category, epoch, storyTopic, historicalFigure = null, language = 'en') {
    try {
      let prompt;
      
      if (historicalFigure) {
        // Generate story about historical figure using sophisticated prompt system
        const basePrompt = promptManager.getFrontendPrompt(category, epoch, language, 'o4-mini');
        prompt = `${basePrompt} Focus specifically on ${historicalFigure.name} and their remarkable achievements in ${category.toLowerCase()} during ${epoch.toLowerCase()} times. ${historicalFigure.context} Make it engaging, informative, and highlight their significant contributions that shaped history. Tell the story as if you are ${historicalFigure.name} sharing their journey, discoveries, and the impact they had on the world.`;
      } else {
        // Generate story about story topic using sophisticated prompt system
        prompt = promptManager.getFrontendPrompt(category, epoch, language, 'o4-mini');
        prompt += ` Focus specifically on ${storyTopic} and its remarkable achievements or discoveries.`;
      }

      const response = await fetch(`${this.azureOpenAIEndpoint}openai/deployments/${this.azureOpenAIDeployment}/chat/completions?api-version=2024-12-01-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.azureOpenAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.azureOpenAIDeployment,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates engaging, positive news stories. Always focus on uplifting and inspiring content.'
            },
            {
              role: 'user',
              content: `${prompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "O4-Mini" }]`
            }
          ],
          max_completion_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let stories;
      try {
        stories = JSON.parse(content);
      } catch (parseError) {
        console.warn('JSON parse failed:', parseError.message);
        return [];
      }

      // Generate TTS audio for each story
      const storiesWithAudio = await Promise.all(
        stories.map(async (story) => {
          const ttsAudio = await this.generateTTSAudio(story.fullText, language);
          return {
            ...story,
            ttsAudio,
            publishedAt: new Date().toISOString()
          };
        })
      );

      return storiesWithAudio;
    } catch (error) {
      console.error(`❌ Failed to generate story for ${category}-${epoch}:`, error.message);
      return [];
    }
  }

  // Generate TTS audio using Azure OpenAI TTS
  async generateTTSAudio(text, language = 'en') {
    try {
      const voice = language === 'es' ? 'jorge' : 'alloy';
      
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
      console.warn(`⚠️ TTS generation failed:`, error.message);
      return null;
    }
  }

  // Store stories in MongoDB
  async storeStories(category, epoch, model, language, stories, storyType = 'topic') {
    if (!this.isConnected) {
      console.warn('⚠️ Not connected to MongoDB, skipping storage');
      return false;
    }

    try {
      const cacheKey = `${category}-${epoch}-${model}-${language}-${storyType}`;
      
      // Store each story with metadata
      const storiesToStore = stories.map((story, index) => ({
        cacheKey,
        category,
        epoch,
        model,
        language,
        storyType,
        storyIndex: index,
        headline: story.headline,
        summary: story.summary,
        fullText: story.fullText,
        source: story.source,
        publishedAt: story.publishedAt,
        ttsAudio: story.ttsAudio,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0
      }));

      // Remove existing stories for this combination
      await this.storiesCollection.deleteMany({ cacheKey });

      // Insert new stories
      const result = await this.storiesCollection.insertMany(storiesToStore);
      
      console.log(`✅ Stored ${stories.length} ${storyType} stories for ${category}-${epoch}-${model}-${language}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to store stories:', error);
      return false;
    }
  }

  // Prepopulate all stories for the three most important historical figures per category/epoch
  async prepopulateAllStories() {
    console.log('🎯 Starting comprehensive story prepopulation for the three most important historical figures...');
    
    // Define the 8 core categories (excluding any "Historical Figures" category)
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];
    const model = 'o4-mini';
    
    let totalStories = 0;
    let successfulStories = 0;
    let failedStories = 0;

    for (const category of categories) {
      console.log(`\n📚 Processing category: ${category}`);
      
      for (const epoch of epochs) {
        console.log(`  ⏰ Processing epoch: ${epoch}`);
        
        // Get the three most important historical figures for this category and epoch
        const historicalFigures = historicalFiguresData[category]?.[epoch] || [];
        
        if (historicalFigures.length === 0) {
          console.log(`    ⚠️ No historical figures found for ${category}-${epoch}`);
          continue;
        }
        
        console.log(`    👥 Found ${historicalFigures.length} important figures for ${category}-${epoch}`);
        
        for (const language of languages) {
          console.log(`      🌍 Processing language: ${language}`);
          
          try {
            // Generate stories for each of the three most important figures
            for (let figureIndex = 0; figureIndex < Math.min(3, historicalFigures.length); figureIndex++) {
              const figure = historicalFigures[figureIndex];
              console.log(`        👤 Generating story for ${figure.name} (${figureIndex + 1}/3)`);
              
              const stories = await this.generateStoryWithO4Mini(category, epoch, null, figure, language);
              
              if (stories.length > 0) {
                await this.storeStories(category, epoch, model, language, stories, 'historical-figure');
                successfulStories += stories.length;
                totalStories += stories.length;
              } else {
                failedStories++;
              }
              
              // Add delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
          } catch (error) {
            console.error(`❌ Failed to process ${category}-${epoch}-${language}:`, error.message);
            failedStories++;
          }
        }
      }
    }

    console.log('\n📊 Prepopulation Summary:');
    console.log(`✅ Total stories processed: ${totalStories}`);
    console.log(`✅ Successful stories: ${successfulStories}`);
    console.log(`❌ Failed stories: ${failedStories}`);
    console.log(`📈 Success rate: ${Math.round((successfulStories / totalStories) * 100)}%`);
    
    return {
      totalStories,
      successfulStories,
      failedStories,
      successRate: Math.round((successfulStories / totalStories) * 100)
    };
  }

  // Get prepopulation statistics
  async getPrepopulationStats() {
    if (!this.isConnected) {
      return null;
    }

    try {
      const stats = await this.storiesCollection.aggregate([
        {
          $group: {
            _id: {
              category: '$category',
              epoch: '$epoch',
              language: '$language',
              storyType: '$storyType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.category',
            epochs: {
              $push: {
                epoch: '$_id.epoch',
                language: '$_id.language',
                storyType: '$_id.storyType',
                count: '$count'
              }
            },
            totalCount: { $sum: '$count' }
          }
        }
      ]).toArray();

      return stats;
    } catch (error) {
      console.error('❌ Failed to get prepopulation stats:', error);
      return null;
    }
  }
}

// Main execution
async function main() {
  const prepopulator = new StoryPrepopulator();
  
  try {
    console.log('🎮 Orb Game Story Prepopulator');
    console.log('================================');
    
    await prepopulator.initialize();
    
    // Run prepopulation
    const results = await prepopulator.prepopulateAllStories();
    
    // Get and display statistics
    const stats = await prepopulator.getPrepopulationStats();
    if (stats) {
      console.log('\n📈 Prepopulation Statistics:');
      stats.forEach(category => {
        console.log(`\n${category._id}:`);
        console.log(`  Total stories: ${category.totalCount}`);
        category.epochs.forEach(epoch => {
          console.log(`    ${epoch.epoch} (${epoch.language}): ${epoch.count} ${epoch.storyType} stories`);
        });
      });
    }
    
    console.log('\n🎉 Prepopulation complete!');
    
  } catch (error) {
    console.error('💥 Prepopulation failed:', error);
    process.exit(1);
  } finally {
    await prepopulator.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { StoryPrepopulator }; 