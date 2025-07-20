import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { AdvancedMemoryService } from './advanced-memory-service.js';
import { PositiveNewsService } from './positive-news-service.js';
import { StoryCacheService } from './story-cache-service.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Environment variables
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
const AZURE_OPENAI_TTS_DEPLOYMENT = process.env.AZURE_OPENAI_TTS_DEPLOYMENT || 'gpt-4o-mini-tts';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;

// Global variables
let azureOpenAIClient = null;
let memoryService = null;
let positiveNewsService = null;
let storyCacheService = null;

// Analytics tracking
let totalChats = 0;
let totalWebSearches = 0;
let analyticsCache = {
  totalChats: 0,
  totalWebSearches: 0,
  mostPopular: 'N/A',
  topWords: [],
  averageWordsPerMessage: 0,
  searchPercentage: 0,
  funFact: 'Did you know? Orb Game can speak over 20 languages!',
  uptime: 0,
  lastUpdated: new Date().toISOString(),
  mostAccessedMemories: [],
  memoryRetrievalRate: 'N/A',
  averageResponseTime: '2.3s',
  searchRate: 'N/A'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    build: '2025-07-13-21:55'
  });
});

// Analytics endpoints
app.get('/api/analytics/summary', (req, res) => {
  res.json(analyticsCache);
});

app.get('/api/analytics/search-decisions', (req, res) => {
  res.json({
    totalSearches: totalWebSearches,
    searchRate: totalChats > 0 ? (totalWebSearches / totalChats * 100).toFixed(1) + '%' : '0%'
  });
});

// Enhanced chat endpoint with memory, web search, and TTS
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    totalChats++;
    
    // Update analytics
    analyticsCache.totalChats = totalChats;
    analyticsCache.lastUpdated = new Date().toISOString();
    
    let aiResponse = '';
    let needsSearch = false;
    
    // Check if web search is needed
    const searchKeywords = ['latest', 'news', 'today', 'recent', 'current', 'weather', 'temperature', 'price', 'stock', 'crypto', 'bitcoin', 'ethereum'];
    const needsWebSearch = searchKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (needsWebSearch) {
      needsSearch = true;
      totalWebSearches++;
      analyticsCache.totalWebSearches = totalWebSearches;
      
      try {
        console.log('🔍 Performing web search for:', message);
        
        const searchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar',
            stream: false,
            max_tokens: 800,
            temperature: 0.7,
            messages: [
              {
                role: 'user',
                content: `Search the web for current information about: ${message}. Provide a helpful, accurate response based on the latest information available.${language === 'es' ? ' Respond in Spanish.' : ''}`
              }
            ]
          })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          aiResponse = searchData.choices[0].message.content;
          console.log('✅ Web search completed successfully');
        } else {
          throw new Error(`Search API error: ${searchResponse.status}`);
        }
      } catch (searchError) {
        console.warn('⚠️ Web search failed:', searchError.message);
        // Fall back to regular AI response
        needsSearch = false;
      }
    }
    
    // If no web search was performed or it failed, use regular AI
    if (!aiResponse) {
      try {
        // Get relevant memories if available
        let memoryContext = '';
        if (memoryService) {
          try {
            const memories = await memoryService.searchMemories('default-user', message, 3);
            if (memories.length > 0) {
              memoryContext = `\n\nPrevious conversation context:\n${memories.map(m => m.content).join('\n')}\n\n`;
            }
          } catch (memoryError) {
            console.warn('Memory retrieval failed:', memoryError.message);
          }
        }
        
        // Use Azure OpenAI for regular responses
        if (azureOpenAIClient) {
          // Use centralized prompt manager
          const promptManager = require('../utils/promptManager');
          const systemPrompt = promptManager.getSystemPrompt(language) + memoryContext;
          
          const response = await azureOpenAIClient.getChatCompletions(
            AZURE_OPENAI_DEPLOYMENT,
            [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: message
              }
            ],
            {
              maxTokens: 800,
              temperature: 0.7
            }
          );
          
          aiResponse = response.choices[0].message.content;
        } else {
          // Fallback response if Azure OpenAI is not available
          const promptManager = require('../utils/promptManager');
          const fallbackStory = promptManager.getFallbackStory('AI Assistant', language);
          aiResponse = fallbackStory.summary;
        }
              } catch (aiError) {
          console.error('AI response generation failed:', aiError.message);
          const promptManager = require('../utils/promptManager');
          const fallbackStory = promptManager.getFallbackStory('Error', language);
          aiResponse = fallbackStory.summary;
        }
    }
    
    // Store in memory if available
    if (memoryService && aiResponse) {
      try {
        await memoryService.storeMemory('default-user', `${message} - ${aiResponse}`, 'conversation');
      } catch (memoryError) {
        console.warn('Memory storage failed:', memoryError.message);
      }
    }

    // Generate TTS audio using Azure OpenAI TTS
    let audioData = null;
    if (aiResponse) {
      try {
        console.log('🎵 Generating TTS audio for:', aiResponse.substring(0, 50) + '...');
        
        // Use centralized prompt manager for TTS voice
        const promptManager = require('../utils/promptManager');
        const voice = promptManager.getTTSVoice(language);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: aiResponse,
            voice: voice,
            response_format: 'mp3',
            speed: 1.0
          })
        });

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          audioData = Buffer.from(audioBuffer).toString('base64');
          console.log('✅ TTS audio generated successfully');
        } else {
          const errorText = await ttsResponse.text();
          console.warn('⚠️ TTS request failed:', ttsResponse.status, ttsResponse.statusText);
          console.warn('TTS error details:', errorText);
        }
      } catch (ttsError) {
        console.warn('TTS failed:', ttsError.message);
      }
    }

    res.json({
      response: aiResponse,
      audioData: audioData,
      searchUsed: needsSearch
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Story generation endpoint
app.post('/api/orb/generate-news/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const { epoch = 'Modern', model = 'o4-mini', count = 3, language = 'en', prompt } = req.body;
    
    console.log(`📝 Generating ${count} stories for ${category} (${epoch} epoch) using ${model}`);
    
    let stories = [];
    
    // Route to appropriate AI model
    switch (model) {
      case 'grok-4':
        stories = await generateStoriesWithGrok(category, epoch, count, prompt, language);
        break;
      case 'perplexity-sonar':
        stories = await generateStoriesWithPerplexity(category, epoch, count, prompt, language);
        break;
      case 'gemini-1.5-flash':
        stories = await generateStoriesWithGemini(category, epoch, count, prompt, language);
        break;
      case 'o4-mini':
      default:
        stories = await generateStoriesWithAzureOpenAI(category, epoch, count, prompt, language);
        break;
    }
    
    if (stories && stories.length > 0) {
      console.log(`✅ Generated ${stories.length} stories for ${category}`);
      res.json(stories);
    } else {
      console.log(`⚠️ No stories generated for ${category}, using fallback`);
      const fallbackStory = await generateDirectFallbackStory(category, language);
      res.json([fallbackStory]);
    }
    
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ error: 'Failed to generate stories' });
  }
});

