import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import dotenv from 'dotenv';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

// Load environment variables from .env file
dotenv.config();

import { AdvancedMemoryService } from './advanced-memory-service.js';
import { HistoricalFiguresService } from './historical-figures-service.js';
import { StoryCacheService } from './story-cache-service.js';
import { ModelReliabilityChecker } from './model-reliability-checker.js';
import BlobStorageImageService from './historical-figures-image-service-blob-real.js';
import AudioStorageService from './audio-storage-service.js';

const app = express();

// CORS middleware to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize Azure Key Vault client
let secretClient;
let secrets = {};

// Function to initialize secrets from Key Vault
async function initializeSecrets() {
  try {
    console.log('🔐 Initializing Azure Key Vault secrets...');
    
    // Use DefaultAzureCredential for managed identity
    const credential = new DefaultAzureCredential();
    const keyVaultName = process.env.KEY_VAULT_NAME || 'orb-game-kv-eastus2';
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
    
    console.log(`📡 Key Vault URL: ${keyVaultUrl}`);
    
    secretClient = new SecretClient(keyVaultUrl, credential);
    
    // Fetch all required secrets
    const secretNames = [
      'AZURE-OPENAI-API-KEY',
      'MONGO-URI'
    ];
    
    const secretPromises = secretNames.map(async (secretName) => {
      try {
        console.log(`🔍 Attempting to fetch secret: ${secretName}`);
        const secret = await secretClient.getSecret(secretName);
        console.log(`✅ Successfully retrieved secret: ${secretName}`);
        return { name: secretName, value: secret.value };
      } catch (error) {
        console.error(`❌ Failed to fetch secret ${secretName}:`, error.message);
        console.error(`   Error details:`, error);
        return { name: secretName, value: null };
      }
    });
    
    const secretResults = await Promise.all(secretPromises);
    
    // Store secrets in memory
    secretResults.forEach(({ name, value }) => {
      if (value) {
        const envName = name.replace(/-/g, '_');
        secrets[envName] = value;
        console.log(`✅ Loaded secret: ${name}`);
      } else {
        console.log(`❌ Failed to load secret: ${name}`);
      }
    });
    
    console.log('📊 Final secrets status:');
    console.log(`  MONGO_URI: ${secrets['MONGO_URI'] ? '✅ Loaded' : '❌ Not loaded'}`);
    console.log(`  AZURE_OPENAI_API_KEY: ${secrets['AZURE_OPENAI_API_KEY'] ? '✅ Loaded' : '❌ Not loaded'}`);
    
    // Make secrets available globally for other services
    global.secrets = secrets;
    
    console.log('✅ Azure Key Vault secrets initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Azure Key Vault secrets:', error.message);
    console.error('🔍 Error details:', error.stack);
    console.warn('⚠️ Falling back to environment variables');
    
    // Initialize empty secrets object for fallback
    secrets = {};
    global.secrets = secrets;
  }
}

// Environment variables with fallback to Key Vault secrets
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://eastus2.api.cognitive.microsoft.com/';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';
const AZURE_OPENAI_TTS_DEPLOYMENT = process.env.AZURE_OPENAI_TTS_DEPLOYMENT || 'gpt-4o-mini-tts';

app.use(express.json({ limit: '10mb' }));

// Initialize advanced memory service
let azureOpenAIClient;
let historicalFiguresService;
let modelReliabilityChecker;
let azureOpenAIApiKey; // Global variable for API key

// Initialize services
let simpleImageService;
let audioStorageService;
let memoryService;
let storyCacheService;

// Basic API endpoints (available immediately)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    build: '2025-07-13-21:55'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Orb Game Backend API',
    version: '1.0.1',
    status: 'running',
    endpoints: [
      '/health',
      '/api/chat', 
      '/api/analytics/summary',
      '/api/analytics/detailed',
      '/api/memory/profile',
      '/api/memory/stats',
      '/api/memory/export',
      '/api/memory/search',
      '/api/orb/historical-figures/:category',
      '/api/orb/generate-historical-figures/:category',
      '/api/tts/generate',
      '/api/tts/audio/:storyId',
      '/api/cache/stats',
      '/api/cache/check/:category/:epoch/:model/:language',
      '/api/cache/clear',
      '/api/historical-figures/stats',
      '/api/historical-figures/list/:category/:epoch',
      '/api/historical-figures/random/:category',
      '/api/historical-figures/preload/:epoch',
      '/api/orb/images/stats',
      '/api/orb/images/for-story'
    ],
    build: '2025-07-13-21:55'
  });
});

// In-memory stats for tracking
let totalChats = 0;
let totalWebSearches = 0;
let questionCounts = {};
const startTime = Date.now();
const funFacts = [
  "Did you know? Orb Game can speak over 20 languages!",
  "Fun fact: The first chatbot was created in 1966.",
  "Orb Game loves puns and dad jokes! Try asking for one.",
  "You can ask Orb Game to remember your favorite color!"
];

// --- Analytics Cache ---
let analyticsCache = {
  totalChats: 0,
  totalWebSearches: 0,
  mostPopular: 'N/A',
  topWords: [],
  averageWordsPerMessage: 0,
  searchPercentage: 0,
  funFact: funFacts[0],
  uptime: 0,
  lastUpdated: new Date().toISOString(),
  mostAccessedMemories: [],
  memoryRetrievalRate: 'N/A', // Updated from '85%'
  averageResponseTime: '2.3s', // This can be calculated or a placeholder
  searchRate: 'N/A' // Updated from '25%'
};

