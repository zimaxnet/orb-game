import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import OpenAI from 'openai';
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
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'AIMCS Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: ['/api/chat', '/api/analytics/summary', '/api/memory/profile', '/health']
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'AIMCS Backend API',
    version: '1.0.0',
    endpoints: ['/api/chat', '/api/analytics/summary', '/api/memory/profile', '/health']
  });
});

// Add in-memory stats for demo
let totalChats = 0;
let totalWebSearches = 0;
let questionCounts = {};
const funFacts = [
  "Did you know? AIMCS can speak over 20 languages!",
  "Fun fact: The first chatbot was created in 1966.",
  "AIMCS loves puns and dad jokes! Try asking for one.",
  "You can ask AIMCS to remember your favorite color!"
];

// Analytics summary endpoint (moved outside async function)
app.get('/api/analytics/summary', (req, res) => {
  const mostPopular = Object.entries(questionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const funFact = funFacts[Math.floor(Math.random() * funFacts.length)];
  res.json({
    totalChats,
    totalWebSearches,
    mostPopular,
    funFact
  });
});

// Memory profile endpoint (moved outside async function)
app.get('/api/memory/profile', (req, res) => {
  // In a real app, fetch from MongoDB Atlas using userId
  const profile = {
    name: 'AIMCS User',
    favoriteColor: 'blue',
    interests: ['AI', 'music', 'travel'],
    funFact: 'You once asked AIMCS to tell a joke about robots!',
    lastTopics: ['fun activities', 'jokes', 'analytics']
  };
  res.json(profile);
});

async function initializeServer() {
  try {
    // Initialize Azure OpenAI client
    azureOpenAIClient = new OpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });

    // Initialize memory service with error handling
    try {
      memoryService = new AdvancedMemoryService(process.env.MONGO_URI);
      await memoryService.initialize();
      console.log('✅ Memory service initialized successfully');
    } catch (memoryError) {
      console.warn('⚠️ Memory service initialization failed:', memoryError.message);
      console.log('Continuing without memory service...');
      memoryService = null;
    }

    // Enhanced chat endpoint with memory
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

        // Enhanced system prompt with personality
        const systemPrompt = `You are AIMCS (AI Multimodal Customer System), a friendly and engaging AI assistant with a warm personality. You love to:

- Be proactive and engaging
- Use humor and dad jokes when appropriate
- Keep responses short and conversational (under 30 words)
- Show genuine interest in users
- Remember personal details when possible

Current conversation context: ${memoryContext}

Always respond in a friendly, helpful tone. Keep it short and sweet!`;

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

        // Get AI response
        const chatResponse = await azureOpenAIClient.chat.completions.create({
          model: process.env.AZURE_OPENAI_DEPLOYMENT,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullMessage }
          ],
          max_tokens: 150,
          temperature: 0.7
        });

        const aiResponse = chatResponse.choices[0].message.content;

        // Store in memory if available
        if (memoryService) {
          try {
            await memoryService.storeMemory(message, aiResponse);
          } catch (memoryError) {
            console.warn('Memory storage failed:', memoryError.message);
          }
        }

        // Generate TTS audio
        const ttsResponse = await azureOpenAIClient.audio.speech.create({
          model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
          voice: 'alloy',
          input: aiResponse
        });

        let audioBuffer = Buffer.alloc(0);
        for await (const chunk of ttsResponse.body) {
          audioBuffer = Buffer.concat([audioBuffer, chunk]);
        }
        const audioData = audioBuffer.toString('base64');

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