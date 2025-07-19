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
          max_tokens: 300,
          temperature: 0.7
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
          max_tokens: 800,
          temperature: 0.7,
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
      let story = await this.stories.findOne({
        category,
        isFresh: true,
        lastUsed: { $exists: false }
      });
      if (!story) {
        story = await this.stories.findOne(
          { category },
          { sort: { useCount: 1, lastUsed: 1 } }
        );
      }
      if (!story) {
        story = await this.stories.findOne({ category });
      }
      
      // If no story found, generate one using GPT-4o-mini as fallback
      if (!story) {
        console.log(`📝 No stories found for ${category}, generating fallback content with GPT-4o-mini...`);
        story = await this.generateFallbackStory(category);
      }
      
      if (story) {
        await this.stories.updateOne(
          { _id: story._id },
          {
            $inc: { useCount: 1 },
            $set: { lastUsed: new Date().toISOString() }
          }
        );
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
          max_tokens: 300,
          temperature: 0.7
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
        // Create a basic fallback story
        storyData = {
          headline: `Positive ${category} Development`,
          summary: `Exciting progress is being made in ${category.toLowerCase()} that brings hope and innovation.`,
          fullText: `Recent developments in ${category.toLowerCase()} show promising advances that could benefit many people. This positive trend demonstrates the power of human ingenuity and collaboration.`,
          source: 'AI Generated'
        };
      }

      const fallbackStory = new PositiveNewsStory({
        category,
        headline: storyData.headline,
        summary: storyData.summary,
        fullText: storyData.fullText,
        source: storyData.source,
        publishedAt: new Date().toISOString(),
        isFresh: false // Mark as fallback content
      });

      // Store the fallback story
      const result = await this.stories.insertOne(fallbackStory);
      fallbackStory._id = result.insertedId;
      
      console.log(`✅ Generated fallback story for ${category}: ${storyData.headline}`);
      return fallbackStory;

    } catch (error) {
      console.error(`❌ Failed to generate fallback story for ${category}:`, error.message);
      
      // Create a basic fallback story if all else fails
      const basicStory = new PositiveNewsStory({
        category,
        headline: `Positive ${category} News`,
        summary: `Great things are happening in ${category.toLowerCase()} that inspire hope and progress.`,
        fullText: `The field of ${category.toLowerCase()} continues to show remarkable progress and positive developments. These advances demonstrate the incredible potential for positive change and innovation in our world.`,
        source: 'AI Generated',
        publishedAt: new Date().toISOString(),
        isFresh: false
      });

      const result = await this.stories.insertOne(basicStory);
      basicStory._id = result.insertedId;
      
      console.log(`✅ Created basic fallback story for ${category}`);
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

  async getStoriesForCycling(category, count = 3, epoch = 'Modern') {
    try {
      // Get stories from different sources if possible
      const stories = await this.stories.aggregate([
        { $match: { category } },
        { $sort: { lastUsed: 1, useCount: 1 } },
        { $limit: count },
        { $group: { _id: '$source', stories: { $push: '$$ROOT' } } },
        { $project: { story: { $arrayElemAt: ['$stories', 0] } } },
        { $replaceRoot: { newRoot: '$story' } }
      ]).toArray();
      
      // If less than requested, fill with generated ones
      while (stories.length < count) {
        const nextSource = this.getNextSource();
        let newStory;
        if (nextSource === 'perplexity') {
          await this.fetchAndStorePositiveNews(category);
          newStory = await this.getRandomStory(category);
        } else if (nextSource === 'grok') {
          const grokData = await this.fetchFromGrok(category);
          if (grokData) {
            newStory = new PositiveNewsStory({ ...grokData, category });
            await this.stories.insertOne(newStory);
          }
        } else {
          newStory = await this.generateFallbackStory(category);
        }
        if (newStory) stories.push(newStory);
      }
      return stories;
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

export default PositiveNewsService; 