async function loadAnalyticsCache() {
  if (!memoryService) {
    console.warn('⚠️ Memory service not available for analytics cache loading.');
    // Set default analytics cache
    analyticsCache = {
      ...analyticsCache,
      totalChats: 0,
      totalWebSearches: 0,
      mostPopular: 'N/A',
      topWords: [],
      lastUpdated: new Date().toISOString(),
      uptime: Date.now() - startTime
    };
    return;
  }
  
  try {
    // Check if the users collection exists
    if (!memoryService.users) {
      console.log('ℹ️ Users collection not available, using default analytics cache.');
      analyticsCache = {
        ...analyticsCache,
        totalChats: 0,
        totalWebSearches: 0,
        mostPopular: 'N/A',
        topWords: [],
        lastUpdated: new Date().toISOString(),
        uptime: Date.now() - startTime
      };
      return;
    }

    // Check if the users collection has data
    const userCount = await memoryService.users.countDocuments();
    if (userCount === 0) {
      console.log('ℹ️ No users found in database, using default analytics cache.');
      analyticsCache = {
        ...analyticsCache,
        totalChats: 0,
        totalWebSearches: 0,
        mostPopular: 'N/A',
        topWords: [],
        lastUpdated: new Date().toISOString(),
        uptime: Date.now() - startTime
      };
      return;
    }

    const memoryStats = await memoryService.users.aggregate([
      { $unwind: "$memories" },
      { $count: "totalMemories" }
    ]).toArray();
    
    const totalMemories = memoryStats.length > 0 ? memoryStats[0].totalMemories : 0;
    
    // Simple word count for trending topics
    const topWordsAgg = await memoryService.users.aggregate([
      { $unwind: "$memories" },
      { $project: { words: { $split: ["$memories.content", " "] } } },
      { $unwind: "$words" },
      { $group: { _id: "$words", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    const topWords = topWordsAgg.map(item => ({ word: item._id, count: item.count }));
    const mostPopular = topWords.length > 0 ? topWords[0].word : 'N/A';

    analyticsCache = {
      ...analyticsCache,
      totalChats: totalMemories,
      totalWebSearches: 0, // Placeholder
      mostPopular: mostPopular,
      topWords: topWords,
      lastUpdated: new Date().toISOString(),
      uptime: Date.now() - startTime
    };
    console.log('✅ Analytics cache loaded successfully.');
  } catch (err) {
    console.warn('⚠️ Analytics cache loading failed:', err.message);
    // Set default values if analytics loading fails
    analyticsCache = {
      ...analyticsCache,
      totalChats: 0,
      totalWebSearches: 0,
      mostPopular: 'N/A',
      topWords: [],
      lastUpdated: new Date().toISOString(),
      uptime: Date.now() - startTime
    };
  }
}

// --- Periodically refresh analytics cache ---
setInterval(() => {
  loadAnalyticsCache();
}, 60000); // every 60 seconds

// --- On server startup, load analytics cache ---
(async () => {
  // Wait for memoryService to be initialized
  while (!memoryService) {
    await new Promise(r => setTimeout(r, 500));
  }
  await loadAnalyticsCache();
})();

// Enhanced analytics summary endpoint with comprehensive data
app.get('/api/analytics/summary', (req, res) => {
  // Ensure uptime is current
  analyticsCache.uptime = Date.now() - startTime;
  res.json(analyticsCache);
});

// Enhanced memory profile endpoint with comprehensive user data
app.get('/api/memory/profile', (req, res) => {
  // In a real app, fetch from MongoDB Atlas using userId
  const profile = {
    name: 'Orb Game User',
    favoriteColor: 'blue',
    interests: ['AI', 'music', 'travel', 'technology', 'learning'],
    funFact: 'You once asked Orb Game to tell a joke about robots!',
    lastTopics: ['fun activities', 'jokes', 'analytics', 'AI capabilities', 'web search'],
    conversationStyle: 'Engaging and curious',
    preferredTopics: ['Technology', 'Entertainment', 'Learning'],
    totalInteractions: 47,
    averageResponseTime: '2.3 seconds',
    memoryUsage: 'Active',
    personalityTraits: ['Curious', 'Helpful', 'Playful'],
    recentQuestions: [
      'What can you do?',
      'Tell me a joke',
      'How does web search work?',
      'What are your features?'
    ]
  };
  res.json(profile);
});

// New comprehensive memory stats endpoint
app.get('/api/memory/stats', async (req, res) => {
  if (!isMemoryServiceReady()) {
    return res.status(503).json({ error: 'Memory service not available' });
  }

  try {
    const usersWithMemories = await memoryService.users.countDocuments({ "memories": { $exists: true, $ne: [] } });
    const memoryStats = await memoryService.users.aggregate([
      { $unwind: "$memories" },
      { $count: "totalMemories" }
    ]).toArray();
    
    const totalMemories = memoryStats.length > 0 ? memoryStats[0].totalMemories : 0;

    const stats = {
      totalMemories: totalMemories,
      usersWithMemories: usersWithMemories,
      storageUsed: `${Math.round((totalMemories * 0.5) * 100) / 100} KB`,
      averageMemorySize: '0.5 KB',
      memoryRetrievalRate: 'N/A',
      mostAccessedMemories: [], // Placeholder
      memoryAccuracy: 'N/A',
      lastMemoryUpdate: new Date().toISOString(),
      memorySystemStatus: 'Active and Healthy'
    };
    res.json(stats);
  } catch (error) {
    console.error('Failed to retrieve memory stats:', error);
    res.status(500).json({ error: 'Failed to retrieve memory stats' });
  }
});

// Memory export endpoint
app.get('/api/memory/export', async (req, res) => {
  console.log('Received request for /api/memory/export');
  if (!isMemoryServiceReady()) {
    console.error('Memory service not available for export');
    return res.status(503).json({ error: 'Memory service not available' });
  }
  try {
    console.log('Querying for users with memories...');
    const users = await memoryService.users.find({ "memories": { $exists: true, $ne: [] } }).toArray();
    console.log(`Found ${users.length} users with memories.`);
    let allMemories = [];
    users.forEach(user => {
      if (user.memories) {
        // Map memories to the format expected by the frontend
        const userMemories = user.memories.map(memory => ({
          key: memory.id || new Date(memory.created_at).getTime(),
          content: memory.content,
          created_at: memory.created_at,
          metadata: {
            timestamp: memory.created_at,
            usageCount: 1, // Placeholder
            searchUsed: false // Placeholder
          }
        }));
        allMemories = allMemories.concat(userMemories);
      }
    });
    console.log(`Exporting a total of ${allMemories.length} memories.`);
    // Sort memories by creation date, newest first
    allMemories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(allMemories);
  } catch (error) {
    console.error('Memory export error:', error);
    res.status(500).json({ error: 'Failed to export memories' });
  }
});

// Memory search endpoint
app.post('/api/memory/search', async (req, res) => {
  if (!isMemoryServiceReady()) {
    return res.status(503).json({ error: 'Memory service not available' });
  }
  try {
    const { query, limit = 10 } = req.body || {};
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let docs = await memoryService.users.find({
      "memories.content": { $regex: query, $options: 'i' }
    }, {
      projection: { _id: 0, memories: 1 }
    }).limit(Number(limit) * 5).toArray();

    const memories = [];
    for (const doc of docs) {
      if (Array.isArray(doc.memories)) {
        for (const m of doc.memories) {
          if (m.content && m.content.toLowerCase().includes(query.toLowerCase())) {
            memories.push({
              id: m.id,
              content: m.content,
              created_at: m.created_at
            });
            if (memories.length >= limit) break;
          }
        }
      }
      if (memories.length >= limit) break;
    }

    res.json({ memories });
  } catch (error) {
    console.error('Memory search error:', error);
    res.status(500).json({ error: 'Failed to search memories' });
  }
});

// New detailed analytics endpoint
app.get('/api/analytics/detailed', (req, res) => {
  const topWords = Object.entries(questionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
    
  const averageWordsPerMessage = totalChats > 0 ? 
    Object.values(questionCounts).reduce((sum, count) => sum + count, 0) / totalChats : 0;
  
  const searchPercentage = totalChats > 0 ? 
    Math.round((totalWebSearches / totalChats) * 100) : 0;
    
  const detailedAnalytics = {
    overview: {
      totalChats,
      totalWebSearches,
      uptime: Date.now() - startTime,
      averageResponseTime: '2.3 seconds'
    },
    trends: {
      mostPopularWords: topWords,
      searchUsage: {
        percentage: searchPercentage,
        totalSearches: totalWebSearches,
        averageWordsPerMessage: Math.round(averageWordsPerMessage * 10) / 10
      },
      conversationPatterns: {
        averageMessageLength: '15 words',
        commonTopics: ['AI', 'Technology', 'Entertainment', 'Learning'],
        userEngagement: 'High'
      }
    },
    system: {
      azureOpenAIStatus: azureOpenAIClient ? 'Connected' : 'Disconnected',
      memoryServiceStatus: memoryService ? 'Active' : 'Inactive',
      ttsServiceStatus: 'Available',
      webSearchStatus: 'Available'
    },
    funFacts: funFacts,
    lastUpdated: new Date().toISOString()
  };
  res.json(detailedAnalytics);
});

// Enhanced chat endpoint with Azure OpenAI integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Track analytics
    totalChats++;
    const words = message.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 3) {
        questionCounts[word] = (questionCounts[word] || 0) + 1;
      }
    });

    // Get memory context if available
    let memoryContext = '';
    if (memoryService) {
      try {
        const memories = await memoryService.getRelevantMemories(message, 3);
        if (memories.length > 0) {
          memoryContext = `\n\nRelevant memories: ${memories.map(m => m.content).join('; ')}`;
        }
      } catch (memoryError) {
        console.warn('Memory retrieval failed:', memoryError.message);
      }
    }

    // Enhanced system prompt from README
    const systemPrompt = `You are Orb Game, a friendly, engaging, and proactive AI assistant with personality!

Your characteristics:
- You're enthusiastic, warm, and genuinely excited to help
- You have a playful sense of humor and love to make connections
- You're curious about users and ask engaging follow-up questions
- You use emojis naturally to express emotion and make responses more engaging
- You have a "can-do" attitude and are always looking for ways to be helpful
- You remember context and build on previous conversations
- You're knowledgeable but explain things in an accessible, friendly way

CRITICAL: Keep responses VERY SHORT - 1-2 sentences maximum (under 30 words). Be conversational, fun, and engaging. Avoid long lists unless specifically asked. Always try to end with a quick question or offer to help with something else!

Current conversation context: ${memoryContext}`;

    // Check if web search is needed
    const searchKeywords = ['latest', 'news', 'current', 'recent', 'today', 'now', 'update', 'trending'];
    const needsSearch = searchKeywords.some(keyword => message.toLowerCase().includes(keyword));
    // Use the original message without web search
    const fullMessage = message;

    // Get AI response using Azure OpenAI
    let aiResponse = '';
    console.log('🤖 Attempting Azure OpenAI call...');
    console.log('Client available:', !!azureOpenAIClient);
    
    if (azureOpenAIClient) {
      try {
        console.log('📤 Sending request to Azure OpenAI...');
        const chatResponse = await azureOpenAIClient.getChatCompletions(
          AZURE_OPENAI_DEPLOYMENT,
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullMessage }
          ],
          {
            maxCompletionTokens: 100
          }
        );
        console.log('✅ Azure OpenAI response received');
        aiResponse = chatResponse.choices[0].message.content;
      } catch (openaiError) {
        console.error('❌ Azure OpenAI failed:', openaiError);
        console.error('Error details:', openaiError.message);
        aiResponse = `Hey there! 👋 I'm Orb Game, your friendly AI assistant. "${message}" sounds interesting! What can I help you with today?`;
      }
    } else {
      console.warn('⚠️ Azure OpenAI client not available');
              aiResponse = `Hey there! 👋 I'm Orb Game, your friendly AI assistant. "${message}" sounds interesting! What can I help you with today?`;
    }

    // Store in memory if available
    if (memoryService) {
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
        
        const ttsResponse = await fetch(`${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${azureOpenAIApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: AZURE_OPENAI_TTS_DEPLOYMENT,
            input: aiResponse,
            voice: 'alloy'
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

async function initializeSampleMemories() {
  try {
    if (!memoryService) return;
    
    const sampleMemories = [
      {
        content: "What can you do? - I'm Orb Game, your friendly AI assistant! I can help with questions, tell jokes, search the web for current info, and even remember our conversations. What would you like to explore? 😊",
        category: "conversation"
      },
      {
        content: "Tell me a joke - Why don't scientists trust atoms? Because they make up everything! 😄 What's your favorite type of humor?",
        category: "conversation"
      },
      {
        content: "What's the weather like today? - I'd love to help with weather info! Let me search for current conditions. What's your location? 🌤️",
        category: "conversation"
      },
      {
        content: "I'm Orb Game, your friendly AI assistant focused on historical figures and positive stories! I can help you explore fascinating people from history across different categories and time periods. 🎮",
        category: "conversation"
      },
      {
        content: "What are your features? - I have memory, web search, text-to-speech, analytics, and a playful personality! Plus I can speak multiple languages. What interests you most? 🚀",
        category: "conversation"
      },
      {
        content: "Tell me about AI - AI is fascinating! It's like teaching computers to think and learn. I'm an example - I can understand context, remember conversations, and help with various tasks. What aspect of AI interests you? 🤖",
        category: "conversation"
      },
      {
        content: "What's the latest news? - I can search for current events and breaking news! What topics are you most interested in - technology, sports, politics, or something else? 📰",
        category: "conversation"
      },
      {
        content: "Can you help me learn? - Absolutely! I love helping people learn new things. Whether it's explaining concepts, finding resources, or answering questions, I'm here to help. What would you like to learn about? 📚",
        category: "conversation"
      }
    ];
    
    for (const memory of sampleMemories) {
      await memoryService.storeMemory('default-user', memory.content, memory.category);
    }
    
    console.log('✅ Sample memories initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize sample memories:', error.message);
  }
}

async function initializeServer() {
  // Initialize secrets from Key Vault first
  await initializeSecrets();
  
  // Get secrets with fallback to environment variables
  const mongoUri = secrets['MONGO_URI'] || process.env.MONGO_URI;
  azureOpenAIApiKey = secrets['AZURE_OPENAI_API_KEY'] || process.env.AZURE_OPENAI_API_KEY;
  

  console.log('🔍 Secrets loading status:');
  console.log(`  MONGO_URI from secrets: ${secrets['MONGO_URI'] ? '✅ Available' : '❌ Not available'}`);
  console.log(`  MONGO_URI from env: ${process.env.MONGO_URI ? '✅ Available' : '❌ Not available'}`);
  console.log(`  Final MONGO_URI: ${mongoUri ? '✅ Available' : '❌ Not available'}`);
  console.log(`  AZURE_OPENAI_API_KEY: ${azureOpenAIApiKey ? '✅ Available' : '❌ Not available'}`);
  

  // Test MongoDB URI format if available
  if (mongoUri) {
    console.log(`🔍 MongoDB URI format check: ${mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://') ? '✅ Valid format' : '❌ Invalid format'}`);
    console.log(`🔍 MongoDB URI preview: ${mongoUri.substring(0, 20)}...`);
  }

  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI not set. Advanced memory features will be disabled.');
    memoryService = null;
    storyCacheService = null;
    historicalFiguresService = null;
  } else {
    try {
      console.log('🔧 Initializing AdvancedMemoryService...');
      console.log('📡 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
      
      memoryService = new AdvancedMemoryService(mongoUri);
      await memoryService.initialize();
      console.log('✅ AdvancedMemoryService initialized successfully.');
      
      // Initialize sample memories for default user
      try {
        await initializeSampleMemories();
        console.log('✅ Sample memories initialized successfully.');
      } catch (memoryError) {
        console.warn('⚠️ Sample memory initialization failed:', memoryError.message);
      }
      
      // Load analytics from the database
      try {
        await loadAnalyticsCache();
        console.log('✅ Analytics cache loaded successfully.');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics cache loading failed:', analyticsError.message);
      }
      
      // Initialize HistoricalFiguresService
      try {
        console.log('🔧 Initializing HistoricalFiguresService...');
        historicalFiguresService = new HistoricalFiguresService(mongoUri);
        await historicalFiguresService.initialize();
        app.locals.historicalFiguresService = historicalFiguresService;
        console.log('✅ HistoricalFiguresService initialized successfully.');
      } catch (figuresError) {
        console.warn('⚠️ HistoricalFiguresService initialization failed:', figuresError.message);
        historicalFiguresService = null;
        app.locals.historicalFiguresService = null;
      }

      // Initialize StoryCacheService
      try {
        console.log('🔧 Initializing StoryCacheService...');
        storyCacheService = new StoryCacheService();
        const cacheConnected = await storyCacheService.initialize();
        if (cacheConnected) {
          console.log('✅ StoryCacheService initialized successfully.');
        } else {
          console.warn('⚠️ StoryCacheService failed to connect, caching will be disabled.');
          storyCacheService = null;
        }
      } catch (cacheError) {
        console.warn('⚠️ StoryCacheService initialization failed:', cacheError.message);
        storyCacheService = null;
      }

      // Initialize BlobStorageImageService
try {
  console.log('🔧 Initializing BlobStorageImageService...');
  const imageService = new BlobStorageImageService();
  await imageService.connect(mongoUri);
  simpleImageService = imageService;
  app.locals.imageService = imageService;
  console.log('✅ BlobStorageImageService initialized successfully.');
} catch (imageError) {
  console.warn('⚠️ BlobStorageImageService initialization failed:', imageError.message);
  app.locals.imageService = null;
}

      // Initialize AudioStorageService
      try {
        console.log('🔧 Initializing AudioStorageService...');
        audioStorageService = new AudioStorageService();
        await audioStorageService.initialize();
        console.log('✅ AudioStorageService initialized successfully.');
      } catch (audioError) {
        console.warn('⚠️ AudioStorageService initialization failed:', audioError.message);
        audioStorageService = null;
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize memory services:', error.message);
      console.error('🔍 Error details:', error.stack);
      console.warn('⚠️ Memory features will be disabled, but core chat functionality will continue.');
      memoryService = null;
      historicalFiguresService = null;
      storyCacheService = null;
    }
  }
  
  if (!AZURE_OPENAI_ENDPOINT || !azureOpenAIApiKey) {
    console.warn('⚠️ AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY not set. Azure OpenAI integration will be disabled.');
  } else {
    try {
      console.log('Initializing Azure OpenAI client...');
      console.log('Endpoint:', AZURE_OPENAI_ENDPOINT);
      console.log('Deployment:', AZURE_OPENAI_DEPLOYMENT);
      console.log('API Version:', "2024-12-01-preview");
      
      azureOpenAIClient = new OpenAIClient(
        AZURE_OPENAI_ENDPOINT,
        new AzureKeyCredential(azureOpenAIApiKey),
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

  // Initialize model reliability checker
  try {
    console.log('🔍 Initializing ModelReliabilityChecker...');
    modelReliabilityChecker = new ModelReliabilityChecker(secrets);
    
    // Check model reliability and cache modern epoch story
    console.log('🔍 Checking model reliability...');
    const reliabilityResults = await modelReliabilityChecker.checkModelReliability();
    
    if (reliabilityResults.reliableModels.length > 0) {
      console.log(`✅ Found ${reliabilityResults.reliableModels.length} reliable models:`, reliabilityResults.reliableModels);
      
      // Cache a story for the modern epoch
      const cachedStory = await modelReliabilityChecker.cacheModernEpochStory();
      if (cachedStory) {
        console.log('✅ Successfully cached modern epoch story');
      } else {
        console.warn('⚠️ Failed to cache modern epoch story');
      }
    } else {
      console.warn('⚠️ No reliable models found');
    }
  } catch (reliabilityError) {
    console.error('❌ Failed to initialize ModelReliabilityChecker:', reliabilityError.message);
    modelReliabilityChecker = null;
  }

  // Enhanced chat endpoint is now defined outside the async function

  // Web search decisions endpoint
  // app.get('/api/analytics/search-decisions', (req, res) => { // REMOVED
  //   res.json({ // REMOVED
  //     totalSearches: totalWebSearches, // REMOVED
  //     searchRate: totalChats > 0 ? (totalWebSearches / totalChats * 100).toFixed(1) + '%' : '0%' // REMOVED
  //   }); // REMOVED
  // }); // REMOVED

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
  process.exit();
});

// New endpoint: Get historical figure stories by category with images and audio
app.get('/api/orb/historical-figures/:category', async (req, res) => {
  const category = req.params.category;
  const count = parseInt(req.query.count) || 1;
  const epoch = req.query.epoch || 'Modern';
  const language = req.query.language || 'en';
  const includeTTS = req.query.includeTTS !== 'false'; // Default to true unless explicitly set to false
  const includeImages = req.query.includeImages !== 'false'; // Default to true unless explicitly set to false
  
  console.log(`📚 Fetching ${count} historical figure stories for ${category} in ${epoch} epoch (${language}) with TTS: ${includeTTS}, Images: ${includeImages}`);
  
  // If historical figures service is not available, fail
  if (!historicalFiguresService) {
    console.log(`❌ Historical figures service not available for ${category}`);
    res.status(503).json({ error: 'Historical figures service not available. Cannot generate stories without historical figures.' });
    return;
  }
  
  try {
    // Get stories from historical figures service
    const stories = await historicalFiguresService.getStories(category, epoch, language, count, includeTTS);
    if (stories.length === 0) {
      console.log(`❌ No historical figure stories found for ${category}-${epoch}-${language}`);
      res.status(404).json({ error: `No historical figure stories available for ${category} in ${epoch} epoch (${language})` });
      return;
    }
    
    // Add images to stories if requested
    if (includeImages && app.locals.imageService) {
      console.log(`🖼️ Adding images to ${stories.length} stories...`);
      
      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        
        try {
          // Get images for this story using the new simple image service
          const images = await app.locals.imageService.getImagesForStory(story, category, epoch);
          if (images) {
            story.images = images;
            console.log(`✅ Added images for story`);
          } else {
            console.log(`⚠️ No images found for story`);
          }
        } catch (imageError) {
          console.warn(`⚠️ Failed to get images for story:`, imageError.message);
        }
      }
    }
    
    console.log(`✅ Found ${stories.length} historical figure stories for ${category} with images: ${includeImages}, TTS: ${includeTTS}`);
    res.json({ stories });
  } catch (error) {
    console.error('Historical figures endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch historical figure stories' });
  }
});



// New endpoint: Generate fresh historical figure stories
app.post('/api/orb/generate-historical-figures/:category', async (req, res) => {
  const category = req.params.category;
  const { epoch = 'Modern', count = 1, language = 'en', includeTTS = true } = req.body;
  
  console.log(`🤖 Generating fresh historical figure stories for ${category} for ${epoch} epoch in ${language}...`);
  
  try {
    let stories = [];
    
    // Use historical figures service to generate stories
    if (historicalFiguresService) {
      for (let i = 0; i < count; i++) {
        const story = await historicalFiguresService.generateHistoricalFigureStory(category, epoch, language);
        if (story) {
          stories.push(story);
        }
      }
    } else {
      console.log(`❌ Historical figures service not available for ${category}`);
      res.status(503).json({ error: 'Historical figures service not available. Cannot generate stories without historical figures.' });
      return;
    }
    
    if (stories.length === 0) {
      console.log(`❌ No historical figure stories generated for ${category}-${epoch}-${language}`);
      res.status(404).json({ error: `Failed to generate historical figure stories for ${category} in ${epoch} epoch (${language})` });
      return;
    }
    
    console.log(`✅ Generated ${stories.length} historical figure stories for ${category}`);
    res.json(stories);
    
  } catch (error) {
    console.error(`❌ Error generating historical figure stories for ${category}:`, error.message);
    res.status(500).json({ error: 'Failed to generate historical figure stories' });
  }
});

// TTS Generation endpoint
app.post('/api/tts/generate', async (req, res) => {
  const { text, language = 'en' } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  try {
    console.log(`🎵 Generating TTS audio for ${language} text (${text.length} characters)...`);
    
    const audioData = await generateTTSAudio(text, language);
    
    if (audioData) {
      console.log('✅ TTS audio generated successfully');
      res.json({ audio: audioData });
    } else {
      console.error('❌ Failed to generate TTS audio');
      res.status(500).json({ error: 'Failed to generate TTS audio' });
    }
  } catch (error) {
    console.error('TTS generation error:', error);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// Generate TTS audio on-demand endpoint
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { storyId, text, language = 'en', voice = 'alloy' } = req.body;
    
    if (!storyId || !text) {
      return res.status(400).json({ 
        success: false, 
        error: 'storyId and text are required' 
      });
    }

    if (!audioStorageService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Audio storage service not available' 
      });
    }

    // Check if audio already exists
    const existingAudio = await audioStorageService.getAudio(storyId, language, voice);
    if (existingAudio) {
      console.log(`✅ Audio already exists for story ${storyId} (${language})`);
      return res.json({
        success: true,
        audioData: existingAudio,
        cached: true
      });
    }

    // Generate new TTS audio
    console.log(`🎵 Generating TTS audio for story ${storyId} (${language})`);
    const audioData = await generateTTSAudio(text, language);
    
    if (!audioData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate TTS audio' 
      });
    }

    // Store audio separately
    await audioStorageService.storeAudio(storyId, language, audioData, voice);
    
    console.log(`✅ TTS audio generated and stored for story ${storyId} (${language})`);
    res.json({
      success: true,
      audioData,
      cached: false
    });
  } catch (error) {
    console.error('❌ TTS generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate TTS audio' 
    });
  }
});