// Grok story generation
async function generateStoriesWithGrok(category, epoch, count, customPrompt, language = 'en') {
  try {
    // Use centralized prompt manager
    const promptManager = require('../utils/promptManager');
    const defaultPrompt = promptManager.getBackendPromptTemplate('grok-4', language)
      .replace('{count}', count)
      .replace('{category}', category)
      .replace('{epoch.toLowerCase()}', epoch.toLowerCase());
    const prompt = customPrompt || defaultPrompt;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `${prompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Grok 4" }]`
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let stories;
    try {
      stories = JSON.parse(content);
    } catch (parseError) {
      console.warn('Grok JSON parse failed:', parseError.message);
      return [];
    }
    
    // Generate TTS for each story
    const storiesWithTTS = await Promise.all(stories.map(async (story) => {
      let ttsAudio = null;
      try {
        // Use centralized prompt manager for TTS voice
        const promptManager = require('../utils/promptManager');
        const voice = promptManager.getTTSVoice(language);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: story.summary,
            voice: voice,
            response_format: 'mp3'
          })
        });
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          ttsAudio = Buffer.from(audioBuffer).toString('base64');
        }
      } catch (ttsError) {
        console.warn('TTS generation failed for Grok story:', ttsError.message);
      }
      
      return {
        ...story,
        publishedAt: new Date().toISOString(),
        ttsAudio: ttsAudio
      };
    }));
    
    return storiesWithTTS;
  } catch (error) {
    console.error(`Grok story generation failed for ${category}:`, error.message);
    return [];
  }
}

