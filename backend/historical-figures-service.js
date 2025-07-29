import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

class HistoricalFigureStory {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.category = data.category || '';
    this.epoch = data.epoch || 'Modern';
    this.language = data.language || 'en';
    this.headline = data.headline || '';
    this.summary = data.summary || '';
    this.fullText = data.fullText || '';
    this.source = data.source || 'o4-mini';
    this.historicalFigure = data.historicalFigure || '';
    this.storyType = data.storyType || 'historical-figure';
    this.publishedAt = data.publishedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastUsed = data.lastUsed || null;
    this.useCount = data.useCount || 0;
    this.ttsAudio = data.ttsAudio || null; // base64 encoded audio
    this.ttsGeneratedAt = data.ttsGeneratedAt || null;
  }
}

class HistoricalFiguresService {
  constructor(mongoUri, dbName = 'orbgame') {
    this.mongoUri = mongoUri;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
    this.stories = null;
    this.seedData = null;
    this.categories = [
      'Technology', 'Science', 'Art', 'Nature', 'Sports',
      'Music', 'Space', 'Innovation'
    ];
    this.epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    this.languages = ['en', 'es'];
  }

  async initialize() {
    try {
      this.client = new MongoClient(this.mongoUri, {
        tls: true,
        tlsAllowInvalidCertificates: false,
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.stories = this.db.collection('historical_figures_stories');
      
      // Create indexes for efficient querying
      await this.stories.createIndex({ category: 1, epoch: 1, language: 1 });
      await this.stories.createIndex({ historicalFigure: 1 });
      await this.stories.createIndex({ lastUsed: 1 });
      await this.stories.createIndex({ createdAt: 1 });
      await this.stories.createIndex({ storyType: 1 });
      
      console.log('✅ Historical Figures Service initialized successfully');
      
      // Load seed data
      await this.loadSeedData();
      
      // Ensure all categories have content
      await this.ensureAllCategoriesHaveContent();
      
    } catch (error) {
      console.error('❌ Historical Figures Service initialization failed:', error.message);
      throw error;
    }
  }

  async loadSeedData() {
    try {
      // Try multiple possible paths for the seed file
      const possiblePaths = [
        path.join(process.cwd(), 'OrbGameInfluentialPeopleSeeds'),
        path.join(process.cwd(), '..', 'OrbGameInfluentialPeopleSeeds'),
        path.join(process.cwd(), '..', '..', 'OrbGameInfluentialPeopleSeeds')
      ];
      
      let filePath = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          filePath = testPath;
          break;
        }
      }
      
      console.log(`🔍 Loading historical figures seed data from: ${filePath}`);
      
      if (filePath) {
        const data = fs.readFileSync(filePath, 'utf8');
        this.seedData = JSON.parse(data);
        console.log(`✅ Loaded seed data with categories: ${Object.keys(this.seedData).join(', ')}`);
      } else {
        console.warn('⚠️ Historical figures seed file not found in any expected location');
        console.log('Searched paths:', possiblePaths);
        this.seedData = {};
      }
    } catch (error) {
      console.error('❌ Failed to load seed data:', error.message);
      this.seedData = {};
    }
  }

  async ensureAllCategoriesHaveContent() {
    console.log('🔍 Checking if all categories have historical figure content...');
    
    for (const category of this.categories) {
      for (const epoch of this.epochs) {
        for (const language of this.languages) {
          const storyCount = await this.stories.countDocuments({ 
            category, 
            epoch, 
            language,
            storyType: 'historical-figure'
          });
          
          if (storyCount === 0) {
            console.log(`📝 No stories found for ${category}-${epoch}-${language}, generating content...`);
            await this.generateHistoricalFigureStory(category, epoch, language);
          }
        }
      }
    }
    console.log('✅ All categories now have historical figure content');
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }

  async getHistoricalFigures(category, epoch) {
    if (!this.seedData || !this.seedData[category] || !this.seedData[category][epoch]) {
      console.warn(`⚠️ No historical figures found for ${category}-${epoch}`);
      return [];
    }
    
    return this.seedData[category][epoch] || [];
  }

  async generateHistoricalFigureStory(category, epoch, language = 'en', specificFigure = null) {
    try {
      console.log(`🤖 Generating historical figure story for ${category}-${epoch}-${language}...`);
      
      let selectedFigure;
      
      if (specificFigure) {
        // Use the specific figure provided
        selectedFigure = specificFigure;
        console.log(`🎯 Using specified historical figure: ${selectedFigure.name}`);
      } else {
        // Get historical figures for this category and epoch
        const historicalFigures = await this.getHistoricalFigures(category, epoch);
        
        if (historicalFigures.length === 0) {
          console.warn(`⚠️ No historical figures available for ${category}-${epoch}`);
          return null;
        }

        // Select a random historical figure (fallback for backward compatibility)
        selectedFigure = historicalFigures[Math.floor(Math.random() * historicalFigures.length)];
        console.log(`🎯 Selected historical figure: ${selectedFigure.name}`);
      }

      // Create enhanced prompt for the specific historical figure
      const enhancedPrompt = `Generate a story about ${selectedFigure.name}, a historical figure in ${category.toLowerCase()}.

IMPORTANT: You MUST focus on ${selectedFigure.name} and their specific achievements. Do NOT create a generic story.

Context: ${selectedFigure.context}

Tell the story of ${selectedFigure.name}, including:
1. Their exact name: ${selectedFigure.name}
2. Their specific achievements in ${category.toLowerCase()}
3. How their innovations changed the world during ${epoch.toLowerCase()} times
4. Their background and challenges they faced
5. The lasting impact of their contributions

Make it engaging and educational with concrete details about their life and work.

${language === 'es' ? 'IMPORTANTE: Responde EN ESPAÑOL. Todo el contenido debe estar en español.' : 'IMPORTANT: Respond in English language.'}`;

      // Generate story using Azure OpenAI
      const storyData = await this.generateStoryWithAzureOpenAI(enhancedPrompt, language);
      
      if (!storyData) {
        console.warn(`⚠️ Failed to generate story for ${selectedFigure.name}`);
        return null;
      }

      // Create story object
      const story = new HistoricalFigureStory({
        category,
        epoch,
        language,
        headline: storyData.headline,
        summary: storyData.summary,
        fullText: storyData.fullText,
        source: storyData.source,
        historicalFigure: selectedFigure.name,
        storyType: 'historical-figure',
        lastUsed: new Date().toISOString(),
        useCount: 1
      });

      // Generate TTS audio (but don't include in response to prevent JSON issues)
      try {
        const ttsAudio = await this.generateTTS(story.fullText, language);
        story.ttsAudio = ttsAudio;
        story.ttsGeneratedAt = new Date().toISOString();
      } catch (ttsError) {
        console.warn('TTS generation failed:', ttsError.message);
        story.ttsAudio = null;
      }

      // Store in database
      await this.stories.insertOne(story);
      console.log(`✅ Generated and stored historical figure story for ${selectedFigure.name}`);
      
      // Remove TTS fields from response to prevent JSON issues
      const { ttsAudio, ttsGeneratedAt, ...storyWithoutTTS } = story;
      return storyWithoutTTS;
    } catch (error) {
      console.error(`❌ Failed to generate historical figure story for ${category}-${epoch}-${language}:`, error.message);
      return null;
    }
  }

