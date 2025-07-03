import express from 'express';

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
const PERPLEXITY_API_KEY = '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';

app.use(express.json({ limit: '10mb' }));

// Helper function to determine if web search is needed
const needsWebSearch = (message) => {
  const webSearchKeywords = [
    'latest', 'recent', 'today', 'yesterday', 'this week', 'this month',
    'current', 'news', 'update', 'breaking', 'live', 'now',
    'weather', 'stock', 'price', 'market', 'sports', 'score',
    'election', 'politics', 'covid', 'pandemic', 'vaccine',
    '2024', '2025', 'this year', 'last year'
  ];
  
  const lowerMessage = message.toLowerCase();
  return webSearchKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Perplexity web search function
const searchWeb = async (query) => {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
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
        search_domain_filter: ['web'],
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

// Enhanced chat endpoint with web search
app.post('/api/chat', async (req, res) => {
  try {
    const { message, useWebSearch = 'auto' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT) {
      return res.status(500).json({ error: 'AI not configured' });
    }

    let aiResponse = '';
    let webSearchData = null;
    let searchUsed = false;

    // Determine if web search should be used
    const shouldUseWebSearch = useWebSearch === 'web' || 
                              (useWebSearch === 'auto' && needsWebSearch(message));

    // If web search is needed, get current information first
    if (shouldUseWebSearch) {
      webSearchData = await searchWeb(message);
      if (webSearchData) {
        searchUsed = true;
        // Enhance the user message with web search results
        const enhancedMessage = `${message}\n\nCurrent information from web search:\n${webSearchData.content}`;
        
        // Get AI response with web search context
        const openaiUrl = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2025-01-01-preview`;
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
      const openaiUrl = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2025-01-01-preview`;
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

    // 2. Get audio from gpt-4o-mini-tts
    let audioData = null;
    let audioFormat = null;
    try {
      const ttsUrl = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`;
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
      sender: 'Zimax AI',
      message: aiResponse,
      timestamp: new Date().toISOString(),
      aiUsed: true,
      searchUsed: searchUsed,
      originalMessage: message
    };
    
    if (audioData) {
      response.audioData = audioData;
      response.audioFormat = audioFormat;
    }
    
    if (webSearchData && webSearchData.sources) {
      response.sources = webSearchData.sources;
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AIMCS Enhanced Backend with Web Search running on port ${PORT}`);
});