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
        await memoryService.storeMemory('default-user', message, aiResponse);
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