import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import MemoryService from './memory-service.js';

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

// Initialize memory service
const memoryService = new MemoryService();

// Basic API endpoints
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
    endpoints: ['/api/chat', '/api/web-search', '/health']
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'AIMCS Backend API',
    version: '1.0.0',
    endpoints: ['/api/chat', '/api/web-search', '/health']
  });
});

// Dynamic keyword learning system
const dynamicKeywords = {
  baseKeywords: [
    'latest', 'recent', 'today', 'yesterday', 'this week', 'this month',
    'current', 'news', 'update', 'breaking', 'live', 'now',
    'weather', 'stock', 'price', 'market', 'sports', 'score',
    'election', 'politics', 'covid', 'pandemic', 'vaccine',
    '2024', '2025', 'this year', 'last year'
  ],
  trendingKeywords: new Set(),
  userFeedback: new Map(), // Track user feedback on search decisions
  
  // Add trending keywords from external sources
  async updateTrendingKeywords() {
    try {
      // This could fetch from various sources:
      // - Twitter/X trending topics
      // - Google Trends API
      // - News API trending topics
      // - Reddit trending posts
      
      // For now, we'll simulate with some common trending terms
      const trendingTerms = [
        'ai', 'artificial intelligence', 'machine learning',
        'crypto', 'bitcoin', 'ethereum', 'blockchain',
        'climate', 'environment', 'sustainability',
        'space', 'nasa', 'spacex', 'mars',
        'health', 'medical', 'vaccine', 'treatment'
      ];
      
      trendingTerms.forEach(term => this.trendingKeywords.add(term));
      
      console.log(`Updated trending keywords: ${this.trendingKeywords.size} terms`);
    } catch (error) {
      console.error('Error updating trending keywords:', error);
    }
  },
  
  // Get all current keywords (base + trending)
  getAllKeywords() {
    return [...this.baseKeywords, ...this.trendingKeywords];
  },
  
  // Record user feedback on search decisions
  recordFeedback(message, searchUsed, userSatisfaction) {
    const key = message.toLowerCase().substring(0, 50);
    if (!this.userFeedback.has(key)) {
      this.userFeedback.set(key, []);
    }
    this.userFeedback.get(key).push({
      searchUsed,
      userSatisfaction, // 1-5 scale
      timestamp: new Date().toISOString()
    });
  },
  
  // Analyze feedback to improve future decisions
  analyzeFeedback() {
    const feedback = Array.from(this.userFeedback.values()).flat();
    const searchUsedFeedback = feedback.filter(f => f.searchUsed);
    const noSearchFeedback = feedback.filter(f => !f.searchUsed);
    
    const avgSearchSatisfaction = searchUsedFeedback.length > 0 
      ? searchUsedFeedback.reduce((sum, f) => sum + f.userSatisfaction, 0) / searchUsedFeedback.length 
      : 0;
    
    const avgNoSearchSatisfaction = noSearchFeedback.length > 0 
      ? noSearchFeedback.reduce((sum, f) => sum + f.userSatisfaction, 0) / noSearchFeedback.length 
      : 0;
    
    return {
      totalFeedback: feedback.length,
      searchUsedCount: searchUsedFeedback.length,
      avgSearchSatisfaction,
      avgNoSearchSatisfaction,
      recommendation: avgSearchSatisfaction > avgNoSearchSatisfaction ? 'increase' : 'decrease'
    };
  }
};

// Initialize trending keywords on startup
dynamicKeywords.updateTrendingKeywords();

// Update trending keywords every hour
setInterval(() => {
  dynamicKeywords.updateTrendingKeywords();
}, 60 * 60 * 1000);

