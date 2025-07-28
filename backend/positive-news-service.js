import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

class PositiveNewsStory {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.category = data.category || '';
    this.headline = data.headline || '';
    this.summary = data.summary || '';
    this.fullText = data.fullText || '';
    this.source = data.source || '';
    this.publishedAt = data.publishedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastUsed = data.lastUsed || null;
    this.useCount = data.useCount || 0;
    this.isFresh = data.isFresh !== undefined ? data.isFresh : true;
    this.ttsAudio = data.ttsAudio || null; // base64 encoded audio
    this.ttsGeneratedAt = data.ttsGeneratedAt || null;
  }
}

class PositiveNewsService {
  constructor(mongoUri, dbName = 'orbgame') {
    this.mongoUri = mongoUri;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
    this.stories = null;
    this.updateInterval = null;
    this.categories = [
      'Technology', 'Science', 'Art', 'Nature', 'Sports',
      'Music', 'Space', 'Innovation', 'Health', 'Education'
    ];
    this.lastSourceIndex = 0;
  }

  async initialize() {
    try {
      this.client = new MongoClient(this.mongoUri, {
        tls: true,
        tlsAllowInvalidCertificates: false,
        // Remove deprecated options for MongoDB 3.6 compatibility
        // useUnifiedTopology: true,
        // useNewUrlParser: true,
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.stories = this.db.collection('positive_news_stories');
      await this.stories.createIndex({ category: 1, isFresh: 1 });
      await this.stories.createIndex({ lastUsed: 1 });
      await this.stories.createIndex({ createdAt: 1 });
      console.log('✅ Positive News Service initialized successfully');
      
      // Ensure all categories have at least one story
      await this.ensureAllCategoriesHaveContent();
      
      this.startBackgroundUpdates();
    } catch (error) {
      console.error('❌ Positive News Service initialization failed:', error.message);
      throw error;
    }
  }

  async ensureAllCategoriesHaveContent() {
    console.log('🔍 Checking if all categories have content...');
    for (const category of this.categories) {
      const storyCount = await this.stories.countDocuments({ category });
      if (storyCount === 0) {
        console.log(`📝 No stories found for ${category}, generating fallback content...`);
        await this.generateFallbackStory(category);
      }
    }
    console.log('✅ All categories now have content');
  }

  async close() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    await this.client.close();
  }

  startBackgroundUpdates() {
    this.updateInterval = setInterval(async () => {
      try {
        console.log('🔄 Starting background news update...');
        await this.updatePositiveNews();
      } catch (error) {
        console.error('❌ Background news update failed:', error.message);
      }
    }, 15 * 60 * 1000); // 15 minutes
    setTimeout(async () => {
      try {
        await this.updatePositiveNews();
      } catch (error) {
        console.error('❌ Initial news update failed:', error.message);
      }
    }, 5000);
  }

  async updatePositiveNews() {
    for (const category of this.categories) {
      await this.fetchAndStorePositiveNews(category);
    }
    console.log('✅ Background news update completed');
  }

  async fetchFromGrok(category) {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {  // Grok API endpoint
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',  // Use appropriate Grok model
          messages: [
            {
              role: 'user',
              content: `Generate a positive news story about ${category}. Return ONLY a valid JSON object: { "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Grok AI" }`
            }
          ],
          max_completion_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      let storyData;
      try {
        storyData = JSON.parse(content);
      } catch (e) {
        console.warn('Grok JSON parse failed:', e);
        return null;
      }
      return storyData;
    } catch (error) {
      console.error(`Grok fetch failed for ${category}:`, error);
      return null;
    }
  }

  async fetchAndStorePositiveNews(category) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar',
          stream: false,
          max_completion_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: `Find the latest positive news in ${category}. Return ONLY a valid JSON object with this exact format, no other text: { "stories": [ { "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence detailed story", "source": "Source name" } ] }`
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
        console.warn(`Failed to parse stories for ${category}:`, parseError.message);
        // Try to extract JSON from the response if it contains text before JSON
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            stories = JSON.parse(jsonMatch[0]);
            console.log(`✅ Extracted JSON from response for ${category}`);
          } else {
            console.warn(`No JSON found in response for ${category}`);
            return;
          }
        } catch (extractError) {
          console.warn(`Failed to extract JSON for ${category}:`, extractError.message);
          return;
        }
      }
      if (stories.stories && Array.isArray(stories.stories)) {
        for (const story of stories.stories) {
          const newsStory = new PositiveNewsStory({
            category,
            headline: story.headline,
            summary: story.summary,
            fullText: story.fullText,
            source: story.source,
            publishedAt: new Date().toISOString()
          });
          const existingStory = await this.stories.findOne({
            category,
            headline: story.headline,
            summary: story.summary
          });
          if (!existingStory) {
            await this.stories.insertOne(newsStory);
            console.log(`✅ Added new positive story for ${category}: ${story.headline}`);
          }
        }
      }

      // If Perplexity fails and Grok is enabled, fallback to Grok
      if (!stories.stories && process.env.GROK_API_KEY) {
        console.log(`Using Grok fallback for ${category}`);
        const grokStory = await this.fetchFromGrok(category);
        if (grokStory) {
          stories = { stories: [grokStory] };
        }
      }
    } catch (error) {
      console.error(`❌ Failed to fetch positive news for ${category}:`, error.message);
    }
  }

  async getRandomStory(category) {
    try {
      // Try to get a story with TTS audio first
      let story = await this.stories.findOne({
        category,
        ttsAudio: { $exists: true, $ne: null }
      });
      
      // If no story with TTS, try to get any story
      if (!story) {
        story = await this.stories.findOne({ category });
      }
      
      // If no story found, generate one using GPT-4o-mini as fallback
      if (!story) {
        console.log(`📝 No stories found for ${category}, generating fallback content with GPT-4o-mini...`);
        story = await this.generateFallbackStory(category);
      }
      
      if (story) {
        // Update usage stats (simplified)
        await this.stories.updateOne(
          { _id: story._id },
          {
            $inc: { useCount: 1 },
            $set: { lastUsed: new Date().toISOString() }
          }
        );
        
        // Generate TTS if not available
        if (!story.ttsAudio) {
          try {
            story.ttsAudio = await this.generateTTS(story.summary);
            await this.stories.updateOne(
              { _id: story._id },
              {
                $set: {
                  ttsAudio: story.ttsAudio,
                  ttsGeneratedAt: new Date().toISOString()
                }
              }
            );
          } catch (ttsError) {
            console.warn('TTS generation failed:', ttsError.message);
          }
        }
        return story;
      }
      return null;
    } catch (error) {
      console.error('Failed to get random story:', error.message);
      return null;
    }
  }

  async generateFallbackStory(category) {
    try {
      // Load historical figures for the category and default to Modern epoch
      let historicalFigures = [];
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'OrbGameInfluentialPeopleSeeds');
        
        if (fs.existsSync(filePath)) {
          const seedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (seedData[category] && seedData[category]['Modern']) {
            historicalFigures = seedData[category]['Modern'];
          }
        }
      } catch (error) {
        console.warn('Failed to load historical figures for fallback:', error.message);
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
3. How their innovations changed the world during modern times
4. Their background and challenges they faced
5. The lasting impact of their contributions

Make it engaging and educational with concrete details about their life and work.`;
      } else {
        // If no historical figures found, create a prompt for a generic historical figure in this category
        enhancedPrompt = `Create a story about a specific historical figure in ${category}. 

IMPORTANT: You MUST focus on a real historical figure and their specific achievements. Do NOT create a generic story.

Tell the story of a historical figure in ${category}, including:
1. Their exact name
2. Their specific achievements in ${category.toLowerCase()}
3. How their innovations changed the world
4. Their background and challenges they faced
5. The lasting impact of their contributions

Make it engaging and educational with concrete details about their life and work.`;
      }
      
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
              content: 'You are a helpful assistant that creates engaging, positive news stories about specific historical figures. You MUST choose ONE historical figure and tell their story. Always include the historical figure\'s name in the headline and story. Focus on uplifting and inspiring content about their specific achievements and contributions. NEVER create generic stories.'
            },
            {
              role: 'user',
              content: `${enhancedPrompt} Return the story in this exact JSON format:
{
  "headline": "Brief headline mentioning the historical figure",
  "summary": "One sentence summary of the story",
  "fullText": "2-3 sentence detailed story about the historical figure",
  "source": "O4-Mini",
  "historicalFigure": "Name of the historical figure"
}`
            }
          ],
          max_completion_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let storyData;
      try {
        storyData = JSON.parse(content);
      } catch (parseError) {
        console.warn(`Failed to parse fallback story for ${category}:`, parseError.message);
        // Create a basic historical figure fallback story
        storyData = {
          headline: `Historical Figure in ${category}`,
          summary: `A remarkable historical figure in ${category.toLowerCase()} made groundbreaking contributions that shaped our world.`,
          fullText: `This influential figure in ${category.toLowerCase()} demonstrated incredible innovation and perseverance. Their achievements continue to inspire and influence modern developments in the field.`,
          source: 'O4-Mini',
          historicalFigure: 'Historical Figure'
        };
      }

      const fallbackStory = new PositiveNewsStory({
        category,
        headline: storyData.headline,
        summary: storyData.summary,
        fullText: storyData.fullText,
        source: storyData.source,
        historicalFigure: storyData.historicalFigure || 'Historical Figure',
        storyType: 'historical-figure'
      });

      await this.stories.insertOne(fallbackStory);
      console.log(`✅ Generated historical figure fallback story for ${category}: ${storyData.headline}`);
      
      return fallbackStory;
    } catch (error) {
      console.error(`❌ Failed to generate historical figure fallback story for ${category}:`, error.message);
      
      // Create a basic historical figure story as last resort
      const basicStory = new PositiveNewsStory({
        category,
        headline: `Historical Figure in ${category}`,
        summary: `A remarkable historical figure in ${category.toLowerCase()} made groundbreaking contributions that shaped our world.`,
        fullText: `This influential figure in ${category.toLowerCase()} demonstrated incredible innovation and perseverance. Their achievements continue to inspire and influence modern developments in the field.`,
        source: 'O4-Mini',
        historicalFigure: 'Historical Figure',
        storyType: 'historical-figure'
      });
      
      await this.stories.insertOne(basicStory);
      return basicStory;
    }
  }

  async generateTTS(text) {
    try {
      const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
        method: 'POST',
        headers: {
          'api-key': process.env.AZURE_OPENAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
          input: text,
          voice: 'alloy',
          response_format: 'mp3'
        })
      });
      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        return Buffer.from(audioBuffer).toString('base64');
      } else {
        throw new Error(`TTS API error: ${response.status}`);
      }
    } catch (error) {
      console.error('TTS generation failed:', error.message);
      throw error;
    }
  }

  async getStoriesByCategory(category) {
    try {
      return await this.stories.find({ category }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Failed to get stories by category:', error.message);
      return [];
    }
  }

  async getStoryStats() {
    try {
      const stats = await this.stories.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            freshCount: { $sum: { $cond: ['$isFresh', 1, 0] } }
          }
        }
      ]).toArray();
      return stats;
    } catch (error) {
      console.error('Failed to get story stats:', error.message);
      return [];
    }
  }

  async getStoriesForCycling(category, count = 1, epoch = 'Modern', storyType = 'historical-figure', language = 'en', includeTTS = false) {
    try {
      console.log(`📚 Getting ${storyType} stories for ${category} in ${epoch} epoch (${language}) (requested: ${count}, includeTTS: ${includeTTS})`);
      
      // For historical figures, use the story cache service instead of the positive news stories collection
      if (storyType === 'historical-figure') {
        console.log(`🎯 Using story cache service for historical figures`);
        
        // Import and use the story cache service
        const { StoryCacheService } = await import('./story-cache-service.js');
        const storyCacheService = new StoryCacheService();
        await storyCacheService.initialize();
        
        // Get stories from the story cache service
        const cachedStories = await storyCacheService.getStories(category, epoch, 'o4-mini', language);
        
        if (cachedStories && cachedStories.length > 0) {
          console.log(`✅ Found ${cachedStories.length} historical figure stories in cache`);
          const selectedStories = cachedStories.slice(0, count);
          return selectedStories;
        }
        
        console.log(`⚠️ No historical figure stories found in cache, generating new ones...`);
        
        // Generate new historical figure stories using the story cache service
        const generateFunction = async () => {
          // Import the story generation function from backend server
          const { generateStoriesWithAzureOpenAI } = await import('./backend-server.js');
          return await generateStoriesWithAzureOpenAI(category, epoch, count, null, language, storyType);
        };
        
        const newStories = await storyCacheService.getStoriesWithFallback(category, epoch, 'o4-mini', language, generateFunction);
        
        if (newStories && newStories.length > 0) {
          console.log(`✅ Generated ${newStories.length} new historical figure stories`);
          return newStories.slice(0, count);
        }
      }
      
      // Fallback to the original positive news stories collection for non-historical figures
      console.log(`📚 Using positive news stories collection for ${storyType} stories`);
      
      // Build query with filters
      const query = { 
        category,
        language: language
      };
      
      // Add epoch filter if specified
      if (epoch && epoch !== 'Modern') {
        query.epoch = epoch;
      }
      
      // Get stories - exclude TTS audio unless specifically requested
      let allStories;
      if (includeTTS) {
        console.log(`🎵 Including TTS audio for ${category} stories`);
        allStories = await this.stories.find(query).limit(count * 2).toArray();
      } else {
        // Explicitly exclude TTS fields to prevent crashes
        console.log(`🚫 Excluding TTS audio for ${category} stories to prevent crashes`);
        allStories = await this.stories.find(query).limit(count * 2).toArray();
        console.log(`📊 Found ${allStories.length} stories with TTS data, removing TTS fields...`);
        allStories = allStories.map(story => {
          const { ttsAudio, ttsGeneratedAt, ttsTextLength, ...storyWithoutTTS } = story;
          console.log(`✅ Removed TTS fields from story: ${story.headline}`);
          return storyWithoutTTS;
        });
        console.log(`✅ Processed ${allStories.length} stories without TTS audio`);
      }
      
      console.log(`📚 Found ${allStories.length} ${storyType} stories for ${category} in ${epoch} (${language})`);
      
      // If we have stories, return them
      if (allStories.length > 0) {
        const selectedStories = allStories.slice(0, count);
        console.log(`✅ Returning ${selectedStories.length} ${storyType} stories for ${category}`);
        return selectedStories;
      }
      
      // Only generate new stories if we have absolutely nothing
      console.log(`⚠️ No ${storyType} stories found for ${category} in ${epoch} (${language}), generating fallback...`);
      const fallbackStory = await this.generateFallbackStory(category);
      return [fallbackStory];
      
    } catch (error) {
      console.error('Failed to get cycling stories:', error);
      return [];
    }
  }

  getNextSource() {
    // Simple rotation logic - could track per category
    const sources = ['perplexity', 'grok', 'azure'];
    this.lastSourceIndex = (this.lastSourceIndex + 1) % sources.length;
    return sources[this.lastSourceIndex];
  }
}

export { PositiveNewsService }; 