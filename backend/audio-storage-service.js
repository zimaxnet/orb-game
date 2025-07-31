import { MongoClient } from 'mongodb';

class AudioStorageService {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async initialize() {
    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MongoDB URI not provided and MONGO_URI environment variable not set');
      }

      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      this.db = this.client.db('orbgame');
      this.collection = this.db.collection('audio_storage');
      
      // Create indexes for efficient queries
      await this.collection.createIndex({ 
        storyId: 1, 
        language: 1, 
        voice: 1 
      });
      await this.collection.createIndex({ 
        createdAt: 1 
      }, { 
        expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days TTL
      });

      console.log('✅ Audio Storage Service initialized successfully');
    } catch (error) {
      console.error('❌ Audio Storage Service initialization failed:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Audio Storage Service connection closed');
    }
  }

  generateAudioId(storyId, language, voice = 'alloy') {
    return `${storyId}_${language}_${voice}`;
  }

  async storeAudio(storyId, language, audioData, voice = 'alloy') {
    try {
      const audioId = this.generateAudioId(storyId, language, voice);
      
      const audioDocument = {
        audioId,
        storyId,
        language,
        voice,
        audioData,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0
      };

      await this.collection.updateOne(
        { audioId },
        { $set: audioDocument },
        { upsert: true }
      );

      console.log(`✅ Audio stored for story ${storyId} (${language})`);
      return audioId;
    } catch (error) {
      console.error('❌ Failed to store audio:', error);
      throw error;
    }
  }

  async getAudio(storyId, language, voice = 'alloy') {
    try {
      const audioId = this.generateAudioId(storyId, language, voice);
      
      const audioDoc = await this.collection.findOne({ audioId });
      
      if (audioDoc) {
        // Update access statistics
        await this.collection.updateOne(
          { audioId },
          { 
            $inc: { accessCount: 1 },
            $set: { lastAccessed: new Date() }
          }
        );

        console.log(`✅ Audio retrieved for story ${storyId} (${language})`);
        return audioDoc.audioData;
      }

      console.log(`❌ Audio not found for story ${storyId} (${language})`);
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve audio:', error);
      throw error;
    }
  }

  async deleteAudio(storyId, language, voice = 'alloy') {
    try {
      const audioId = this.generateAudioId(storyId, language, voice);
      
      const result = await this.collection.deleteOne({ audioId });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Audio deleted for story ${storyId} (${language})`);
        return true;
      }

      console.log(`❌ Audio not found for deletion: ${storyId} (${language})`);
      return false;
    } catch (error) {
      console.error('❌ Failed to delete audio:', error);
      throw error;
    }
  }

  async getAudioStats() {
    try {
      const stats = await this.collection.aggregate([
        {
          $group: {
            _id: null,
            totalAudio: { $sum: 1 },
            totalAccesses: { $sum: '$accessCount' },
            avgAccessCount: { $avg: '$accessCount' }
          }
        }
      ]).toArray();

      return stats[0] || { totalAudio: 0, totalAccesses: 0, avgAccessCount: 0 };
    } catch (error) {
      console.error('❌ Failed to get audio stats:', error);
      throw error;
    }
  }
}

export default AudioStorageService; 