import BlobStorageService from './blob-storage-service.js';
import { AzureOpenAI } from 'openai';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

/**
 * Historical Figures Service using Blob Storage
 * 
 * This service replaces MongoDB with cost-effective blob storage:
 * - Stories stored as JSON files in blob storage
 * - Audio stored as MP3 files in blob storage
 * - Cost: ~$5-15/month vs $1,000/month for MongoDB
 */
class HistoricalFiguresServiceBlob {
  constructor() {
    this.blobStorageService = new BlobStorageService();
    this.openaiClient = null;
    this.speechConfig = null;
    this.isInitialized = false;
    
    // Historical figures data (from seed files)
    this.historicalFigures = {
      'Technology': {
        'Ancient': ['Archimedes', 'Hero of Alexandria', 'Ctesibius'],
        'Medieval': ['Leonardo da Vinci', 'Johannes Gutenberg', 'Al-Jazari'],
        'Industrial': ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell'],
        'Modern': ['Steve Jobs', 'Bill Gates', 'Tim Berners-Lee'],
        'Future': ['Elon Musk', 'Satya Nadella', 'Jensen Huang']
      },
      'Science': {
        'Ancient': ['Aristotle', 'Euclid', 'Ptolemy'],
        'Medieval': ['Ibn al-Haytham', 'Roger Bacon', 'Nicolaus Copernicus'],
        'Industrial': ['Isaac Newton', 'Charles Darwin', 'Marie Curie'],
        'Modern': ['Albert Einstein', 'Stephen Hawking', 'Rosalind Franklin'],
        'Future': ['Jennifer Doudna', 'Katalin Karikó', 'Demis Hassabis']
      },
      'Art': {
        'Ancient': ['Phidias', 'Praxiteles', 'Apelles'],
        'Medieval': ['Giotto', 'Jan van Eyck', 'Donatello'],
        'Industrial': ['Michelangelo', 'Leonardo da Vinci', 'Rembrandt'],
        'Modern': ['Pablo Picasso', 'Vincent van Gogh', 'Frida Kahlo'],
        'Future': ['Yayoi Kusama', 'Banksy', 'Ai Weiwei']
      },
      'Nature': {
        'Ancient': ['Aristotle', 'Theophrastus', 'Pliny the Elder'],
        'Medieval': ['Albertus Magnus', 'Frederick II', 'Marco Polo'],
        'Industrial': ['Alexander von Humboldt', 'Charles Darwin', 'John Muir'],
        'Modern': ['Rachel Carson', 'Jane Goodall', 'David Attenborough'],
        'Future': ['Greta Thunberg', 'Boyan Slat', 'Isatou Ceesay']
      },
      'Sports': {
        'Ancient': ['Milo of Croton', 'Leonidas of Rhodes', 'Diagoras of Rhodes'],
        'Medieval': ['William Marshal', 'Saladin', 'Richard I'],
        'Industrial': ['John L. Sullivan', 'Tom Brown', 'Walter Camp'],
        'Modern': ['Muhammad Ali', 'Pelé', 'Michael Jordan'],
        'Future': ['Lionel Messi', 'Serena Williams', 'LeBron James']
      },
      'Music': {
        'Ancient': ['Pythagoras', 'Aristoxenus', 'Plato'],
        'Medieval': ['Hildegard of Bingen', 'Guillaume de Machaut', 'Francesco Landini'],
        'Industrial': ['Johann Sebastian Bach', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven'],
        'Modern': ['The Beatles', 'Bob Dylan', 'Aretha Franklin'],
        'Future': ['Taylor Swift', 'Beyoncé', 'Ed Sheeran']
      },
      'Space': {
        'Ancient': ['Aristarchus', 'Hipparchus', 'Claudius Ptolemy'],
        'Medieval': ['Al-Battani', 'Ulugh Beg', 'Tycho Brahe'],
        'Industrial': ['Johannes Kepler', 'Galileo Galilei', 'Isaac Newton'],
        'Modern': ['Yuri Gagarin', 'Neil Armstrong', 'Carl Sagan'],
        'Future': ['Elon Musk', 'Jeff Bezos', 'Richard Branson']
      },
      'Innovation': {
        'Ancient': ['Imhotep', 'Archimedes', 'Hero of Alexandria'],
        'Medieval': ['Leonardo da Vinci', 'Johannes Gutenberg', 'Al-Jazari'],
        'Industrial': ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell'],
        'Modern': ['Steve Jobs', 'Bill Gates', 'Tim Berners-Lee'],
        'Future': ['Elon Musk', 'Satya Nadella', 'Jensen Huang']
      }
    };
  }

  async initialize() {
    try {
      console.log('🔧 Initializing Historical Figures Service (Blob Storage)...');
      
      // Initialize blob storage service
      const blobConnected = await this.blobStorageService.initialize();
      if (!blobConnected) {
        console.warn('⚠️ Blob storage not available, running in limited mode');
        return false;
      }

      // Initialize OpenAI client - use secrets from Key Vault if available
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiKey = global.secrets?.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
      
      if (endpoint && apiKey) {
        this.openaiClient = new AzureOpenAI({
          endpoint: endpoint,
          apiKey: apiKey,
          deployment: 'gpt-5-mini',
          apiVersion: '2024-12-01-preview'
        });
        console.log('✅ Azure OpenAI client initialized with gpt-5-mini model');
      } else {
        console.warn('⚠️ OpenAI credentials not available');
      }

      // Initialize speech config for TTS
      const speechKey = process.env.AZURE_SPEECH_KEY;
      const speechRegion = process.env.AZURE_SPEECH_REGION;
      
      if (speechKey && speechRegion) {
        this.speechConfig = speechsdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        this.speechConfig.speechSynthesisVoiceName = 'en-US-AriaNeural';
        console.log('✅ Speech synthesis configured');
      } else {
        console.warn('⚠️ Speech synthesis credentials not available');
      }

      this.isInitialized = true;
      console.log('✅ Historical Figures Service (Blob Storage) initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Historical Figures Service initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Get historical figures for a category and epoch
   */
  getHistoricalFigures(category, epoch) {
    if (!this.historicalFigures[category] || !this.historicalFigures[category][epoch]) {
      return [];
    }
    return this.historicalFigures[category][epoch];
  }

  /**
   * Generate stories for historical figures
   */
  async generateStories(category, epoch, language = 'en', model = 'gpt-5-mini', count = 3) {
    if (!this.isInitialized) {
      throw new Error('Historical Figures Service not initialized');
    }

    try {
      // Check if stories are already cached in blob storage
      const cachedStories = await this.blobStorageService.getStories(category, epoch, language, model);
      if (cachedStories.length > 0) {
        console.log(`📖 Using ${cachedStories.length} cached stories from blob storage`);
        return cachedStories.slice(0, count);
      }

      // Generate new stories
      console.log(`🎭 Generating ${count} new stories for ${category}/${epoch}/${language}/${model}`);
      
      const figures = this.getHistoricalFigures(category, epoch);
      if (figures.length === 0) {
        throw new Error(`No historical figures found for ${category}/${epoch}`);
      }

      const stories = [];
      const selectedFigures = figures.slice(0, count);

      for (const figure of selectedFigures) {
        try {
          const story = await this.generateSingleStory(figure, category, epoch, language, model);
          if (story) {
            stories.push(story);
          }
        } catch (error) {
          console.error(`❌ Error generating story for ${figure}:`, error.message);
        }
      }

      // Save stories to blob storage for future use
      if (stories.length > 0) {
        await this.blobStorageService.saveStories(category, epoch, language, model, stories);
        console.log(`💾 Saved ${stories.length} stories to blob storage`);
      }

      return stories;
    } catch (error) {
      console.error('❌ Error generating stories:', error.message);
      throw error;
    }
  }

  /**
   * Generate a single story for a historical figure
   */
  async generateSingleStory(figure, category, epoch, language, model) {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not available');
    }

    try {
      const prompt = this.getPromptForFigure(figure, category, epoch, language, model);
      
      const response = await this.openaiClient.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
        model: 'gpt-5-mini'
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      // Parse the JSON response
      let storyData;
      try {
        storyData = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, create a simple story structure
        storyData = {
          headline: `${figure}: A ${epoch} ${category} Legend`,
          story: content,
          figureName: figure,
          category: category,
          epoch: epoch,
          language: language,
          model: model
        };
      }

      // Ensure required fields
      storyData.figureName = figure;
      storyData.category = category;
      storyData.epoch = epoch;
      storyData.language = language;
      storyData.model = model;
      storyData.timestamp = new Date().toISOString();

      return storyData;
    } catch (error) {
      console.error(`❌ Error generating story for ${figure}:`, error.message);
      return null;
    }
  }

  /**
   * Generate audio for a story
   */
  async generateAudio(story) {
    if (!this.speechConfig) {
      console.warn('⚠️ Speech synthesis not available');
      return null;
    }

    try {
      // Check if audio is already cached
      const cachedAudio = await this.blobStorageService.getAudioBlob(
        story.category, 
        story.epoch, 
        story.language, 
        story.model, 
        story.figureName
      );
      
      if (cachedAudio) {
        console.log(`🎵 Using cached audio for ${story.figureName}`);
        return cachedAudio.toString('base64');
      }

      // Generate new audio
      console.log(`🎵 Generating audio for ${story.figureName}`);
      
      const text = story.story || story.headline;
      const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new speechsdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(text, async (result) => {
          if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
            const audioBuffer = Buffer.from(result.audioData);
            
            // Save audio to blob storage
            await this.blobStorageService.saveAudioBlob(
              story.category,
              story.epoch,
              story.language,
              story.model,
              story.figureName,
              audioBuffer
            );
            
            console.log(`💾 Saved audio for ${story.figureName} (${audioBuffer.length} bytes)`);
            resolve(audioBuffer.toString('base64'));
          } else {
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
          }
          synthesizer.close();
        });
      });
    } catch (error) {
      console.error('❌ Error generating audio:', error.message);
      return null;
    }
  }