// Perplexity story generation
async function generateStoriesWithPerplexity(category, epoch, count, customPrompt, language = 'en') {
  try {
    // Use centralized prompt manager
    const promptManager = require('../utils/promptManager');
    const defaultPrompt = promptManager.getBackendPromptTemplate('perplexity-sonar', language)
      .replace('{count}', count)
      .replace('{category}', category)
      .replace('{epoch.toLowerCase()}', epoch.toLowerCase());
    const prompt = customPrompt || defaultPrompt;
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        stream: false,
        max_tokens: 800,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: `${prompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Perplexity Sonar" }]`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let stories;
    try {
      stories = JSON.parse(content);
    } catch (parseError) {
      console.warn('Perplexity JSON parse failed:', parseError.message);
      return [];
    }
    
    // Generate TTS for each story
    const storiesWithTTS = await Promise.all(stories.map(async (story) => {
      let ttsAudio = null;
      try {
        // Use centralized prompt manager for TTS voice
        const promptManager = require('../utils/promptManager');
        const voice = promptManager.getTTSVoice(language);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: story.summary,
            voice: voice,
            response_format: 'mp3'
          })
        });
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          ttsAudio = Buffer.from(audioBuffer).toString('base64');
        }
      } catch (ttsError) {
        console.warn('TTS generation failed for Perplexity story:', ttsError.message);
      }
      
      return {
        ...story,
        publishedAt: new Date().toISOString(),
        ttsAudio: ttsAudio
      };
    }));
    
    return storiesWithTTS;
  } catch (error) {
    console.error(`Perplexity story generation failed for ${category}:`, error.message);
    return [];
  }
}

// Azure OpenAI story generation
async function generateStoriesWithAzureOpenAI(category, epoch, count, customPrompt, language = 'en') {
  try {
    // Use centralized prompt manager
    const promptManager = require('../utils/promptManager');
    const defaultPrompt = promptManager.getBackendPromptTemplate('azure-openai', language)
      .replace('{count}', count)
      .replace('{category}', category)
      .replace('{epoch.toLowerCase()}', epoch.toLowerCase());
    const prompt = customPrompt || defaultPrompt;
    
    const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.AZURE_OPENAI_DEPLOYMENT,
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
        max_tokens: 800,
        temperature: 0.7
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
      console.warn('Azure OpenAI JSON parse failed:', parseError.message);
      return [];
    }
    
    // Generate TTS for each story
    const storiesWithTTS = await Promise.all(stories.map(async (story) => {
      let ttsAudio = null;
      try {
        // Use centralized prompt manager for TTS voice
        const promptManager = require('../utils/promptManager');
        const voice = promptManager.getTTSVoice(language);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: story.summary,
            voice: voice,
            response_format: 'mp3'
          })
        });
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          ttsAudio = Buffer.from(audioBuffer).toString('base64');
        }
      } catch (ttsError) {
        console.warn('TTS generation failed for Azure OpenAI story:', ttsError.message);
      }
      
      return {
        ...story,
        publishedAt: new Date().toISOString(),
        ttsAudio: ttsAudio
      };
    }));
    
    return storiesWithTTS;
  } catch (error) {
    console.error(`Azure OpenAI story generation failed for ${category}:`, error.message);
    return [];
  }
}

// Gemini story generation (placeholder)
async function generateStoriesWithGemini(category, epoch, count, customPrompt, language = 'en') {
  // Placeholder for Gemini integration
  return [];
}

// Direct fallback story generation
async function generateDirectFallbackStory(category, language = 'en') {
  try {
    console.log(`📝 Generating direct fallback story for ${category}...`);
    
    // Use centralized prompt manager
    const promptManager = require('../utils/promptManager');
    const storyData = promptManager.getFallbackStory(category, language);

    // Generate TTS for the fallback story
    let ttsAudio = null;
    try {
      // Use centralized prompt manager for TTS voice
      const voice = promptManager.getTTSVoice(language);
      
      const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
        method: 'POST',
        headers: {
          'api-key': process.env.AZURE_OPENAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
          input: storyData.summary,
          voice: voice,
          response_format: 'mp3'
        })
      });
      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        ttsAudio = Buffer.from(audioBuffer).toString('base64');
      }
    } catch (ttsError) {
      console.warn('TTS generation failed for direct fallback:', ttsError.message);
    }

    return {
      headline: storyData.headline,
      summary: storyData.summary,
      fullText: storyData.fullText,
      source: storyData.source,
      publishedAt: new Date().toISOString(),
      ttsAudio: ttsAudio
    };

  } catch (error) {
    console.error(`Failed to generate direct fallback story for ${category}:`, error.message);
    
    // Return a basic fallback story if all else fails
    return language === 'es' ? {
      headline: `Noticias Positivas de ${category}`,
      summary: `Cosas increíbles están sucediendo en ${category.toLowerCase()} que inspiran esperanza y progreso.`,
      fullText: `El campo de ${category.toLowerCase()} continúa mostrando un progreso notable y desarrollos positivos. Estos avances demuestran el increíble potencial para el cambio positivo y la innovación en nuestro mundo.`,
      source: 'IA Generado',
      publishedAt: new Date().toISOString(),
      ttsAudio: null
    } : {
      headline: `Positive ${category} News`,
      summary: `Great things are happening in ${category.toLowerCase()} that inspire hope and progress.`,
      fullText: `The field of ${category.toLowerCase()} continues to show remarkable progress and positive developments. These advances demonstrate the incredible potential for positive change and innovation in our world.`,
      source: 'AI Generated',
      publishedAt: new Date().toISOString(),
      ttsAudio: null
    };
  }
}

