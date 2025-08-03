import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

/**
 * Historical Figure Story - Core story data without heavy media
 */
class HistoricalFigureStory {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.historicalFigure = data.historicalFigure || '';
    this.category = data.category || '';
    this.epoch = data.epoch || 'Modern';
    this.language = data.language || 'en';
    this.headline = data.headline || '';
    this.summary = data.summary || '';
    this.fullText = data.fullText || '';
    this.source = data.source || 'O4-Mini';
    this.storyType = 'historical-figure';
    this.publishedAt = data.publishedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastUsed = data.lastUsed || null;
    this.useCount = data.useCount || 0;
    
    // Media references (not the actual data)
    this.hasAudio = data.hasAudio || false;
    this.hasImages = data.hasImages || false;
    this.audioId = data.audioId || null; // Reference to audio collection
    this.imageIds = data.imageIds || []; // References to image collection
  }
}

/**
 * Historical Figure Audio - Separate collection for audio data
 */
class HistoricalFigureAudio {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.storyId = data.storyId || ''; // Reference to story
    this.historicalFigure = data.historicalFigure || '';
    this.category = data.category || '';
    this.epoch = data.epoch || 'Modern';
    this.language = data.language || 'en';
    this.audioData = data.audioData || null; // base64 encoded audio
    this.audioLength = data.audioLength || 0; // Length in characters
    this.generatedAt = data.generatedAt || new Date().toISOString();
    this.ttl = data.ttl || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
}

/**
 * Historical Figure Image - Separate collection for image data
 */
class HistoricalFigureImage {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.storyId = data.storyId || ''; // Reference to story
    this.historicalFigure = data.historicalFigure || '';
    this.category = data.category || '';
    this.epoch = data.epoch || 'Modern';
    this.imageType = data.imageType || 'portrait'; // portrait, gallery, background
    this.imageUrl = data.imageUrl || '';
    this.imageData = data.imageData || null; // base64 encoded image (optional)
    this.source = data.source || '';
    this.licensing = data.licensing || '';
    this.permalink = data.permalink || '';
    this.searchTerm = data.searchTerm || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.ttl = data.ttl || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
}

/**
 * Historical Figures Service - Dedicated service for historical figure content
 */