  /**
   * Get prompt for a historical figure
   */
  getPromptForFigure(figure, category, epoch, language, model) {
    const basePrompt = `Generate a compelling story about ${figure}, a ${epoch} ${category} figure. 
    
    Requirements:
    - Write in ${language}
    - Make it engaging and educational
    - Include specific achievements and impact
    - Keep it under 2000 tokens
    - Return as JSON with fields: headline, story, figureName, category, epoch, language, model
    
    Figure: ${figure}
    Category: ${category}
    Epoch: ${epoch}
    Language: ${language}
    Model: ${model}`;

    return basePrompt;
  }

  /**
   * Get Learn More content for a historical figure
   */
  async getLearnMore(figure, category, epoch, language, model) {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not available');
    }

    try {
      const prompt = `Provide detailed information about ${figure}, a ${epoch} ${category} figure.
      
      Requirements:
      - Write in ${language}
      - Include: early life, achievements, historical context, impact, legacy
      - Make it comprehensive (500-600 words)
      - Include specific dates and facts
      - Return as JSON with fields: title, content, figureName, category, epoch, language, model
      
      Figure: ${figure}
      Category: ${category}
      Epoch: ${epoch}
      Language: ${language}
      Model: ${model}`;

      const response = await this.openaiClient.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
        model: 'gpt-5-mini'
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      let learnMoreData;
      try {
        learnMoreData = JSON.parse(content);
      } catch (parseError) {
        learnMoreData = {
          title: `${figure}: Detailed Information`,
          content: content,
          figureName: figure,
          category: category,
          epoch: epoch,
          language: language,
          model: model
        };
      }

      learnMoreData.figureName = figure;
      learnMoreData.category = category;
      learnMoreData.epoch = epoch;
      learnMoreData.language = language;
      learnMoreData.model = model;
      learnMoreData.timestamp = new Date().toISOString();

      return learnMoreData;
    } catch (error) {
      console.error(`❌ Error generating Learn More for ${figure}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.isInitialized && this.blobStorageService.isReady();
  }

  /**
   * Get service statistics
   */
  async getStats() {
    const blobStats = await this.blobStorageService.getStorageStats();
    return {
      service: 'HistoricalFiguresServiceBlob',
      initialized: this.isInitialized,
      blobStorage: blobStats,
      openai: !!this.openaiClient,
      speech: !!this.speechConfig
    };
  }
}

export default HistoricalFiguresServiceBlob;