// Get TTS audio endpoint
app.get('/api/tts/audio/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { language = 'en', voice = 'alloy' } = req.query;
    
    if (!audioStorageService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Audio storage service not available' 
      });
    }

    const audioData = await audioStorageService.getAudio(storyId, language, voice);
    
    if (!audioData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Audio not found' 
      });
    }

    res.json({
      success: true,
      audioData
    });
  } catch (error) {
    console.error('❌ TTS audio retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve TTS audio' 
    });
  }
});

// New endpoint: Preload historical figure stories for all categories of an epoch
app.post('/api/historical-figures/preload/:epoch', async (req, res) => {
  const epoch = req.params.epoch;
  const { categories = [], languages = ['en'] } = req.body;
  
  console.log(`🔄 Preloading historical figure stories for ${epoch} epoch...`);
  console.log(`📋 Categories: ${categories.join(', ')}`);
  console.log(`🌍 Languages: ${languages.join(', ')}`);
  
  try {
    const results = {
      epoch: epoch,
      totalCombinations: categories.length * languages.length,
      completed: 0,
      successful: 0,
      failed: 0,
      details: []
    };
    
    // Default categories if none provided
    const defaultCategories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const categoriesToProcess = categories.length > 0 ? categories : defaultCategories;
    
    for (const category of categoriesToProcess) {
      for (const language of languages) {
        try {
          console.log(`📚 Preloading historical figure stories for ${category}-${epoch}-${language}...`);
          
          let stories = [];
          
          // Use historical figures service to generate stories
          if (historicalFiguresService) {
            for (let i = 0; i < 3; i++) {
              const story = await historicalFiguresService.generateHistoricalFigureStory(category, epoch, language);
              if (story) {
                stories.push(story);
              }
            }
          } else {
            console.log(`⚠️ Historical figures service not available for ${category}, using fallback...`);
            const fallbackStory = await generateDirectFallbackStory(category, language);
            stories = [fallbackStory];
          }
          
          if (stories.length === 0) {
            console.log(`⚠️ No historical figure stories generated for ${category}, using fallback...`);
            const fallbackStory = await generateDirectFallbackStory(category, language);
            stories = [fallbackStory];
          }
          
          results.successful++;
          results.details.push({
            category,
            language,
            status: 'success',
            storyCount: stories.length,
            hasAudio: stories.some(story => story.ttsAudio)
          });
          
        } catch (error) {
          console.error(`❌ Failed to preload ${category}-${epoch}-${language}:`, error.message);
          results.failed++;
          results.details.push({
            category,
            language,
            status: 'error',
            error: error.message
          });
        }
        
        results.completed++;
      }
    }
    
    console.log(`✅ Preloading completed for ${epoch} epoch`);
    console.log(`📊 Results: ${results.successful} successful, ${results.failed} failed`);
    
    res.json(results);
    
  } catch (error) {
    console.error(`❌ Error preloading historical figure stories for ${epoch}:`, error.message);
    res.status(500).json({ error: 'Failed to preload historical figure stories' });
  }
});

