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
  constructor(mongoUri, dbName = 'aimcs') {
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
  }

  async initialize() {
    try {
      this.client = new MongoClient(this.mongoUri, {
        tls: true,
        tlsAllowInvalidCertificates: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.stories = this.db.collection('positive_news_stories');
      await this.stories.createIndex({ category: 1, isFresh: 1 });
      await this.stories.createIndex({ lastUsed: 1 });
      await this.stories.createIndex({ createdAt: 1 });
      console.log('✅ Positive News Service initialized successfully');
      this.startBackgroundUpdates();
    } catch (error) {
      console.error('❌ Positive News Service initialization failed:', error.message);
      throw error;
    }
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

  async fetchAndStorePositiveNews(category) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-small-online',
          messages: [
            {
              role: 'user',
              content: `Find the latest positive news in ${category}. Return only 3 positive stories in this format: { "stories": [ { "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence detailed story", "source": "Source name" } ] }`
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
        return;
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
}

export default PositiveNewsService; 