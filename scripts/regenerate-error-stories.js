#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import fs from 'fs';
import promptManager from '../utils/promptManager.js';

// Import the historical figures data
const historicalFiguresData = JSON.parse(fs.readFileSync('OrbGameInfluentialPeopleSeeds', 'utf8'));

class ErrorStoryRegenerator {
  constructor() {
    this.client = null;
    this.db = null;
    this.storiesCollection = null;
    this.isConnected = false;
    this.azureOpenAIApiKey = null;
    this.azureOpenAIEndpoint = null;
    this.azureOpenAIDeployment = null;
    
    // Track regeneration attempts
    this.regenerationStats = {
      attempted: 0,
      successful: 0,
      failed: 0,
      errors: {
        jsonParseErrors: 0,
        ttsErrors: 0,
        apiErrors: 0,
        mongoErrors: 0,
        networkErrors: 0
      }
    };
  }

  async initialize() {
    console.log('🚀 Initializing Error Story Regenerator...');
    
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
      const [apiKeySecret, mongoSecret] = await Promise.all([
        secretClient.getSecret('AZURE-OPENAI-API-KEY'),
        secretClient.getSecret('MONGO-URI')
      ]);
      
      this.azureOpenAIApiKey = apiKeySecret.value;
      this.azureOpenAIEndpoint = 'https://aimcs-foundry.cognitiveservices.azure.com/';
      this.mongoUri = mongoSecret.value;
      this.azureOpenAIDeployment = 'o4-mini';
      
      console.log('✅ Credentials loaded from Key Vault successfully');
      
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

  // Find stories that need regeneration (missing TTS audio or empty content)
  async findStoriesNeedingRegeneration() {
    if (!this.isConnected) return [];
    
    try {
      // Find stories with missing TTS audio
      const storiesWithoutAudio = await this.storiesCollection.find({
        storyType: 'historical-figure',
        $or: [
          { ttsAudio: { $exists: false } },
          { ttsAudio: null },
          { ttsAudio: '' }
        ]
      }).toArray();

      // Find stories with empty or missing content
      const storiesWithEmptyContent = await this.storiesCollection.find({
        storyType: 'historical-figure',
        $or: [
          { fullText: { $exists: false } },
          { fullText: null },
          { fullText: '' },
          { headline: { $exists: false } },
          { headline: null },
          { headline: '' }
        ]
      }).toArray();

      // Find stories with duplicate cache keys (indicating insertion errors)
      const duplicateStories = await this.storiesCollection.aggregate([
        {
          $match: { storyType: 'historical-figure' }
        },
        {
          $group: {
            _id: '$cacheKey',
            count: { $sum: 1 },
            stories: { $push: '$$ROOT' }
          }
        },
        {
          $match: { count: { $gt: 1 } }
        }
      ]).toArray();

      const allStoriesNeedingRegeneration = [
        ...storiesWithoutAudio,
        ...storiesWithEmptyContent,
        ...duplicateStories.flatMap(group => group.stories)
      ];

      // Remove duplicates based on _id
      const uniqueStories = allStoriesNeedingRegeneration.filter((story, index, self) => 
        index === self.findIndex(s => s._id.toString() === story._id.toString())
      );

      console.log(`🔍 Found ${uniqueStories.length} stories needing regeneration:`);
      console.log(`   - ${storiesWithoutAudio.length} missing TTS audio`);
      console.log(`   - ${storiesWithEmptyContent.length} with empty content`);
      console.log(`   - ${duplicateStories.length} duplicate cache keys`);

      return uniqueStories;
    } catch (error) {
      console.error('❌ Error finding stories needing regeneration:', error);
      return [];
    }
  }

  // Delete stories that need regeneration
  async deleteStoriesForRegeneration(stories) {
    if (!this.isConnected || stories.length === 0) return 0;
    
    try {
      const storyIds = stories.map(story => story._id);
      const result = await this.storiesCollection.deleteMany({
        _id: { $in: storyIds }
      });
      
      console.log(`🗑️ Deleted ${result.deletedCount} stories for regeneration`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error deleting stories for regeneration:', error);
      return 0;
    }
  }

  // Generate story using o4-mini with sophisticated prompt system
  async generateStoryWithO4Mini(category, epoch, historicalFigure, language = 'en') {
    try {
      // Generate story about historical figure using sophisticated prompt system
      const basePrompt = promptManager.getFrontendPrompt(category, epoch, language, 'o4-mini');
      const prompt = `${basePrompt} Focus specifically on ${historicalFigure.name} and their remarkable achievements in ${category.toLowerCase()} during ${epoch.toLowerCase()} times. ${historicalFigure.context} Make it engaging, informative, and highlight their significant contributions that shaped history. Tell the story as if you are ${historicalFigure.name} sharing their journey, discoveries, and the impact they had on the world.`;

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
              content: 'You are a helpful assistant that creates engaging, positive news stories. Always focus on uplifting and inspiring content. You MUST return valid JSON only.'
            },
            {
              role: 'user',
              content: `${prompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "O4-Mini" }]`
            }
          ],
          max_completion_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Check for empty content
      if (!content || content.trim() === '') {
        console.warn('⚠️ API returned empty content');
        this.regenerationStats.errors.jsonParseErrors++;
        return [];
      }
      
      let stories;
      try {
        stories = JSON.parse(content);
      } catch (parseError) {
        this.regenerationStats.errors.jsonParseErrors++;
        console.warn(`JSON parse failed: ${parseError.message}`);
        console.warn(`Content preview: ${content.substring(0, 100)}...`);
        
        // Try to fix common JSON issues
        const fixedContent = this.attemptJSONFix(content);
        if (fixedContent) {
          try {
            stories = JSON.parse(fixedContent);
            console.log('✅ JSON fixed and parsed successfully!');
          } catch (secondError) {
            console.warn(`JSON fix also failed: ${secondError.message}`);
            return [];
          }
        } else {
          return [];
        }
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
      this.regenerationStats.errors.totalErrors++;
      
      if (error.message.includes('API error')) {
        this.regenerationStats.errors.apiErrors++;
      } else if (error.message.includes('fetch failed')) {
        this.regenerationStats.errors.networkErrors++;
      }
      
      console.error(`❌ Failed to generate story for ${category}-${epoch}: ${error.message}`);
      return [];
    }
  }

  // Attempt to fix common JSON parsing issues
  attemptJSONFix(content) {
    // Remove any text before the first [
    let fixed = content.replace(/^[^[]*/, '');
    
    // Remove any text after the last ]
    fixed = fixed.replace(/[^]*$/, '');
    
    // Fix common issues
    fixed = fixed.replace(/,\s*]/g, ']'); // Remove trailing commas
    fixed = fixed.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
    fixed = fixed.replace(/\\"/g, '"'); // Fix escaped quotes
    fixed = fixed.replace(/\\n/g, ' '); // Replace newlines with spaces
    fixed = fixed.replace(/\\t/g, ' '); // Replace tabs with spaces
    
    return fixed;
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
      this.regenerationStats.errors.ttsErrors++;
      console.warn(`⚠️ TTS generation failed: ${error.message}`);
      return null;
    }
  }

  // Store stories in MongoDB with rate limiting protection
  async storeStories(category, epoch, model, language, stories, storyType = 'historical-figure') {
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

      // Use batch insert with retry logic for rate limiting
      const result = await this.batchInsertWithRetry(storiesToStore);
      
      console.log(`✅ Stored ${stories.length} ${storyType} stories for ${category}-${epoch}-${model}-${language}`);
      return true;
    } catch (error) {
      this.regenerationStats.errors.mongoErrors++;
      console.error('❌ Failed to store stories:', error);
      return false;
    }
  }