// Memory endpoints
app.post('/api/memory/store', async (req, res) => {
  try {
    const { userId, content, category } = req.body;
    
    if (!memoryService) {
      return res.status(503).json({ error: 'Memory service not available' });
    }
    
    await memoryService.storeMemory(userId, content, category);
    res.json({ success: true });
  } catch (error) {
    console.error('Memory store error:', error);
    res.status(500).json({ error: 'Failed to store memory' });
  }
});

app.get('/api/memory/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { query, limit = 5 } = req.query;
    
    if (!memoryService) {
      return res.status(503).json({ error: 'Memory service not available' });
    }
    
    const memories = await memoryService.searchMemories(userId, query, parseInt(limit));
    res.json(memories);
  } catch (error) {
    console.error('Memory search error:', error);
    res.status(500).json({ error: 'Failed to search memories' });
  }
});

// Cache management endpoints
app.get('/api/cache/stats', async (req, res) => {
  try {
    if (!storyCacheService) {
      return res.json({ error: 'Cache service not available' });
    }
    
    const stats = await storyCacheService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

app.delete('/api/cache/clear', async (req, res) => {
  try {
    if (!storyCacheService) {
      return res.json({ error: 'Cache service not available' });
    }
    
    await storyCacheService.clearCache();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Helper function to check if memory service is ready
function isMemoryServiceReady() {
  return memoryService !== null;
}

// Initialize server
async function initializeServer() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI not set. Advanced memory features will be disabled.');
  } else {
    try {
      console.log('Initializing AdvancedMemoryService...');
      memoryService = new AdvancedMemoryService(mongoUri);
      await memoryService.initialize();
      console.log('✅ AdvancedMemoryService initialized successfully.');
      
      // Initialize sample memories for default user
      await initializeSampleMemories();
      
      // Load analytics from the database
      await loadAnalyticsCache();
      // Initialize PositiveNewsService
      console.log('Initializing PositiveNewsService...');
      positiveNewsService = new PositiveNewsService(mongoUri);
      await positiveNewsService.initialize();
      console.log('✅ PositiveNewsService initialized successfully.');
      
      // Initialize StoryCacheService
      console.log('Initializing StoryCacheService...');
      storyCacheService = new StoryCacheService();
      await storyCacheService.connect();
      console.log('✅ StoryCacheService initialized successfully.');
    } catch (error) {
      console.error('❌ Failed to initialize AdvancedMemoryService or PositiveNewsService:', error.message);
      memoryService = null;
      positiveNewsService = null;
    }
  }
  
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY) {
    console.warn('⚠️ AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY not set. Azure OpenAI integration will be disabled.');
  } else {
    try {
      console.log('Initializing Azure OpenAI client...');
      console.log('Endpoint:', AZURE_OPENAI_ENDPOINT);
      console.log('Deployment:', AZURE_OPENAI_DEPLOYMENT);
      console.log('API Version:', "2024-12-01-preview");
      
      azureOpenAIClient = new OpenAIClient(
        AZURE_OPENAI_ENDPOINT,
        new AzureKeyCredential(AZURE_OPENAI_API_KEY),
        {
          apiVersion: "2024-12-01-preview"
        }
      );
      console.log('✅ Azure OpenAI client initialized successfully');
    } catch (openaiError) {
      console.error('❌ Failed to initialize Azure OpenAI client:', openaiError.message);
      azureOpenAIClient = null;
    }
  }
}

// Start the server immediately
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orb Game Enhanced Backend running on port ${PORT}`);
});

// Initialize services in the background
initializeServer().catch(error => {
  console.error('Background initialization failed:', error);
  console.log('Server continues running with basic functionality...');
});

// On shutdown, close memory service
process.on('SIGINT', async () => {
  if (memoryService) await memoryService.close();
  if (storyCacheService) await storyCacheService.disconnect();
  process.exit();
});

export default app; 