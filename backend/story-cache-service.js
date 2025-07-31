import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class StoryCacheService {
  constructor() {
    this.client = null;
    this.db = null;
    this.storiesCollection = null;
    this.audioCollection = null;
    this.isConnected = false;
  }

  async initialize() {
    return await this.connect();
  }

  async connect() {
    try {
      // Use secrets from Key Vault if available, fallback to environment variables
      const mongoUri = global.secrets?.MONGO_URI || process.env.MONGO_URI;
      if (!mongoUri) {
        console.warn('⚠️ MONGO_URI not set. Story caching will be disabled.');
        return false;
      }

      console.log('🔍 Testing MongoDB connection for story caching...');
      
      // Use the same connection approach as AdvancedMemoryService
      this.client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        connectTimeoutMS: 15000, // 15 second timeout
        socketTimeoutMS: 45000, // 45 second timeout
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
        w: 'majority'
      });
      
      await this.client.connect();
      
      // Test the connection by running a simple command
      await this.client.db('admin').command({ ping: 1 });
      
      this.db = this.client.db('orbgame');
      this.storiesCollection = this.db.collection('stories');
      this.audioCollection = this.db.collection('audio');
      
      // Test collection access
      await this.storiesCollection.countDocuments();
      await this.audioCollection.countDocuments();
      
      // Create indexes for efficient queries (only if they don't exist)
      try {
        await this.storiesCollection.createIndex({ 
          category: 1, 
          epoch: 1, 
          model: 1, 
          language: 1 
        });
        
        await this.storiesCollection.createIndex({ 
          createdAt: 1 
        }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days TTL
        
        await this.audioCollection.createIndex({ 
          storyId: 1 
        });
      } catch (indexError) {
        console.warn('⚠️ Index creation failed (may already exist):', indexError.message);
      }
      
      this.isConnected = true;
      console.log('✅ Story cache service connected to MongoDB');
      return true;
    } catch (error) {
      console.warn('⚠️ StoryCacheService failed to connect, caching will be disabled.');
      console.warn('   Error details:', error.message);
      console.warn('   Error code:', error.code);
      console.warn('   Error name:', error.name);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.close();
        this.isConnected = false;
        console.log('✅ Story cache service disconnected from MongoDB');
      } catch (error) {
        console.warn('⚠️ Error disconnecting story cache service:', error.message);
      }
    }
  }

  // Generate a unique cache key for stories
  generateCacheKey(category, epoch, model, language) {
    return `${category}-${epoch}-${model}-${language}`;
  }

  // Store stories in MongoDB
  async storeStories(category, epoch, model, language, stories) {
    if (!this.isConnected) {
      console.warn('⚠️ Story cache not connected, skipping storage');
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(category, epoch, model, language);
      
      // Store each story with metadata
      const storiesToStore = stories.map((story, index) => ({
        cacheKey,
        category,
        epoch,
        model,
        language,
        storyIndex: index,
        headline: story.headline,
        summary: story.summary,
        fullText: story.fullText,
        source: story.source,
        publishedAt: story.publishedAt,
        // Don't store TTS audio to avoid RequestEntityTooLarge error
        // ttsAudio: story.ttsAudio, 
        storyType: story.storyType || 'historical-figure', // Store story type
        historicalFigure: story.historicalFigure, // Store historical figure name
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Use upsert to avoid duplicates
      const result = await this.storiesCollection.bulkWrite(
        storiesToStore.map(story => ({
          updateOne: {
            filter: { 
              cacheKey: story.cacheKey, 
              storyIndex: story.storyIndex 
            },
            update: { $set: story },
            upsert: true
          }
        }))
      );

      console.log(`✅ Stored ${stories.length} stories for ${category}/${epoch}/${model}/${language}`);
      return true;
    } catch (error) {
      console.error('❌ Error storing stories in cache:', error);
      return false;
    }
  }

  // Retrieve stories from MongoDB
  async getStories(category, epoch, model, language) {
    if (!this.isConnected) {
      console.warn('⚠️ Story cache not connected, cannot retrieve stories');
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(category, epoch, model, language);
      
      const stories = await this.storiesCollection
        .find({ cacheKey })
        .sort({ storyIndex: 1 })
        .toArray();

      if (stories.length === 0) {
        console.log(`📭 No cached stories found for ${cacheKey}`);
        return null;
      }

      // Convert back to the expected format
      const formattedStories = stories.map(story => ({
        headline: story.headline,
        summary: story.summary,
        fullText: story.fullText,
        source: story.source,
        publishedAt: story.publishedAt,
        storyType: story.storyType,
        historicalFigure: story.historicalFigure
      }));

      console.log(`✅ Retrieved ${formattedStories.length} cached stories for ${cacheKey}`);
      return formattedStories;
    } catch (error) {
      console.error('❌ Error retrieving stories from cache:', error);
      return null;
    }
  }

  // Check if stories exist in cache
  async hasStories(category, epoch, model, language) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(category, epoch, model, language);
      const count = await this.storiesCollection.countDocuments({ cacheKey });
      return count > 0;
    } catch (error) {
      console.error('❌ Error checking cache for stories:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    if (!this.isConnected) {
      return null;
    }

    try {
      const totalStories = await this.storiesCollection.countDocuments();
      const totalAudio = await this.audioCollection.countDocuments();
      
      const categoryStats = await this.storiesCollection.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            epochs: { $addToSet: '$epoch' },
            models: { $addToSet: '$model' },
            languages: { $addToSet: '$language' }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();

      return {
        totalStories,
        totalAudio,
        categories: categoryStats
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return null;
    }
  }

  // Clear old stories
  async clearOldStories(daysOld = 30) {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.storiesCollection.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      console.log(`🗑️ Cleared ${result.deletedCount} old stories (older than ${daysOld} days)`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error clearing old stories:', error);
      return 0;
    }
  }

  // Preload stories for an epoch
  async preloadStoriesForEpoch(epoch, categories, models, languages) {
    if (!this.isConnected) {
      console.warn('⚠️ Story cache not connected, skipping preload');
      return false;
    }

    try {
      console.log(`🔄 Preloading stories for epoch: ${epoch}`);
      
      for (const category of categories) {
        for (const model of models) {
          for (const language of languages) {
            const cacheKey = this.generateCacheKey(category, epoch, model, language);
            const existing = await this.hasStories(category, epoch, model, language);
            
            if (!existing) {
              console.log(`📝 No cached stories for ${cacheKey}, will generate on demand`);
            } else {
              console.log(`✅ Found cached stories for ${cacheKey}`);
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error preloading stories:', error);
      return false;
    }
  }

  // Get stories with fallback to generation
  async getStoriesWithFallback(category, epoch, model, language, generateFunction) {
    try {
      // First try to get from cache
      const cachedStories = await this.getStories(category, epoch, model, language);
      
      if (cachedStories && cachedStories.length > 0) {
        console.log(`✅ Using cached stories for ${category}/${epoch}/${model}/${language}`);
        return cachedStories;
      }

      // If not in cache, generate new stories
      console.log(`🔄 Generating new stories for ${category}/${epoch}/${model}/${language}`);
      const newStories = await generateFunction(category, epoch, 3, null, language);
      
      if (newStories && newStories.length > 0) {
        // Store in cache for future use
        await this.storeStories(category, epoch, model, language, newStories);
        return newStories;
      }

      return null;
    } catch (error) {
      console.error('❌ Error in getStoriesWithFallback:', error);
      return null;
    }
  }
}

export { StoryCacheService }; 