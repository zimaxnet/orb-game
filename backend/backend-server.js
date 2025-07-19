console.log("Starting backend server - Version 2025-07-19-0515");

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import dotenv from 'dotenv';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

// Load environment variables from .env file
dotenv.config();

import AdvancedMemoryService from './advanced-memory-service.js';
import PositiveNewsService from './positive-news-service.js';

const app = express();
const port = process.env.PORT || 3000;

// --- Key Vault Setup ---
async function initializeSecrets() {
  const keyVaultName = process.env.KEY_VAULT_NAME;
  if (keyVaultName) {
    console.log(`Initializing secrets from Azure Key Vault: ${keyVaultName}`);
    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(`https://${keyVaultName}.vault.azure.net`, credential);

      // Fetch secrets and set them as environment variables
      const [azureOpenaiApiKey, perplexityApiKey, mongoUri, geminiApiKey, grokApiKey] = await Promise.all([
          client.getSecret("AZURE-OPENAI-API-KEY"),
          client.getSecret("PERPLEXITY-API-KEY"),
          client.getSecret("MONGO-URI"),
          client.getSecret("GEMINI-API-KEY"),
          client.getSecret("GROK-API-KEY")
      ]);

      process.env.AZURE_OPENAI_API_KEY = azureOpenaiApiKey.value;
      process.env.PERPLEXITY_API_KEY = perplexityApiKey.value;
      process.env.MONGO_URI = mongoUri.value;
      process.env.GEMINI_API_KEY = geminiApiKey.value;
      process.env.GROK_API_KEY = grokApiKey.value;

      console.log("Successfully loaded secrets from Azure Key Vault.");
    } catch (error) {
      console.error("Failed to load secrets from Azure Key Vault:", error);
      // Depending on the desired behavior, you might want to exit the process
      // process.exit(1);
    }
  } else {
    console.log("KEY_VAULT_NAME not set, skipping Key Vault initialization (development mode).");
  }
}

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

// Strictly required environment variables
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';
const AZURE_OPENAI_TTS_DEPLOYMENT = process.env.AZURE_OPENAI_TTS_DEPLOYMENT || 'gpt-4o-mini-tts';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;

app.use(express.json({ limit: '10mb' }));

// Initialize advanced memory service
let memoryService;
let azureOpenAIClient;
let positiveNewsService;

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
    message: 'AIMCS Backend API',
    version: '1.0.1',
    status: 'running',
    endpoints: ['/api/chat', '/api/analytics/summary', '/api/memory/profile', '/health'],
    build: '2025-07-13-21:55'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'AIMCS Backend API',
    version: '1.0.1',
    endpoints: ['/api/chat', '/api/analytics/summary', '/api/memory/profile', '/health'],
    build: '2025-07-13-21:55'
  });
});

// In-memory stats for tracking
let totalChats = 0;
let totalWebSearches = 0;
let questionCounts = {};
const startTime = Date.now();
const funFacts = [
  "Did you know? AIMCS can speak over 20 languages!",
  "Fun fact: The first chatbot was created in 1966.",
  "AIMCS loves puns and dad jokes! Try asking for one.",
  "You can ask AIMCS to remember your favorite color!"
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
  if (!memoryService || !memoryService.users) {
    console.warn('⚠️ Memory service or users collection not available for analytics cache loading.');
    return;
  }
  try {
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
    console.warn('⚠️ Failed to load analytics cache:', err.message);
  }
}

// Enhanced analytics summary endpoint with comprehensive data
app.get('/api/analytics/summary', (req, res) => {
  // Ensure uptime is current
  analyticsCache.uptime = Date.now() - startTime;
  res.json(analyticsCache);
});