// AI-powered semantic analysis for web search detection
const analyzeWebSearchNeeds = async (message) => {
  if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT) {
    // Fallback to keyword-based detection if AI is not available
    return needsWebSearchFallback(message);
  }

  try {
    const openaiUrl = 'https://aimcs-foundry.cognitiveservices.azure.com/openai/deployments/o4-mini/chat/completions?api-version=2025-01-01-preview';
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a web search classifier. Analyze if the user's query requires current, real-time, or up-to-date information from the web.

Consider these categories that typically need web search:
1. **Time-sensitive information**: Current events, recent news, today's weather, live sports scores
2. **Dynamic data**: Stock prices, cryptocurrency values, real-time statistics
3. **Breaking news**: Recent developments, ongoing situations, live updates
4. **Current trends**: Popular topics, viral content, recent releases
5. **Location-specific**: Current weather, local events, nearby information
6. **Recent changes**: Policy updates, new releases, recent announcements
7. **Ongoing situations**: Active conflicts, live events, current crises
8. **Fresh data**: Latest research, recent studies, current statistics

Respond with ONLY a JSON object:
{
  "needsWebSearch": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of why web search is needed or not",
  "categories": ["array", "of", "relevant", "categories"]
}

Examples:
- "What's the weather today?" → needsWebSearch: true (time-sensitive, location-specific)
- "How do I make coffee?" → needsWebSearch: false (general knowledge)
- "What's the latest on the election?" → needsWebSearch: true (current events, time-sensitive)
- "What is photosynthesis?" → needsWebSearch: false (static knowledge)`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_completion_tokens: 200,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return {
      needsWebSearch: analysis.needsWebSearch,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      categories: analysis.categories || []
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback to keyword-based detection
    return needsWebSearchFallback(message);
  }
};

// Fallback keyword-based detection (original function)
const needsWebSearchFallback = (message) => {
  const webSearchKeywords = dynamicKeywords.getAllKeywords();
  
  const lowerMessage = message.toLowerCase();
  const hasKeywords = webSearchKeywords.some(keyword => lowerMessage.includes(keyword));
  
  return {
    needsWebSearch: hasKeywords,
    confidence: hasKeywords ? 0.7 : 0.3,
    reasoning: hasKeywords ? 'Keyword match detected' : 'No keywords found',
    categories: hasKeywords ? ['keyword-match'] : []
  };
};

// Helper function to determine if web search is needed (legacy compatibility)
const needsWebSearch = (message) => {
  // For now, use the fallback method for backward compatibility
  // In production, this should be updated to use the AI-powered analysis
  return needsWebSearchFallback(message).needsWebSearch;
};

// Perplexity web search function
const searchWeb = async (query) => {
  if (!PERPLEXITY_API_KEY) {
    console.error('Perplexity API key not configured');
    return null;
  }
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides accurate, up-to-date information from web search. Always cite your sources and provide relevant links when available.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      sources: data.choices[0].message.sources || [],
      searchUsed: true
    };
  } catch (error) {
    console.error('Perplexity search error:', error);
    return null;
  }
};

// Enhanced chat endpoint with memory
app.post('/api/chat', async (req, res) => {
  try {
    const { message, useWebSearch = 'auto', userId = 'default' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT) {
      return res.status(500).json({ error: 'AI not configured' });
    }

    // Check memory first
    const memoryResult = await memoryService.retrieveCompletion(message, userId);
    let aiResponse = '';
    let webSearchData = null;
    let searchUsed = false;
    let fromMemory = false;

    if (memoryResult) {
      // Use cached response from memory
      aiResponse = memoryResult.aiResponse;
      searchUsed = memoryResult.metadata.searchUsed || false;
      fromMemory = true;
      console.log(`Using memory response for: "${message.substring(0, 50)}..."`);
    } else {
      // No memory found, proceed with normal flow
      let searchAnalysis = null;
      let shouldUseWebSearch = false;
      
      if (useWebSearch === 'web') {
        shouldUseWebSearch = true;
      } else if (useWebSearch === 'never') {
        shouldUseWebSearch = false;
      } else if (useWebSearch === 'auto') {
        searchAnalysis = await analyzeWebSearchNeeds(message);
        shouldUseWebSearch = searchAnalysis.needsWebSearch && searchAnalysis.confidence > 0.5;
      }

      // If web search is needed, get current information first
      if (shouldUseWebSearch) {
        webSearchData = await searchWeb(message);
        if (webSearchData) {
          searchUsed = true;
          const enhancedMessage = `${message}\n\nCurrent information from web search:\n${webSearchData.content}`;
          
          const openaiUrl = 'https://aimcs-foundry.cognitiveservices.azure.com/openai/deployments/o4-mini/chat/completions?api-version=2025-01-01-preview';
          const openaiResponse = await fetch(openaiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': AZURE_OPENAI_API_KEY,
            },
            body: JSON.stringify({
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a helpful AI assistant. When provided with web search information, use it to provide accurate, up-to-date responses. Always mention when you are using current information from the web.' 
                },
                { role: 'user', content: enhancedMessage }
              ],
              max_completion_tokens: 1000,
              response_format: { type: 'text' }
            }),
          });
          
          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            aiResponse = openaiData.choices?.[0]?.message?.content || 'No response from AI';
          }
        }
      }

      // If no web search was used or it failed, use regular AI response
      if (!searchUsed) {
        const openaiUrl = 'https://aimcs-foundry.cognitiveservices.azure.com/openai/deployments/o4-mini/chat/completions?api-version=2025-01-01-preview';
        const openaiResponse = await fetch(openaiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a helpful AI assistant.' },
              { role: 'user', content: message }
            ],
            max_completion_tokens: 1000,
            response_format: { type: 'text' }
          }),
        });
        
        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          return res.status(500).json({ error: `OpenAI error: ${openaiResponse.status} - ${errorText}` });
        }
        
        const openaiData = await openaiResponse.json();
        aiResponse = openaiData.choices?.[0]?.message?.content || 'No response from AI';
      }

      // Store the new completion in memory (only for non-memory responses)
      await memoryService.storeCompletion(message, aiResponse, {
        userId: userId,
        searchUsed: searchUsed,
        audioGenerated: false, // Will be updated below
        model: 'gpt-4o-mini',
        tokens: aiResponse.length // Approximate token count
      });
    }

    // 2. Get audio from gpt-4o-mini-tts
    let audioData = null;
    let audioFormat = null;
    try {
      const ttsUrl = 'https://aimcs-foundry.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview';
      const ttsResponse = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          input: aiResponse,
          voice: 'alloy',
          response_format: 'mp3'
        }),
      });
      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        audioData = Buffer.from(audioBuffer).toString('base64');
        audioFormat = 'audio/mp3';
      }
    } catch (ttsError) {
      // If TTS fails, just skip audio
    }

    const response = {
      id: Date.now().toString(),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      searchUsed: searchUsed,
      originalMessage: message,
      fromMemory: fromMemory, // New field indicating if response came from memory
      searchAnalysis: searchAnalysis || null // Include AI analysis results (null if from memory)
    };
    
    if (audioData) {
      response.audioData = audioData;
      response.audioFormat = audioFormat;
    }
    
    if (webSearchData && webSearchData.sources) {
      response.searchResults = webSearchData.sources;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for web search only
app.post('/api/web-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const searchResult = await searchWeb(query);
    if (!searchResult) {
      return res.status(500).json({ error: 'Web search failed' });
    }

    res.json({
      content: searchResult.content,
      sources: searchResult.sources,
      searchUsed: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User feedback endpoint for improving search decisions
app.post('/api/feedback', (req, res) => {
  try {
    const { message, searchUsed, userSatisfaction } = req.body;
    
    if (!message || searchUsed === undefined || !userSatisfaction) {
      return res.status(400).json({ error: 'Message, searchUsed, and userSatisfaction are required' });
    }
    
    if (userSatisfaction < 1 || userSatisfaction > 5) {
      return res.status(400).json({ error: 'userSatisfaction must be between 1 and 5' });
    }
    
    dynamicKeywords.recordFeedback(message, searchUsed, userSatisfaction);
    
    res.json({ 
      success: true, 
      message: 'Feedback recorded successfully',
      feedbackStats: dynamicKeywords.analyzeFeedback()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoint for search decision insights
app.get('/api/analytics/search-decisions', (req, res) => {
  try {
    const stats = dynamicKeywords.analyzeFeedback();
    const currentKeywords = dynamicKeywords.getAllKeywords();
    
    res.json({
      feedbackStats: stats,
      currentKeywords: {
        base: dynamicKeywords.baseKeywords.length,
        trending: dynamicKeywords.trendingKeywords.size,
        total: currentKeywords.length
      },
      trendingKeywords: Array.from(dynamicKeywords.trendingKeywords),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New endpoint to get memory statistics
app.get('/api/memory/stats', (req, res) => {
  try {
    const stats = memoryService.getMemoryStats();
    res.json({
      success: true,
      stats: stats,
      message: 'Memory statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New endpoint to search memories
app.post('/api/memory/search', (req, res) => {
  try {
    const { query, userId = 'default', limit = 10 } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const memories = memoryService.searchMemories(query, userId, limit);
    res.json({
      success: true,
      memories: memories,
      count: memories.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New endpoint to export memories
app.get('/api/memory/export', (req, res) => {
  try {
    const memories = memoryService.exportMemories();
    res.json({
      success: true,
      memories: memories,
      count: memories.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AIMCS Enhanced Backend with Web Search running on port ${PORT}`);
});