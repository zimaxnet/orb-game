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
        'Modern': ['Jane Goodall', 'David Attenborough', 'Wangari Maathai'],
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
      
      // Initialize blob storage service (optional)
      try {
        const blobConnected = await this.blobStorageService.initialize();
        if (!blobConnected) {
          console.warn('⚠️ Blob storage not available, running in limited mode');
        }
      } catch (blobError) {
        console.warn('⚠️ Blob storage initialization failed, running in limited mode:', blobError.message);
      }

      // Initialize OpenAI client - use secrets from Key Vault if available
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiKey = global.secrets?.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5-mini';
      
      if (endpoint && apiKey) {
        this.openaiClient = new AzureOpenAI({
          endpoint: endpoint,
          apiKey: apiKey,
          deployment: deployment,
          apiVersion: '2024-12-01-preview'
        });
        this.deployment = deployment;
        console.log(`✅ Azure OpenAI client initialized with ${deployment} model`);
      } else {
        console.warn('⚠️ OpenAI credentials not available');
      }

      // Speech synthesis is handled by the main TTS endpoint (/api/tts/generate)
      // No need to initialize Azure Speech Service here
      console.log('ℹ️ Speech synthesis handled by main TTS endpoint');

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
  async generateStories(category, epoch, language = 'en', model = 'gpt-5-mini', count = 3, storyType = 'medium') {
    if (!this.isInitialized) {
      throw new Error('Historical Figures Service not initialized');
    }

    try {
      // Check if stories are already cached in blob storage (if available)
      let cachedStories = [];
      try {
        if (this.blobStorageService && this.blobStorageService.isConnected) {
          cachedStories = await this.blobStorageService.getStories(category, epoch, language, model, storyType);
        }
      } catch (blobError) {
        console.warn('⚠️ Blob storage not available, generating stories directly:', blobError.message);
      }
      
      if (cachedStories.length > 0) {
        console.log(`📖 Using ${cachedStories.length} cached ${storyType} stories from blob storage`);
        
        // Generate audio for stories that don't have it
        const storiesWithAudio = await Promise.all(
          cachedStories.slice(0, count).map(async (story) => {
            if (!story.ttsAudio) {
              console.log(`🎵 Generating audio for ${story.figureName || story.headline}`);
              try {
                const audio = await this.generateAudio(story);
                if (audio) {
                  return { ...story, ttsAudio: audio };
                }
              } catch (error) {
                console.warn(`⚠️ Failed to generate audio for ${story.figureName || story.headline}:`, error.message);
              }
            }
            return story;
          })
        );
        
        return storiesWithAudio;
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
                 const story = await this.generateSingleStory(figure, category, epoch, language, model, storyType);
                 if (story) {
            // Generate audio for the story
            console.log(`🎵 Generating audio for ${figure}`);
            try {
              const audio = await this.generateAudio(story);
              if (audio) {
                story.ttsAudio = audio;
              }
            } catch (error) {
              console.warn(`⚠️ Failed to generate audio for ${figure}:`, error.message);
            }
            stories.push(story);
          }
        } catch (error) {
          console.error(`❌ Error generating story for ${figure}:`, error.message);
        }
      }

      // Save stories to blob storage for future use (if available)
      if (stories.length > 0) {
        try {
          if (this.blobStorageService && this.blobStorageService.isConnected) {
            await this.blobStorageService.saveStories(category, epoch, language, model, stories, storyType);
            console.log(`💾 Saved ${stories.length} ${storyType} stories to blob storage`);
          } else {
            console.log(`📝 Generated ${stories.length} ${storyType} stories (blob storage not available)`);
          }
        } catch (saveError) {
          console.warn('⚠️ Failed to save stories to blob storage:', saveError.message);
          console.log(`📝 Generated ${stories.length} ${storyType} stories (saving failed)`);
        }
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
  async generateSingleStory(figure, category, epoch, language, model, storyType = 'medium') {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not available');
    }

    try {
      const prompt = this.getPromptForFigure(figure, category, epoch, language, model, storyType);
      
      const response = await this.openaiClient.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
        model: this.deployment || 'gpt-5-mini'
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
          summary: `Learn about ${figure}, a ${epoch} ${category} figure`,
          fullText: content,
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

      // Generate new audio using the main TTS endpoint
      console.log(`🎵 Generating audio for ${story.figureName} via TTS endpoint`);
      
      const text = story.fullText || story.story || story.headline;
      if (!text) {
        console.warn('⚠️ No text available for audio generation');
        return null;
      }

      // Call the main TTS endpoint
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const ttsResponse = await fetch(`${backendUrl}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          language: story.language || 'en',
          voice: 'alloy'
        })
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS endpoint failed: ${ttsResponse.status}`);
      }

      const ttsData = await ttsResponse.json();
      if (!ttsData.audio) {
        throw new Error('No audio data received from TTS endpoint');
      }

      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(ttsData.audio, 'base64');
      
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
      return ttsData.audio;
    } catch (error) {
      console.error('❌ Error generating audio:', error.message);
      return null;
    }
  }

  /**
   * Get prompt for a historical figure
   */
  getPromptForFigure(figure, category, epoch, language, model, storyType = 'medium') {
    const lengthGuidance = storyType === 'detailed' 
      ? 'Write a comprehensive, in-depth story (2-3 paragraphs, 300-500 words)'
      : 'Write a concise, engaging story (1-2 paragraphs, 100-200 words)';
    
    const basePrompt = `Generate a ${storyType} story about ${figure}, a ${epoch} ${category} figure. 
    
    Requirements:
    - Write in ${language}
    - Make it engaging and educational
    - Include specific achievements and impact
    - ${lengthGuidance}
    - Return as JSON with fields: headline, summary, fullText, figureName, category, epoch, language, model
    
    Figure: ${figure}
    Category: ${category}
    Epoch: ${epoch}
    Language: ${language}
    Model: ${model}
    Story Type: ${storyType}`;

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
        model: this.deployment || 'gpt-5-mini'
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
    return this.isInitialized && this.openaiClient !== null;
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
      speech: true // TTS handled by main endpoint
    };
  }
}

export default HistoricalFiguresServiceBlob;