  // Batch insert with retry logic for rate limiting
  async batchInsertWithRetry(documents, batchSize = 3, maxRetries = 5) {
    const results = [];
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await this.storiesCollection.insertMany(batch);
          results.push(result);
          
          // Success - add delay between batches
          if (i + batchSize < documents.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          break; // Success, exit retry loop
          
        } catch (error) {
          if (error.code === 16500 && attempt < maxRetries - 1) {
            // Rate limit error - exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
            console.log(`⚠️ MongoDB rate limited, retrying batch in ${delay}ms (attempt ${attempt + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error; // Non-rate-limit error or max retries exceeded
          }
        }
      }
    }
    
    return results;
  }

  // Regenerate stories that had errors
  async regenerateErrorStories() {
    console.log('🔄 Starting regeneration of error stories...');
    
    // Find stories that need regeneration
    const storiesNeedingRegeneration = await this.findStoriesNeedingRegeneration();
    
    if (storiesNeedingRegeneration.length === 0) {
      console.log('✅ No stories need regeneration!');
      return { attempted: 0, successful: 0, failed: 0 };
    }

    // Delete the problematic stories
    const deletedCount = await this.deleteStoriesForRegeneration(storiesNeedingRegeneration);
    
    // Group stories by category, epoch, and language for regeneration
    const regenerationGroups = {};
    
    for (const story of storiesNeedingRegeneration) {
      const key = `${story.category}-${story.epoch}-${story.language}`;
      if (!regenerationGroups[key]) {
        regenerationGroups[key] = {
          category: story.category,
          epoch: story.epoch,
          language: story.language,
          count: 0
        };
      }
      regenerationGroups[key].count++;
    }

    console.log(`\n🔄 Regenerating ${Object.keys(regenerationGroups).length} story groups...`);

    let successfulRegenerations = 0;
    let failedRegenerations = 0;

    for (const [key, group] of Object.entries(regenerationGroups)) {
      console.log(`\n📚 Regenerating ${group.category}-${group.epoch}-${group.language} (${group.count} stories needed)`);
      
      // Get historical figures for this category and epoch
      const historicalFigures = historicalFiguresData[group.category]?.[group.epoch] || [];
      
      if (historicalFigures.length === 0) {
        console.log(`    ⚠️ No historical figures found for ${group.category}-${group.epoch}`);
        failedRegenerations++;
        continue;
      }

      // Generate stories for each historical figure (up to the count needed)
      for (let i = 0; i < Math.min(group.count, historicalFigures.length); i++) {
        const figure = historicalFigures[i];
        console.log(`    👤 Regenerating story for ${figure.name} (${i + 1}/${group.count})`);
        
        this.regenerationStats.attempted++;
        
        const stories = await this.generateStoryWithO4Mini(group.category, group.epoch, figure, group.language);
        
        if (stories.length > 0) {
          const stored = await this.storeStories(group.category, group.epoch, 'o4-mini', group.language, stories, 'historical-figure');
          if (stored) {
            successfulRegenerations++;
            this.regenerationStats.successful++;
          } else {
            failedRegenerations++;
            this.regenerationStats.failed++;
          }
        } else {
          failedRegenerations++;
          this.regenerationStats.failed++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n📊 Error Story Regeneration Summary:');
    console.log(`🔄 Attempted regenerations: ${this.regenerationStats.attempted}`);
    console.log(`✅ Successful regenerations: ${successfulRegenerations}`);
    console.log(`❌ Failed regenerations: ${failedRegenerations}`);
    console.log(`📈 Success rate: ${Math.round((successfulRegenerations / this.regenerationStats.attempted) * 100)}%`);
    
    console.log('\n🔍 Error Analysis:');
    console.log(`   JSON Parse Errors: ${this.regenerationStats.errors.jsonParseErrors}`);
    console.log(`   TTS Generation Errors: ${this.regenerationStats.errors.ttsErrors}`);
    console.log(`   API Errors: ${this.regenerationStats.errors.apiErrors}`);
    console.log(`   MongoDB Errors: ${this.regenerationStats.errors.mongoErrors}`);
    console.log(`   Network Errors: ${this.regenerationStats.errors.networkErrors}`);
    
    return {
      attempted: this.regenerationStats.attempted,
      successful: successfulRegenerations,
      failed: failedRegenerations,
      successRate: Math.round((successfulRegenerations / this.regenerationStats.attempted) * 100),
      errorStats: this.regenerationStats.errors
    };
  }
}

// Main execution
async function main() {
  const regenerator = new ErrorStoryRegenerator();
  
  try {
    console.log('🎮 Orb Game Error Story Regenerator');
    console.log('===================================');
    
    await regenerator.initialize();
    
    // Run error story regeneration
    const results = await regenerator.regenerateErrorStories();
    
    console.log('\n🎉 Error story regeneration complete!');
    
  } catch (error) {
    console.error('💥 Error story regeneration failed:', error);
    process.exit(1);
  } finally {
    await regenerator.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ErrorStoryRegenerator }; 