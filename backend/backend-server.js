import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import AdvancedMemoryService from './advanced-memory-service.js';

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

// Strictly required environment variables
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';
const AZURE_OPENAI_TTS_DEPLOYMENT = process.env.AZURE_OPENAI_TTS_DEPLOYMENT || 'gpt-4o-mini-tts';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

app.use(express.json({ limit: '10mb' }));

// Initialize advanced memory service
let memoryService;
let azureOpenAIClient;

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

// Add in-memory stats for demo with sample data
let totalChats = 47;
let totalWebSearches = 12;
let questionCounts = {
  'what': 8,
  'can': 6,
  'you': 12,
  'do': 5,
  'tell': 4,
  'me': 9,
  'joke': 3,
  'about': 4,
  'weather': 2,
  'today': 3,
  'news': 2,
  'latest': 2,
  'technology': 3,
  'ai': 5,
  'help': 4,
  'thanks': 2,
  'cool': 2,
  'awesome': 1,
  'music': 2,
  'travel': 1
};
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
  memoryRetrievalRate: '85%',
  averageResponseTime: '2.3s',
  searchRate: '25%'
};

async function loadAnalyticsCache() {
  if (!memoryService) return;
  try {
    // Aggregate all memories from all users
    const users = await memoryService.users.find({ "memories": { $exists: true, $ne: [] } }).toArray();
    let allMemories = [];
    let wordCounts = {};
    let webSearchCount = 0;
    users.forEach(user => {
      if (user.memories) {
        allMemories = allMemories.concat(user.memories);
        user.memories.forEach(memory => {
          // Count words for trending topics
          const words = (memory.content || '').toLowerCase().split(/\W+/);
          words.forEach(word => {
            if (word.length > 3) {
              wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
          });
          // Heuristic: count web search if memory mentions 'search' or 'news'
          if ((memory.content || '').toLowerCase().includes('search') || (memory.content || '').toLowerCase().includes('news')) {
            webSearchCount++;
          }
        });
      }
    });
    const totalChats = allMemories.length;
    const totalWebSearches = webSearchCount;
    const mostPopular = Object.entries(wordCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
    const mostAccessedMemories = topWords;
    const averageWordsPerMessage = totalChats > 0 ?
      Math.round((allMemories.reduce((sum, m) => sum + (m.content ? m.content.split(' ').length : 0), 0) / totalChats) * 10) / 10 : 0;
    const searchPercentage = totalChats > 0 ? Math.round((totalWebSearches / totalChats) * 100) : 0;
    analyticsCache = {
      totalChats,
      totalWebSearches,
      mostPopular,
      topWords,
      averageWordsPerMessage,
      searchPercentage,
      funFact: funFacts[Math.floor(Math.random() * funFacts.length)],
      uptime: Date.now() - startTime,
      lastUpdated: new Date().toISOString(),
      mostAccessedMemories,
      memoryRetrievalRate: '85%',
      averageResponseTime: '2.3s',
      searchRate: searchPercentage + '%'
    };
    console.log('✅ Analytics cache loaded:', analyticsCache);
  } catch (err) {
    console.warn('⚠️ Failed to load analytics cache:', err.message);
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
  res.json(analyticsCache);
});

// Enhanced memory profile endpoint with comprehensive user data
app.get('/api/memory/profile', (req, res) => {
  // In a real app, fetch from MongoDB Atlas using userId
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
app.get('/api/memory/stats', (req, res) => {
  const topWords = Object.entries(questionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word, count]) => ({ word, count }));
    
  const stats = {
    totalMemories: totalChats,
    totalUsage: totalChats * 2, // Rough estimate
    storageUsed: `${Math.round((totalChats * 0.5) * 100) / 100} KB`,
    averageMemorySize: '0.5 KB',
    memoryRetrievalRate: '85%',
    mostAccessedMemories: topWords,
    memoryAccuracy: '92%',
    lastMemoryUpdate: new Date().toISOString(),
    memorySystemStatus: 'Active and Healthy'
  };
  res.json(stats);
});

// Memory search endpoint
app.post('/api/memory/search', async (req, res) => {
  try {
    const { query, userId = 'default-user', limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let memories = [];
    if (memoryService) {
      try {
        memories = await memoryService.getRelevantMemories(query, limit);
      } catch (error) {
        console.warn('Memory search failed:', error.message);
      }
    }

    res.json({
      success: true,
      memories: memories.map(memory => ({
        id: memory.id,
        userMessage: memory.content.split(' - ')[0] || memory.content,
        aiResponse: memory.content.split(' - ')[1] || '',
        score: 0.85, // Mock similarity score
        usageCount: 1,
        timestamp: memory.created_at
      })),
      count: memories.length
    });
  } catch (error) {
    console.error('Memory search error:', error);
    res.status(500).json({ error: 'Memory search failed' });
  }
});

// Memory export endpoint
app.get('/api/memory/export', async (req, res) => {
  try {
    let memories = [];
    if (memoryService) {
      try {
        // Get all memories for default user
        const user = await memoryService.users.findOne({ userId: 'default-user' });
        if (user && user.memories) {
          memories = user.memories.map(memory => ({
            key: memory.content.split(' - ')[0] || memory.content,
            content: memory.content.split(' - ')[1] || memory.content,
            created_at: memory.created_at,
            metadata: {
              timestamp: memory.created_at,
              usageCount: 1,
              searchUsed: false
            }
          }));
        }
      } catch (error) {
        console.warn('Memory export failed:', error.message);
      }
    }

    res.json(memories);
  } catch (error) {
    console.error('Memory export error:', error);
    res.status(500).json({ error: 'Memory export failed' });
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
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [{
              role: 'user',
              content: `Search for current information about: ${message}`
            }],
            max_tokens: 200
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
  try {
    // Initialize Azure OpenAI client with correct API version
    console.log('🔧 Initializing Azure OpenAI client...');
    console.log('Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
    console.log('Deployment:', process.env.AZURE_OPENAI_DEPLOYMENT);
    console.log('API Version:', "2024-12-01-preview");
    
    azureOpenAIClient = new OpenAIClient(
      process.env.AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY),
      {
        apiVersion: "2024-12-01-preview"
      }
    );
    console.log('✅ Azure OpenAI client initialized successfully');

    // Initialize memory service with error handling
    try {
      memoryService = new AdvancedMemoryService(process.env.MONGO_URI);
      await memoryService.initialize();
      console.log('✅ Memory service initialized successfully');
      
      // Add sample memories for demo
      await initializeSampleMemories();
    } catch (memoryError) {
      console.warn('⚠️ Memory service initialization failed:', memoryError.message);
      console.log('Continuing without memory service...');
      memoryService = null;
    }

    // Enhanced chat endpoint is now defined outside the async function

    // Web search decisions endpoint
    app.get('/api/analytics/search-decisions', (req, res) => {
      res.json({
        totalSearches: totalWebSearches,
        searchRate: totalChats > 0 ? (totalWebSearches / totalChats * 100).toFixed(1) + '%' : '0%'
      });
    });

  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

// Start the server immediately
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AIMCS Enhanced Backend running on port ${PORT}`);
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