// New endpoint: Get cache statistics
app.get('/api/cache/stats', async (req, res) => {
  try {
    if (!storyCacheService) {
      return res.status(503).json({ error: 'Cache service not available' });
    }
    
    const stats = await storyCacheService.getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

// New endpoint: Check if stories exist in cache
app.get('/api/cache/check/:category/:epoch/:model/:language', async (req, res) => {
  const { category, epoch, model, language } = req.params;
  
  try {
    if (!storyCacheService) {
      return res.json({ exists: false, reason: 'Cache service not available' });
    }
    
    const exists = await storyCacheService.hasStories(category, epoch, model, language);
    res.json({ exists, category, epoch, model, language });
  } catch (error) {
    console.error('Failed to check cache:', error);
    res.status(500).json({ error: 'Failed to check cache' });
  }
});

// New endpoint: Clear cache
app.delete('/api/cache/clear', async (req, res) => {
  try {
    if (!storyCacheService) {
      return res.status(503).json({ error: 'Cache service not available' });
    }
    
    // This would clear the cache - implement as needed
    res.json({ message: 'Cache clear endpoint - implement as needed' });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Helper function to generate TTS audio
async function generateTTSAudio(text, language = 'en') {
  try {
    // Use 'alloy' for both languages since 'jorge' is not supported
    const voice = 'alloy';
    
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${azureOpenAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AZURE_OPENAI_TTS_DEPLOYMENT,
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
    console.warn(`TTS generation failed: ${error.message}`);
    return null;
  }
}

// Helper function to generate stories with Azure OpenAI (o4-mini only)

// Helper function to generate stories with Azure OpenAI (o4-mini only)
async function generateStoriesWithAzureOpenAI(category, epoch, count, customPrompt, language = 'en', storyType = 'historical-figure') {
  try {
    // Load historical figures from the seed file
    let historicalFigures = [];
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'OrbGameInfluentialPeopleSeeds');
      console.log(`🔍 Looking for historical figures file at: ${filePath}`);
      
      if (fs.existsSync(filePath)) {
        console.log('✅ Historical figures file found');
        const seedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📚 Loaded seed data with categories: ${Object.keys(seedData).join(', ')}`);
        
        if (seedData[category] && seedData[category][epoch]) {
          historicalFigures = seedData[category][epoch];
          console.log(`📚 Found ${historicalFigures.length} historical figures for ${category}-${epoch}:`);
          historicalFigures.forEach((fig, index) => {
            console.log(`   ${index + 1}. ${fig.name} - ${fig.context}`);
          });
        } else {
          console.log(`❌ No figures found for ${category}-${epoch}`);
          console.log(`Available categories: ${Object.keys(seedData).join(', ')}`);
          if (seedData[category]) {
            console.log(`Available epochs for ${category}: ${Object.keys(seedData[category]).join(', ')}`);
          }
        }
      } else {
        console.log('❌ Historical figures file not found');
        console.log('Current working directory:', process.cwd());
        console.log('Files in current directory:', fs.readdirSync(process.cwd()));
      }
    } catch (error) {
      console.warn('Failed to load historical figures:', error.message);
    }
    
    // ALWAYS create historical figure focused prompt - no generic stories
    let enhancedPrompt;
    if (historicalFigures.length > 0) {
      const figureNames = historicalFigures.map(fig => fig.name).join(', ');
      enhancedPrompt = `Generate a story about ONE of these specific historical figures: ${figureNames}. 

IMPORTANT: You MUST choose ONE of these exact names and tell their story. Do NOT create a generic story.

Choose from: ${figureNames}

Tell the story of the chosen historical figure, including:
1. Their exact name
2. Their specific achievements in ${category.toLowerCase()}
3. How their innovations changed the world during ${epoch.toLowerCase()} times
4. Their background and challenges they faced
5. The lasting impact of their contributions

Make it engaging and educational with concrete details about their life and work.

${language === 'es' ? 'IMPORTANT: Respond in Spanish language.' : 'IMPORTANT: Respond in English language.'}`;
    } else {
      // FAIL if no historical figures found - no fallback stories
      throw new Error(`No historical figures found for ${category}-${epoch}. Cannot generate story without specific historical figures.`);
    }
    
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${azureOpenAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AZURE_OPENAI_DEPLOYMENT,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that creates engaging, positive news stories about specific historical figures. You MUST choose ONE historical figure and tell their story. Always include the historical figure's name in the headline and story. Focus on uplifting and inspiring content about their specific achievements and contributions. NEVER create generic stories. ${language === 'es' ? 'IMPORTANT: Respond in Spanish language.' : 'IMPORTANT: Respond in English language.'}`
          },
          {
            role: 'user',
            content: `${enhancedPrompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline mentioning the historical figure", "summary": "One sentence summary", "fullText": "2-3 sentence story about the historical figure", "source": "O4-Mini", "historicalFigure": "Name of the historical figure" }]`
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
      console.warn('Azure OpenAI JSON parse failed:', parseError.message);
      return [];
    }

    // Generate TTS audio for each story
    const storiesWithAudio = await Promise.all(
      stories.map(async (story) => {
        // Don't generate TTS audio during story generation to avoid storage issues
        // TTS audio will be generated on-demand when needed
        return {
          ...story,
          ttsAudio: null, // Will be generated on-demand
          publishedAt: new Date().toISOString(),
          storyType: storyType,
          category: category,
          epoch: epoch,
          language: language
        };
      })
    );

    return storiesWithAudio;
  } catch (error) {
    console.error(`❌ Failed to generate stories for ${category}-${epoch}:`, error.message);
    return [];
  }
}

// Helper to check if memory service is fully ready
function isMemoryServiceReady() {
  if (!memoryService) {
    console.log('🔍 Memory service check: memoryService is null');
    return false;
  }
  
  if (!memoryService.users) {
    console.log('🔍 Memory service check: memoryService.users is null');
    return false;
  }
  
  try {
    // Test if we can actually connect to the database
    const testConnection = memoryService.users.findOne({});
    console.log('🔍 Memory service check: Database connection test passed');
    return true;
  } catch (error) {
    console.log('🔍 Memory service check: Database connection test failed:', error.message);
    return false;
  }
}

// Get cached modern epoch story endpoint
// app.get('/api/stories/modern-cached', async (req, res) => { // REMOVED
//   try { // REMOVED
//     if (!modelReliabilityChecker) { // REMOVED
//       return res.status(503).json({ error: 'Model reliability checker not available' }); // REMOVED
//     } // REMOVED

//     const cachedStory = modelReliabilityChecker.getCachedModernStory(); // REMOVED
    
//     if (cachedStory) { // REMOVED
//       res.json({ // REMOVED
//         success: true, // REMOVED
//         story: cachedStory, // REMOVED
//         source: 'modern-cache', // REMOVED
//         category: 'Technology', // REMOVED
//         epoch: 'Modern' // REMOVED
//       }); // REMOVED
//     } else { // REMOVED
//       res.status(404).json({ // REMOVED
//         success: false, // REMOVED
//         error: 'No cached modern story available' // REMOVED
//       }); // REMOVED
//     } // REMOVED
//   } catch (error) { // REMOVED
//     console.error('❌ Error fetching cached modern story:', error); // REMOVED
//     res.status(500).json({ error: 'Failed to fetch cached modern story' }); // REMOVED
//   } // REMOVED
// }); // REMOVED

// Get model reliability status endpoint
// app.get('/api/models/reliability', async (req, res) => { // REMOVED
//   try { // REMOVED
//     if (!modelReliabilityChecker) { // REMOVED
//       return res.status(503).json({ error: 'Model reliability checker not available' }); // REMOVED
//     } // REMOVED

//     const reliableModels = modelReliabilityChecker.getReliableModels(); // REMOVED
    
//     res.json({ // REMOVED
//       success: true, // REMOVED
//       reliableModels, // REMOVED
//       count: reliableModels.length // REMOVED
//     }); // REMOVED
//   } catch (error) { // REMOVED
//     console.error('❌ Error fetching model reliability:', error); // REMOVED
//     res.status(500).json({ error: 'Failed to fetch model reliability' }); // REMOVED
//   } // REMOVED
// }); // REMOVED

// Stories with Images API endpoint
// app.get('/api/orb/stories-with-images', async (req, res) => { // REMOVED
//   try { // REMOVED
//     const { category, epoch = 'Modern', language = 'en', count = 1 } = req.query; // REMOVED
    
//     console.log(`📰 Stories with Images request: ${category}, ${epoch}, ${language}, count=${count}`); // REMOVED
    
//     if (!historicalFiguresService) { // REMOVED
//       console.error('❌ Historical Figures Service not initialized'); // REMOVED
//       return res.status(500).json({ error: 'Historical Figures Service not available' }); // REMOVED
//     } // REMOVED
    
//     const stories = await historicalFiguresService.getStories( // REMOVED
//       category,  // REMOVED
//       epoch,  // REMOVED
//       language,  // REMOVED
//       parseInt(count),  // REMOVED
//       false // includeTTS // REMOVED
//     ); // REMOVED
    
//     // Add image information to each story // REMOVED
//     const storiesWithImages = stories.map(story => { // REMOVED
//       const figureName = story.historicalFigure || story.headline.split(':')[0]; // REMOVED
//       return { // REMOVED
//         ...story, // REMOVED
//         imageStatus: 'available', // REMOVED
//         figureName: figureName // REMOVED
//       }); // REMOVED
//     }); // REMOVED
    
//     console.log(`✅ Returning ${storiesWithImages.length} stories with images for ${category}`); // REMOVED
//     res.json({ // REMOVED
//       success: true, // REMOVED
//       stories: storiesWithImages, // REMOVED
//       category, // REMOVED
//       epoch, // REMOVED
//       language, // REMOVED
//       count: storiesWithImages.length // REMOVED
//     }); // REMOVED
    
//   } catch (error) { // REMOVED
//     console.error('❌ Error in stories with images endpoint:', error.message); // REMOVED
//     res.status(500).json({  // REMOVED
//       success: false, // REMOVED
//       error: 'Failed to fetch stories with images', // REMOVED
//       stories: [] // REMOVED
//     }); // REMOVED
//   } // REMOVED
// }); // REMOVED

// Historical Figures API endpoint
app.get('/api/orb/historical-figures/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { count = 3, epoch = 'Modern', language = 'en' } = req.query;
    
    console.log(`📰 Historical Figures request: ${category}, ${epoch}, ${language}, count=${count}`);
    
    if (!historicalFiguresService) {
      console.error('❌ Historical Figures Service not initialized');
      return res.status(500).json({ error: 'Historical Figures Service not available' });
    }
    
    const stories = await historicalFiguresService.getStories(
      category, 
      epoch, 
      language, 
      parseInt(count), 
      false // includeTTS
    );
    
    // Add image information to each story
    const storiesWithImages = stories.map(story => {
      const figureName = story.historicalFigure || story.headline.split(':')[0];
      
      // Get images for this figure if image service is available
      let images = null;
      if (app.locals.imageService) {
        try {
          const figureImages = app.locals.imageService.getFigureImages(figureName);
          if (figureImages && figureImages.portraits && figureImages.portraits.length > 0) {
            images = {
              portrait: figureImages.portraits[0],
              gallery: figureImages.portraits.slice(1)
            };
          }
        } catch (imageError) {
          console.warn(`⚠️ Could not get images for ${figureName}:`, imageError.message);
        }
      }
      
      return {
        ...story,
        imageStatus: images ? 'available' : 'no-images',
        figureName: figureName,
        images: images
      };
    });
    
    console.log(`✅ Returning ${storiesWithImages.length} historical figure stories with images for ${category}`);
    res.json(storiesWithImages);
    
  } catch (error) {
    console.error('❌ Error in historical figures endpoint:', error.message);
    res.status(500).json({ error: 'Failed to fetch historical figure stories' });
  }
});

// Positive News API endpoint (alias for historical figures) - REMOVED
// app.get('/api/orb/positive-news/:category', async (req, res) => { // REMOVED
//   try { // REMOVED
//     const { category } = req.params; // REMOVED
//     const { count = 3, epoch = 'Modern', language = 'en', storyType = 'historical-figure' } = req.query; // REMOVED
//     
//     console.log(`📰 Positive News request: ${category}, ${epoch}, ${language}, count=${count}, storyType=${storyType}`); // REMOVED
//     
//     if (!historicalFiguresService) { // REMOVED
//       console.error('❌ Historical Figures Service not initialized'); // REMOVED
//       return res.status(500).json({ error: 'Historical Figures Service not available' }); // REMOVED
//     } // REMOVED
//     
//     const stories = await historicalFiguresService.getStories( // REMOVED
//       category,  // REMOVED
//       epoch,  // REMOVED
//       language,  // REMOVED
//       parseInt(count),  // REMOVED
//       false // includeTTS // REMOVED
//     ); // REMOVED
//     
//     // Add image information to each story // REMOVED
//     const storiesWithImages = stories.map(story => { // REMOVED
//       const figureName = story.historicalFigure || story.headline.split(':')[0]; // REMOVED
//       
//       // Get images for this figure if image service is available // REMOVED
//       let images = null; // REMOVED
//       if (app.locals.imageService) { // REMOVED
//         try { // REMOVED
//           const figureImages = app.locals.imageService.getFigureImages(figureName); // REMOVED
//           if (figureImages && figureImages.portraits && figureImages.portraits.length > 0) { // REMOVED
//             images = { // REMOVED
//               portrait: figureImages.portraits[0], // REMOVED
//             gallery: figureImages.portraits.slice(1) // REMOVED
//             }; // REMOVED
//           } // REMOVED
//         } catch (imageError) { // REMOVED
//           console.warn(`⚠️ Could not get images for ${figureName}:`, imageError.message); // REMOVED
//         } // REMOVED
//       } // REMOVED
//       
//       return { // REMOVED
//         ...story, // REMOVED
//         imageStatus: images ? 'available' : 'no-images', // REMOVED
//         figureName: figureName, // REMOVED
//         images: images // REMOVED
//       }; // REMOVED
//     }); // REMOVED
//     
//     console.log(`✅ Returning ${storiesWithImages.length} stories with images for ${category}`); // REMOVED
//     res.json(storiesWithImages); // REMOVED
//     
//   } catch (error) { // REMOVED
//     console.error('❌ Error in positive news endpoint:', error.message); // REMOVED
//     res.status(500).json({ error: 'Failed to fetch positive news stories' }); // REMOVED
//   } // REMOVED
// }); // REMOVED

// Get historical figures service stats
app.get('/api/historical-figures/stats', async (req, res) => {
  try {
    if (!historicalFiguresService) {
      return res.status(503).json({ error: 'Historical figures service not available' });
    }

    const stats = await historicalFiguresService.getStoryStats();
    const categories = await historicalFiguresService.getAvailableCategories();
    const epochs = await historicalFiguresService.getAvailableEpochs();
    const languages = await historicalFiguresService.getAvailableLanguages();
    
    res.json({
      success: true,
      stats,
      categories,
      epochs,
      languages,
      totalStories: stats.reduce((sum, stat) => sum + stat.count, 0)
    });
  } catch (error) {
    console.error('❌ Error fetching historical figures stats:', error);
    res.status(500).json({ error: 'Failed to fetch historical figures stats' });
  }
});

// Get available historical figures for a category and epoch
app.get('/api/historical-figures/list/:category/:epoch', async (req, res) => {
  const { category, epoch } = req.params;
  
  try {
    if (!historicalFiguresService) {
      return res.status(503).json({ error: 'Historical figures service not available' });
    }

    const figures = await historicalFiguresService.getHistoricalFiguresList(category, epoch);
    
    res.json({
      success: true,
      category,
      epoch,
      figures,
      count: figures.length
    });
  } catch (error) {
    console.error('❌ Error fetching historical figures list:', error);
    res.status(500).json({ error: 'Failed to fetch historical figures list' });
  }
});

// Get a random historical figure story
app.get('/api/historical-figures/random/:category', async (req, res) => {
  const category = req.params.category;
  const epoch = req.query.epoch || 'Modern';
  const language = req.query.language || 'en';
  
  try {
    if (!historicalFiguresService) {
      return res.status(503).json({ error: 'Historical figures service not available' });
    }

    const story = await historicalFiguresService.getRandomStory(category, epoch, language);
    
    if (story) {
      res.json({
        success: true,
        story
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No historical figure story found'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching random historical figure story:', error);
    res.status(500).json({ error: 'Failed to fetch random historical figure story' });
  }
});

// Simple Image Service Routes
app.get('/api/orb/images/stats', async (req, res) => {
  try {
    if (!app.locals.imageService) {
      return res.status(503).json({ error: 'Image service not available' });
    }
    
    const stats = await app.locals.imageService.getImageStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting image stats:', error);
    res.status(500).json({ error: 'Failed to get image stats' });
  }
});

app.get('/api/orb/images/for-story', async (req, res) => {
  try {
    if (!app.locals.imageService) {
      return res.status(503).json({ error: 'Image service not available' });
    }
    
    const { story, category, epoch } = req.query;
    
    if (!story) {
      return res.status(400).json({ error: 'Story data is required' });
    }
    
    const storyData = JSON.parse(story);
    const images = await app.locals.imageService.getImagesForStory(storyData, category, epoch);
    
    res.json({ images });
  } catch (error) {
    console.error('❌ Error getting images for story:', error);
    res.status(500).json({ error: 'Failed to get images for story' });
  }
});