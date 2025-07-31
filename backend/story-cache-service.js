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
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        console.warn('⚠️ MONGO_URI not set. Story caching will be disabled.');
        return false;
      }

      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      
      this.db = this.client.db('orbgame');
      this.storiesCollection = this.db.collection('stories');
      this.audioCollection = this.db.collection('audio');
      
      // Create indexes for efficient queries
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
      
      this.isConnected = true;
      console.log('✅ Story cache service connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB for story caching:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('✅ Story cache service disconnected from MongoDB');
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
        lastAccessed: new Date(),
        accessCount: 0
      }));

      // Remove existing stories for this combination
      await this.storiesCollection.deleteMany({ cacheKey });

      // Insert new stories
      const result = await this.storiesCollection.insertMany(storiesToStore);
      
      console.log(`✅ Stored ${stories.length} stories for ${category}-${epoch}-${model}-${language}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to store stories:', error);
      return false;
    }
  }

  // Retrieve stories from MongoDB
  async getStories(category, epoch, model, language) {
    if (!this.isConnected) {
      console.warn('⚠️ Story cache not connected, returning null');
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

      // Update access statistics
      await this.storiesCollection.updateMany(
        { cacheKey },
        { 
          $inc: { accessCount: 1 },
          $set: { lastAccessed: new Date() }
        }
      );

      // Convert back to original format
      const formattedStories = stories.map(story => ({
        headline: story.headline,
        summary: story.summary,
        fullText: story.fullText,
        source: story.source,
        publishedAt: story.publishedAt,
        // Generate TTS audio on-demand instead of storing it
        ttsAudio: null, // Will be generated when needed
        storyType: story.storyType || 'historical-figure',
        historicalFigure: story.historicalFigure
      }));

      console.log(`📖 Retrieved ${stories.length} cached stories for ${cacheKey}`);
      return formattedStories;
    } catch (error) {
      console.error('❌ Failed to retrieve stories:', error);
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
      console.error('❌ Failed to check story existence:', error);
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
      const totalCategories = await this.storiesCollection.distinct('category');
      const totalEpochs = await this.storiesCollection.distinct('epoch');
      const totalModels = await this.storiesCollection.distinct('model');
      const totalLanguages = await this.storiesCollection.distinct('language');

      // Get most accessed stories
      const mostAccessed = await this.storiesCollection
        .find({})
        .sort({ accessCount: -1 })
        .limit(10)
        .toArray();

      // Get recent stories
      const recentStories = await this.storiesCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      return {
        totalStories,
        totalCategories: totalCategories.length,
        totalEpochs: totalEpochs.length,
        totalModels: totalModels.length,
        totalLanguages: totalLanguages.length,
        mostAccessed: mostAccessed.map(story => ({
          cacheKey: story.cacheKey,
          accessCount: story.accessCount,
          lastAccessed: story.lastAccessed
        })),
        recentStories: recentStories.map(story => ({
          cacheKey: story.cacheKey,
          createdAt: story.createdAt
        }))
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return null;
    }
  }

  // Clear old stories (older than specified days)
  async clearOldStories(daysOld = 30) {
    if (!this.isConnected) {
      return false;
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
      console.error('❌ Failed to clear old stories:', error);
      return false;
    }
  }

  // Preload stories for all combinations
  async preloadStoriesForEpoch(epoch, categories, models, languages) {
    if (!this.isConnected) {
      console.warn('⚠️ Story cache not connected, skipping preload');
      return false;
    }

    console.log(`🔄 Starting preload for epoch: ${epoch}`);
    
    const totalCombinations = categories.length * models.length * languages.length;
    let completedCombinations = 0;

    for (const category of categories) {
      for (const model of models) {
        for (const language of languages) {
          try {
            // Check if stories already exist
            const hasStories = await this.hasStories(category, epoch, model, language);
            
            if (!hasStories) {
              console.log(`📚 Preloading ${category}-${epoch}-${model}-${language}...`);
              // This would trigger story generation in the main service
              // For now, we'll just log the need for preloading
            } else {
              console.log(`✅ Already cached: ${category}-${epoch}-${model}-${language}`);
            }
            
            completedCombinations++;
            const progress = Math.round((completedCombinations / totalCombinations) * 100);
            console.log(`📊 Preload progress: ${progress}%`);
            
          } catch (error) {
            console.error(`❌ Failed to preload ${category}-${epoch}-${model}-${language}:`, error);
          }
        }
      }
    }

    console.log(`✅ Preload complete for epoch: ${epoch}`);
    return true;
  }

  // Get stories with fallback to generation
  async getStoriesWithFallback(category, epoch, model, language, generateFunction) {
    // First try to get from cache
    let stories = await this.getStories(category, epoch, model, language);
    
    if (stories && stories.length > 0) {
      console.log(`🎯 Using cached stories for ${category}-${epoch}-${model}-${language}`);
      return stories;
    }

    // If not in cache, generate new stories
    console.log(`🔄 Generating fresh stories for ${category}-${epoch}-${model}-${language}`);
    stories = await generateFunction(category, epoch, model, language);
    
    if (stories && stories.length > 0) {
      // Store the generated stories in cache
      await this.storeStories(category, epoch, model, language, stories);
      console.log(`💾 Stored generated stories in cache`);
    }

    return stories;
  }
}

export { StoryCacheService }; 