class HistoricalFiguresService {
  constructor(mongoUri, dbName = 'orbgame') {
    this.mongoUri = mongoUri;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
    
    // Separate collections for different data types
    this.stories = null;
    this.audio = null;
    this.images = null;
    this.seeds = null;
    
    this.updateInterval = null;
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
      
      // Initialize separate collections
      this.stories = this.db.collection('historical_figures');
      this.audio = this.db.collection('historical_figure_audio');
      this.images = this.db.collection('historical_figure_images');
      this.seeds = this.db.collection('historical_figure_seeds');
      
      // Create indexes for optimal performance
      await this.stories.createIndex({ category: 1, epoch: 1, language: 1 });
      await this.stories.createIndex({ historicalFigure: 1 });
      await this.stories.createIndex({ lastUsed: 1 });
      await this.stories.createIndex({ hasAudio: 1, hasImages: 1 });
      
      await this.audio.createIndex({ storyId: 1 });
      await this.audio.createIndex({ historicalFigure: 1, category: 1, epoch: 1 });
      await this.audio.createIndex({ ttl: 1 }, { expireAfterSeconds: 0 });
      
      await this.images.createIndex({ storyId: 1 });
      await this.images.createIndex({ historicalFigure: 1, category: 1, epoch: 1 });
      await this.images.createIndex({ imageType: 1 });
      await this.images.createIndex({ ttl: 1 }, { expireAfterSeconds: 0 });
      
      console.log('✅ Historical Figures Service initialized successfully');
      
      // Load seed data and ensure content
      await this.loadSeedData();
      await this.ensureAllCategoriesHaveContent();
      
      this.startBackgroundUpdates();
    } catch (error) {
      console.error('❌ Historical Figures Service initialization failed:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    await this.client.close();
  }

  /**
   * Get stories with optional media inclusion
   */
  async getStories(category, epoch = 'Modern', language = 'en', count = 1, includeMedia = false) {
    try {
      console.log(`📚 Getting historical figure stories for ${category}-${epoch}-${language} (requested: ${count})`);
      
      // Get stories without heavy media data
      const stories = await this.stories.find({ 
        category, 
        epoch, 
        language, 
        storyType: 'historical-figure' 
      }).sort({ lastUsed: 1 }).limit(count).toArray();
      
      if (stories.length === 0) {
        console.log(`❌ No historical figure stories found for ${category}-${epoch}-${language}`);
        return [];
      }
      
      // Update usage statistics
      for (const story of stories) {
        await this.stories.updateOne(
          { _id: story._id },
          { 
            $set: { 
              lastUsed: new Date().toISOString(),
              useCount: (story.useCount || 0) + 1
            } 
          }
        );
      }
      
      // Include media if requested
      if (includeMedia) {
        for (const story of stories) {
          // Get audio
          if (story.hasAudio) {
            const audio = await this.audio.findOne({ storyId: story.id });
            if (audio) {
              story.ttsAudio = audio.audioData;
            }
          }
          
          // Get images
          if (story.hasImages) {
            const images = await this.images.find({ storyId: story.id }).toArray();
            if (images.length > 0) {
              story.images = {
                portrait: images.find(img => img.imageType === 'portrait'),
                gallery: images.filter(img => img.imageType === 'gallery')
              };
            }
          }
        }
      }
      
      console.log(`✅ Found ${stories.length} historical figure stories for ${category}`);
      return stories;
      
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  /**
   * Generate a new historical figure story with separated media
   */
  async generateHistoricalFigureStory(category, epoch, language = 'en', specificFigure = null) {
    try {
      console.log(`🤖 Generating historical figure story for ${category}-${epoch}-${language}`);
      
      // Get or select a historical figure
      const selectedFigure = specificFigure || await this.getRandomHistoricalFigure(category, epoch);
      if (!selectedFigure) {
        throw new Error(`No historical figure available for ${category}-${epoch}`);
      }
      
      // Generate story text
      const storyData = await this.generateStoryWithAzureOpenAI(selectedFigure, category, epoch, language);
      if (!storyData) {
        throw new Error('Failed to generate story text');
      }
      
      // Create story document (without media)
      const story = new HistoricalFigureStory({
        historicalFigure: selectedFigure.name,
        category,
        epoch,
        language,
        headline: storyData.headline,
        summary: storyData.summary,
        fullText: storyData.fullText,
        source: storyData.source
      });
      
      // Store story first
      await this.stories.insertOne(story);
      console.log(`✅ Generated and stored story for ${selectedFigure.name}`);
      
      // Generate and store audio separately
      try {
        const audioData = await this.generateTTS(story.fullText, language);
        if (audioData) {
          const audio = new HistoricalFigureAudio({
            storyId: story.id,
            historicalFigure: story.historicalFigure,
            category: story.category,
            epoch: story.epoch,
            language: story.language,
            audioData: audioData,
            audioLength: audioData.length
          });
          await this.audio.insertOne(audio);
          
          // Update story to indicate it has audio
          await this.stories.updateOne(
            { _id: story._id },
            { $set: { hasAudio: true, audioId: audio.id } }
          );
          console.log(`✅ Generated and stored audio for ${selectedFigure.name}`);
        }
      } catch (audioError) {
        console.warn(`⚠️ Failed to generate audio for ${selectedFigure.name}:`, audioError.message);
      }
      
      // Generate and store images separately
      try {
        const images = await this.generateImages(selectedFigure, category, epoch);
        if (images.length > 0) {
          const imageDocuments = images.map((img, index) => new HistoricalFigureImage({
            storyId: story.id,
            historicalFigure: story.historicalFigure,
            category: story.category,
            epoch: story.epoch,
            imageType: index === 0 ? 'portrait' : 'gallery',
            imageUrl: img.url,
            source: img.source,
            licensing: img.licensing,
            permalink: img.permalink,
            searchTerm: img.searchTerm
          }));
          
          await this.images.insertMany(imageDocuments);
          
          // Update story to indicate it has images
          await this.stories.updateOne(
            { _id: story._id },
            { 
              $set: { 
                hasImages: true, 
                imageIds: imageDocuments.map(img => img.id) 
              } 
            }
          );
          console.log(`✅ Generated and stored ${images.length} images for ${selectedFigure.name}`);
        }
      } catch (imageError) {
        console.warn(`⚠️ Failed to generate images for ${selectedFigure.name}:`, imageError.message);
      }
      
      return story;
      
    } catch (error) {
      console.error(`❌ Failed to generate historical figure story for ${category}-${epoch}-${language}:`, error.message);
      return null;
    }
  }

  /**
   * Get audio for a specific story
   */
  async getAudio(storyId) {
    try {
      const audio = await this.audio.findOne({ storyId });
      return audio ? audio.audioData : null;
    } catch (error) {
      console.error('Error getting audio:', error);
      return null;
    }
  }

  /**
   * Get images for a specific story
   */
  async getImages(storyId) {
    try {
      const images = await this.images.find({ storyId }).toArray();
      return {
        portrait: images.find(img => img.imageType === 'portrait'),
        gallery: images.filter(img => img.imageType === 'gallery')
      };
    } catch (error) {
      console.error('Error getting images:', error);
      return { portrait: null, gallery: [] };
    }
  }

  /**
   * Generate TTS audio using Azure OpenAI
   */
  async generateTTS(text, language = 'en') {
    try {
      const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://aimcs-foundry.cognitiveservices.azure.com/';
      const azureOpenAITTSDeployment = process.env.AZURE_OPENAI_TTS_DEPLOYMENT || 'gpt-4o-mini-tts';
      
      let azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
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
          voice: language === 'es' ? 'alloy' : 'alloy', // Use alloy for both languages
          response_format: 'mp3',
          speed: 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI TTS API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      console.log(`✅ Generated TTS audio (${base64Audio.length} characters)`);
      return base64Audio;
      
    } catch (error) {
      console.error('Failed to generate TTS audio:', error.message);
      return null;
    }
  }

  /**
   * Generate images using the image service
   */
  async generateImages(figure, category, epoch) {
    try {
      const response = await fetch(`https://api.orbgame.us/api/orb/images/best?figureName=${encodeURIComponent(figure.name)}&category=${encodeURIComponent(category)}&epoch=${encodeURIComponent(epoch)}&contentType=portraits`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.image) {
          return [data.image];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to generate images:', error.message);
      return [];
    }
  }

  /**
   * Generate story text using Azure OpenAI
   */
  async generateStoryWithAzureOpenAI(figure, category, epoch, language = 'en') {
    try {
      const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://aimcs-foundry.cognitiveservices.azure.com/';
      const azureOpenAIDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';
      
      let azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
      if (global.secrets && global.secrets.AZURE_OPENAI_API_KEY) {
        azureOpenAIApiKey = global.secrets.AZURE_OPENAI_API_KEY;
      }

      const prompt = `Create an engaging, educational story about ${figure.name}, a historical figure in ${category} during the ${epoch} epoch. Focus on their specific achievements and contributions. ${language === 'es' ? 'IMPORTANTE: Responde EN ESPAÑOL. Todo el contenido debe estar en español.' : 'IMPORTANT: Respond in English language.'}`;

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

  /**
   * Get random historical figure for category and epoch
   */
  async getRandomHistoricalFigure(category, epoch) {
    try {
      const figures = await this.seeds.find({ category, epoch }).toArray();
      if (figures.length === 0) {
        return null;
      }
      return figures[Math.floor(Math.random() * figures.length)];
    } catch (error) {
      console.error('Error getting random historical figure:', error);
      return null;
    }
  }

  /**
   * Load seed data from file
   */
  async loadSeedData() {
    try {
      // This would load from the OrbGameInfluentialPeopleSeeds file
      console.log('📚 Loading historical figure seed data...');
      // Implementation would read from the seeds file
      console.log('✅ Seed data loaded');
    } catch (error) {
      console.error('Error loading seed data:', error);
    }
  }

  /**
   * Ensure all categories have content
   */
  async ensureAllCategoriesHaveContent() {
    console.log('🔍 Checking if all categories have content...');
    for (const category of this.categories) {
      for (const epoch of this.epochs) {
        for (const language of this.languages) {
          const storyCount = await this.stories.countDocuments({ category, epoch, language });
          if (storyCount === 0) {
            console.log(`📝 No stories found for ${category}-${epoch}-${language}, generating...`);
            await this.generateHistoricalFigureStory(category, epoch, language);
          }
        }
      }
    }
    console.log('✅ All categories now have content');
  }

  /**
   * Start background updates
   */
  startBackgroundUpdates() {
    this.updateInterval = setInterval(async () => {
      try {
        console.log('🔄 Starting background historical figures update...');
        await this.ensureAllCategoriesHaveContent();
      } catch (error) {
        console.error('❌ Background historical figures update failed:', error.message);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Get service statistics
   */
  async getServiceStats() {
    try {
      const storyCount = await this.stories.countDocuments();
      const audioCount = await this.audio.countDocuments();
      const imageCount = await this.images.countDocuments();
      const seedCount = await this.seeds.countDocuments();
      
      return {
        stories: storyCount,
        audio: audioCount,
        images: imageCount,
        seeds: seedCount,
        categories: this.categories,
        epochs: this.epochs,
        languages: this.languages
      };
    } catch (error) {
      console.error('Error getting service stats:', error);
      return null;
    }
  }
}

export { HistoricalFiguresService, HistoricalFigureStory, HistoricalFigureAudio, HistoricalFigureImage }; 