// Enhanced memory profile endpoint with comprehensive user data
app.get('/api/memory/profile', (req, res) => {
  // In a real app, fetch from Azure Cosmos DB for MongoDB using userId
  const profile = {
    name: 'AIMCS User',
    favoriteColor: 'blue',
    interests: ['AI', 'music', 'travel', 'technology', 'learning'],
    funFact: 'You once asked AIMCS to tell a joke about robots!',
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
    const systemPrompt = `You are AIMCS (AI Multimodal Customer System), a friendly, engaging, and proactive AI assistant with personality!

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
    const needsSearch = searchKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    let searchResults = '';
    if (needsSearch) {
      try {
        const searchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
                  body: JSON.stringify({
          model: 'sonar',
          messages: [{
            role: 'user',
            content: `Search for current information about: ${message}`
          }],
          max_completion_tokens: 200
        })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          searchResults = searchData.choices[0].message.content;
          totalWebSearches++;
        }
      } catch (searchError) {
        console.warn('Web search failed:', searchError.message);
      }
    }

    // Combine search results with user message
    const fullMessage = searchResults 
      ? `${message}\n\nCurrent information: ${searchResults}`
      : message;

    // Get AI response using Azure OpenAI
    let aiResponse = '';
    console.log('🤖 Attempting Azure OpenAI call...');
    console.log('Client available:', !!azureOpenAIClient);
    
    if (azureOpenAIClient) {
      try {
        console.log('📤 Sending request to Azure OpenAI...');
        const chatResponse = await azureOpenAIClient.getChatCompletions(
          process.env.AZURE_OPENAI_DEPLOYMENT,
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
        aiResponse = `Hey there! 👋 I'm AIMCS, your friendly AI assistant. "${message}" sounds interesting! What can I help you with today?`;
      }
    } else {
      console.warn('⚠️ Azure OpenAI client not available');
      aiResponse = `Hey there! 👋 I'm AIMCS, your friendly AI assistant. "${message}" sounds interesting! What can I help you with today?`;
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
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: aiResponse,
            voice: 'alloy',
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

async function initializeSampleMemories() {
  try {
    if (!memoryService) return;
    
    const sampleMemories = [
      {
        content: "What can you do? - I'm AIMCS, your friendly AI assistant! I can help with questions, tell jokes, search the web for current info, and even remember our conversations. What would you like to explore? 😊",
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
        content: "How does web search work? - I use Perplexity's API to find current information when you ask about recent events, news, or real-time data. It's like having a super-smart research assistant! 🔍",
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

      // --- Periodically refresh analytics cache ---
      setInterval(() => {
        loadAnalyticsCache();
      }, 60000); // every 60 seconds

    } catch (error) {
      console.error('❌ Failed to initialize AdvancedMemoryService or PositiveNewsService:', error);
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

  // Enhanced chat endpoint is now defined outside the async function

  // Web search decisions endpoint
  app.get('/api/analytics/search-decisions', (req, res) => {
    res.json({
      totalSearches: totalWebSearches,
      searchRate: totalChats > 0 ? (totalWebSearches / totalChats * 100).toFixed(1) + '%' : '0%'
    });
  });

}

// --- Server Initialization ---
async function startServer() {
  await initializeSecrets();

  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware setup...
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '50mb' }));
  app.use(morgan('dev'));
  app.use(helmet());

  // API routes...

  app.listen(port, () => {
    console.log(`AIMCS Enhanced Backend running on port ${port}`);
    initializeServer(); // This will run in the background
  });
}

startServer().catch(error => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});



// On shutdown, close memory service
process.on('SIGINT', async () => {
  if (memoryService) await memoryService.close();
  process.exit();
});

// New endpoint: Get a random positive news story (with TTS) by category
app.get('/api/orb/positive-news/:category', async (req, res) => {
  const category = req.params.category;
  const count = parseInt(req.query.count) || 3;  // Allow client to specify number of stories
  const epoch = req.query.epoch || 'Modern';
  
  // If positive news service is not available, generate fallback content directly
  if (!positiveNewsService) {
    console.log(`📝 Positive news service not available, generating fallback for ${category}...`);
    try {
      const fallbackStory = await generateDirectFallbackStory(category);
      res.json([fallbackStory]);  // Return as array
    } catch (error) {
      console.error('Failed to generate direct fallback story:', error);
      res.status(500).json({ error: 'Failed to generate positive news content' });
    }
    return;
  }
  
  try {
    const stories = await positiveNewsService.getStoriesForCycling(category, count, epoch);
    if (stories.length === 0) {
      const fallbackStory = await positiveNewsService.generateFallbackStory(category);
      res.json([fallbackStory]);
    } else {
      res.json(stories);
    }
  } catch (error) {
    console.error('Positive news endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch positive news' });
  }
});