  async generateStoryWithAzureOpenAI(prompt, language = 'en') {
    try {
      const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://aimcs-foundry.cognitiveservices.azure.com/';
      const azureOpenAIDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';
      
      // Try to get API key from Key Vault first, then fallback to environment
      let azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
      
      // If we have access to Key Vault secrets (from backend server), use them
      if (global.secrets && global.secrets.AZURE_OPENAI_API_KEY) {
        azureOpenAIApiKey = global.secrets.AZURE_OPENAI_API_KEY;
      }

      if (!azureOpenAIApiKey) {
        throw new Error('Azure OpenAI API key not available');
      }

      const response = await fetch(`${azureOpenAIEndpoint}openai/deployments/${azureOpenAIDeployment}/chat/completions?api-version=2024-12-01-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${azureOpenAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: azureOpenAIDeployment,
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant that creates engaging, educational stories about specific historical figures. You MUST focus on the exact historical figure mentioned and tell their story. Always include the historical figure's name in the headline and story. Focus on uplifting and inspiring content about their specific achievements and contributions. NEVER create generic stories. ${language === 'es' ? 'IMPORTANTE: Responde EN ESPAÑOL. Todo el contenido debe estar en español.' : 'IMPORTANT: Respond in English language.'}`
            },
            {
              role: 'user',
              content: `${prompt} Return ONLY a valid JSON object with this exact format: { "headline": "Brief headline mentioning the historical figure", "summary": "One sentence summary", "fullText": "2-3 sentence story about the historical figure", "source": "O4-Mini" }`
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
      
      let storyData;
      try {
        storyData = JSON.parse(content);
      } catch (parseError) {
        console.warn('Azure OpenAI JSON parse failed:', parseError.message);
        return null;
      }

      return storyData;
    } catch (error) {
      console.error('Failed to generate story with Azure OpenAI:', error.message);
      return null;
    }
  }

  async generateTTS(text, language = 'en') {
    try {
      const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://aimcs-foundry.cognitiveservices.azure.com/';
      const azureOpenAITTSDeployment = process.env.AZURE_OPENAI_TTS_DEPLOYMENT || 'gpt-4o-mini-tts';
      
      // Try to get API key from Key Vault first, then fallback to environment
      let azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
      
      // If we have access to Key Vault secrets (from backend server), use them
      if (global.secrets && global.secrets.AZURE_OPENAI_API_KEY) {
        azureOpenAIApiKey = global.secrets.AZURE_OPENAI_API_KEY;
      }

      const response = await fetch(`${azureOpenAIEndpoint}openai/deployments/${azureOpenAITTSDeployment}/audio/speech?api-version=2025-03-01-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${azureOpenAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: azureOpenAITTSDeployment,
          input: text,
          voice: 'alloy', // Use alloy for both languages since 'jorge' is not supported
          response_format: 'mp3'
        })
      });
      
      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        return Buffer.from(audioBuffer).toString('base64');
      } else {
        throw new Error(`TTS API error: ${response.status}`);
      }
    } catch (error) {
      console.error('TTS generation failed:', error.message);
      throw error;
    }
  }

  async getStories(category, epoch = 'Modern', language = 'en', count = 1, includeTTS = false) {
    try {
      console.log(`📚 Getting historical figure stories for ${category}-${epoch}-${language} (requested: ${count})`);
      
      // Get all available historical figures for this category and epoch
      const historicalFigures = await this.getHistoricalFigures(category, epoch);
      
      if (historicalFigures.length === 0) {
        console.warn(`⚠️ No historical figures available for ${category}-${epoch}`);
        return [];
      }
      
      console.log(`👥 Available historical figures: ${historicalFigures.map(f => f.name).join(', ')}`);
      
      // Get existing stories to see which figures have been used recently
      const existingStories = await this.stories.find({ 
        category, 
        epoch, 
        language, 
        storyType: 'historical-figure' 
      }).sort({ lastUsed: 1 }).toArray();
      
      // Create a map of historical figures and their last usage
      const figureUsage = new Map();
      historicalFigures.forEach(figure => {
        figureUsage.set(figure.name, { figure, lastUsed: null, useCount: 0 });
      });
      
      // Update usage from existing stories
      existingStories.forEach(story => {
        if (figureUsage.has(story.historicalFigure)) {
          figureUsage.get(story.historicalFigure).lastUsed = story.lastUsed;
          figureUsage.get(story.historicalFigure).useCount = story.useCount || 0;
        }
      });
      
      // Sort figures by last usage (null = never used, comes first)
      const sortedFigures = Array.from(figureUsage.values())
        .sort((a, b) => {
          if (a.lastUsed === null && b.lastUsed === null) {
            return a.useCount - b.useCount; // Use count as tiebreaker
          }
          if (a.lastUsed === null) return -1;
          if (b.lastUsed === null) return 1;
          return new Date(a.lastUsed) - new Date(b.lastUsed);
        });
      
      console.log(`🔄 Round-robin order: ${sortedFigures.map(f => f.figure.name).join(' → ')}`);
      
      const selectedStories = [];
      
      // Select figures in round-robin order
      for (let i = 0; i < count && i < sortedFigures.length; i++) {
        const selectedFigure = sortedFigures[i];
        console.log(`🎯 Selecting figure ${i + 1}/${count}: ${selectedFigure.figure.name}`);
        
        // Check if we have an existing story for this figure
        const existingStory = existingStories.find(s => s.historicalFigure === selectedFigure.figure.name);
        
        if (existingStory) {
          // Use existing story and update usage
          const updatedStory = { ...existingStory };
          updatedStory.lastUsed = new Date().toISOString();
          updatedStory.useCount = (updatedStory.useCount || 0) + 1;
          
          // Update in database
          await this.stories.updateOne(
            { _id: existingStory._id },
            { $set: { lastUsed: updatedStory.lastUsed, useCount: updatedStory.useCount } }
          );
          
          // Handle TTS fields based on includeTTS parameter
          if (!includeTTS) {
            // Remove TTS fields for response
            const { ttsAudio, ttsGeneratedAt, ...storyWithoutTTS } = updatedStory;
            selectedStories.push(storyWithoutTTS);
          } else {
            selectedStories.push(updatedStory);
          }
          
          console.log(`✅ Using existing story for ${selectedFigure.figure.name}`);
        } else {
          // Generate new story for this figure
          console.log(`🆕 Generating new story for ${selectedFigure.figure.name}`);
          const newStory = await this.generateHistoricalFigureStory(category, epoch, language, selectedFigure.figure);
          if (newStory) {
            // Handle TTS fields based on includeTTS parameter
            if (!includeTTS) {
              // Remove TTS fields for response
              const { ttsAudio, ttsGeneratedAt, ...storyWithoutTTS } = newStory;
              selectedStories.push(storyWithoutTTS);
            } else {
              selectedStories.push(newStory);
            }
          }
        }
      }
      
      console.log(`✅ Returning ${selectedStories.length} unique historical figure stories for ${category}`);
      return selectedStories;
      
    } catch (error) {
      console.error('Failed to get historical figure stories:', error);
      return [];
    }
  }

  async getRandomStory(category, epoch = 'Modern', language = 'en') {
    try {
      const stories = await this.getStories(category, epoch, language, 1, true);
      return stories.length > 0 ? stories[0] : null;
    } catch (error) {
      console.error('Failed to get random historical figure story:', error.message);
      return null;
    }
  }

  async getStoryStats() {
    try {
      const stats = await this.stories.aggregate([
        {
          $group: {
            _id: { category: '$category', epoch: '$epoch', language: '$language' },
            count: { $sum: 1 },
            figures: { $addToSet: '$historicalFigure' }
          }
        },
        {
          $sort: { '_id.category': 1, '_id.epoch': 1, '_id.language': 1 }
        }
      ]).toArray();
      
      return stats;
    } catch (error) {
      console.error('Failed to get story stats:', error.message);
      return [];
    }
  }

  async getAvailableCategories() {
    return this.categories;
  }

  async getAvailableEpochs() {
    return this.epochs;
  }

  async getAvailableLanguages() {
    return this.languages;
  }

  async getHistoricalFiguresList(category, epoch) {
    return await this.getHistoricalFigures(category, epoch);
  }
}

export { HistoricalFiguresService }; 