// New endpoint: Generate fresh stories from AI models
app.post('/api/orb/generate-news/:category', async (req, res) => {
  const category = req.params.category;
  const { epoch = 'Modern', model = 'o4-mini', count = 3, prompt } = req.body;
  
  console.log(`🤖 Generating fresh stories for ${category} using ${model} for ${epoch} epoch...`);
  
  try {
    let stories = [];
    
    // Generate stories based on the selected model
    switch (model) {
      case 'grok-4':
        stories = await generateStoriesWithGrok(category, epoch, count, prompt);
        break;
      case 'perplexity-sonar':
        stories = await generateStoriesWithPerplexity(category, epoch, count, prompt);
        break;
      case 'gemini-1.5-flash':
        stories = await generateStoriesWithGemini(category, epoch, count, prompt);
        break;
      case 'o4-mini':
      default:
        stories = await generateStoriesWithAzureOpenAI(category, epoch, count, prompt);
        break;
    }
    
    if (stories.length === 0) {
      console.log(`⚠️ No stories generated for ${category}, using fallback...`);
      const fallbackStory = await generateDirectFallbackStory(category);
      stories = [fallbackStory];
    }
    
    console.log(`✅ Generated ${stories.length} stories for ${category}`);
    res.json(stories);
    
  } catch (error) {
    console.error(`❌ Error generating stories for ${category}:`, error.message);
    res.status(500).json({ error: 'Failed to generate stories' });
  }
});

// Helper functions to generate stories with different AI models
async function generateStoriesWithGrok(category, epoch, count, customPrompt) {
  try {
    const defaultPrompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries.`;
    const prompt = customPrompt || defaultPrompt;
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative assistant for the Orb Game, an AI-powered multimodal gaming system. Your role is to generate positive, engaging news stories for a specified category and epoch. Create fascinating, optimistic stories that fit the requested category and epoch. The story should include a headline (short, catchy title), a summary (1-2 sentences), and full text (a detailed, vivid narrative). Ensure the content is positive, inspiring, and suitable for text-to-speech narration. Format the response as a JSON array with fields: headline, summary, fullText, source (set to "Grok 4"), and publishedAt (current timestamp in ISO format). Avoid negative or controversial topics, and focus on innovation, progress, or human achievement.'
          },
          {
            role: 'user',
            content: `${prompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Grok 4" }]`
          }
        ],
        stream: false,
        temperature: 0,
        max_completion_tokens: 1500
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
        console.log(`🎵 Generating TTS for Grok story: "${story.summary.substring(0, 50)}..."`);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: story.summary,
            voice: 'alloy',
            response_format: 'mp3'
          })
        });
        
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          ttsAudio = Buffer.from(audioBuffer).toString('base64');
          console.log(`✅ TTS generated successfully for Grok story`);
        } else {
          const errorText = await ttsResponse.text();
          console.warn(`⚠️ TTS generation failed for Grok story: ${ttsResponse.status} - ${errorText}`);
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

async function generateStoriesWithPerplexity(category, epoch, count, customPrompt) {
  try {
    const defaultPrompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries.`;
    const prompt = customPrompt || defaultPrompt;
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
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
        console.log(` Generating TTS for Perplexity story: "${story.summary.substring(0, 50)}..."`);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: story.summary,
            voice: 'alloy',
            response_format: 'mp3'
          })
        });
        
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          ttsAudio = Buffer.from(audioBuffer).toString('base64');
          console.log(`✅ TTS generated successfully for Perplexity story`);
        } else {
          const errorText = await ttsResponse.text();
          console.warn(`⚠️ TTS generation failed for Perplexity story: ${ttsResponse.status} - ${errorText}`);
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

async function generateStoriesWithGemini(category, epoch, count, customPrompt) {
  try {
    const defaultPrompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries.`;
    const prompt = customPrompt || defaultPrompt;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Gemini 1.5 Flash" }]`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    let stories;
    try {
      stories = JSON.parse(content);
    } catch (parseError) {
      console.warn('Gemini JSON parse failed:', parseError.message);
      return [];
    }
    
    // Generate TTS for each story
    const storiesWithTTS = await Promise.all(stories.map(async (story) => {
      let ttsAudio = null;
      try {
        console.log(`🎵 Generating TTS for Gemini story: "${story.summary.substring(0, 50)}..."`);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: story.summary,
            voice: 'alloy',
            response_format: 'mp3'
          })
        });
        
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          ttsAudio = Buffer.from(audioBuffer).toString('base64');
          console.log(`✅ TTS generated successfully for Gemini story`);
        } else {
          const errorText = await ttsResponse.text();
          console.warn(`⚠️ TTS generation failed for Gemini story: ${ttsResponse.status} - ${errorText}`);
        }
      } catch (ttsError) {
        console.warn('TTS generation failed for Gemini story:', ttsError.message);
      }
      
      return {
        ...story,
        publishedAt: new Date().toISOString(),
        ttsAudio: ttsAudio
      };
    }));
    
    return storiesWithTTS;
  } catch (error) {
    console.error(`Gemini story generation failed for ${category}:`, error.message);
    return [];
  }
}

async function generateStoriesWithAzureOpenAI(category, epoch, count, customPrompt) {
  try {
    const defaultPrompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries.`;
    const prompt = customPrompt || defaultPrompt;
    
    const requestBody = {
      model: 'o4-mini',
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
      max_completion_tokens: 1500
    };
    const requestHeaders = {
      'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    };
    console.log('Azure OpenAI API request details:', {
      url: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-12-01-preview`,
      headers: requestHeaders,
      body: requestBody
    });
    let response;
    try {
      response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-12-01-preview`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      });
    } catch (fetchError) {
      console.error('Fetch/network error calling Azure OpenAI API:', fetchError);
      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure OpenAI API error details for ${category}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        url: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-12-01-preview`,
        apiKey: process.env.AZURE_OPENAI_API_KEY ? `${process.env.AZURE_OPENAI_API_KEY.substring(0, 10)}...` : 'missing',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT
      });
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
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
        console.log(`🎵 Generating TTS for story: "${story.summary.substring(0, 50)}..."`);
        
        const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
            input: story.summary,
            voice: 'alloy',
            response_format: 'mp3'
          })
        });
        
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          ttsAudio = Buffer.from(audioBuffer).toString('base64');
          console.log(`✅ TTS generated successfully for story`);
        } else {
          const errorText = await ttsResponse.text();
          console.warn(`⚠️ TTS generation failed for story: ${ttsResponse.status} - ${errorText}`);
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

// Helper function to generate fallback stories when service is not available
async function generateDirectFallbackStory(category) {
  try {
    const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/o4-mini/chat/completions?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'o4-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates engaging, positive news stories. Always focus on uplifting and inspiring content.'
          },
          {
            role: 'user',
            content: `Create a positive news story about ${category}. Return the story in this exact JSON format:
{
  "headline": "Brief, engaging headline",
  "summary": "One sentence summary of the story",
  "fullText": "2-3 sentence detailed story with positive tone",
  "source": "AI Generated"
}`
          }
        ],
        max_completion_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Direct fallback API error details for ${category}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        url: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/o4-mini/chat/completions?api-version=2024-12-01-preview`,
        apiKey: process.env.AZURE_OPENAI_API_KEY ? `${process.env.AZURE_OPENAI_API_KEY.substring(0, 10)}...` : 'missing'
      });
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let storyData;
    try {
      storyData = JSON.parse(content);
    } catch (parseError) {
      console.warn(`Failed to parse direct fallback story for ${category}:`, parseError.message);
      storyData = {
        headline: `Positive ${category} Development`,
        summary: `Exciting progress is being made in ${category.toLowerCase()} that brings hope and innovation.`,
        fullText: `Recent developments in ${category.toLowerCase()} show promising advances that could benefit many people. This positive trend demonstrates the power of human ingenuity and collaboration.`,
        source: 'AI Generated'
      };
    }

    // Generate TTS for the fallback story
    let ttsAudio = null;
    try {
      console.log(`🎵 Generating TTS for direct fallback story: "${storyData.summary.substring(0, 50)}..."`);
      
      const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
        method: 'POST',
        headers: {
          'api-key': process.env.AZURE_OPENAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
          input: storyData.summary,
          voice: 'alloy',
          response_format: 'mp3'
        })
      });
      
      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        ttsAudio = Buffer.from(audioBuffer).toString('base64');
        console.log(`✅ TTS generated successfully for direct fallback story`);
      } else {
        const errorText = await ttsResponse.text();
        console.warn(`⚠️ TTS generation failed for direct fallback story: ${ttsResponse.status} - ${errorText}`);
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
    return {
      headline: `Positive ${category} News`,
      summary: `Great things are happening in ${category.toLowerCase()} that inspire hope and progress.`,
      fullText: `The field of ${category.toLowerCase()} continues to show remarkable progress and positive developments. These advances demonstrate the incredible potential for positive change and innovation in our world.`,
      source: 'AI Generated',
      publishedAt: new Date().toISOString(),
      ttsAudio: null
    };
  }
}

// Helper to check if memory service is fully ready
function isMemoryServiceReady() {
  return memoryService && memoryService.users;
}