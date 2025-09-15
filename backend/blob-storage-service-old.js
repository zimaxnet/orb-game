import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

/**
 * Blob Storage Service - Cost-effective replacement for MongoDB
 * 
 * This service provides:
 * - Story storage as JSON files
 * - Audio storage as blob files
 * - Image metadata storage
 * - Cost: ~$5-15/month vs $1,000/month for MongoDB
 */
class BlobStorageService {
  constructor() {
    this.storageAccountName = 'orbgameimages';
    this.blobServiceClient = null;
    this.containerName = 'historical-figures';
    this.isConnected = false;
    
    // Storage structure:
    // /stories/{category}/{epoch}/{language}/{model}.json
    // /audio/{category}/{epoch}/{language}/{model}/{storyId}.mp3
    // /metadata/{category}/{epoch}/index.json
  }

  async initialize() {
    try {
      console.log('🔧 Initializing Blob Storage Service...');
      
      // Use connection string (works for both local and Azure deployment)
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (connectionString) {
        this.blobServiceClient = new BlobServiceClient(connectionString);
        console.log('✅ Using connection string for blob storage authentication');
      } else {
        // Fallback to managed identity for Azure deployment
        try {
          const credential = new DefaultAzureCredential();
          this.blobServiceClient = new BlobServiceClient(
            `https://${this.storageAccountName}.blob.core.windows.net`,
            credential
          );
          console.log('✅ Using managed identity for blob storage authentication');
        } catch (managedIdentityError) {
          throw new Error('No authentication method available for blob storage');
        }
      }

      // Test connection
      await this.blobServiceClient.getAccountInfo();
      this.isConnected = true;
      console.log('✅ Blob Storage Service connected successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Blob Storage Service initialization failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get stories for a specific category, epoch, language, and model
   */
  async getStories(category, epoch, language, model) {
    if (!this.isConnected) {
      console.warn('⚠️ Blob Storage Service not connected');
      return [];
    }

    try {
      const blobName = `stories/${category}/${epoch}/${language}/${model}.json`;
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Check if blob exists
      const exists = await blobClient.exists();
      if (!exists) {
        console.log(`📝 No cached stories found for ${category}/${epoch}/${language}/${model}`);
        return [];
      }

      // Download and parse JSON
      const downloadResponse = await blobClient.download();
      const chunks = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      const content = Buffer.concat(chunks).toString();
      const stories = JSON.parse(content);

      console.log(`📖 Retrieved ${stories.length} cached stories for ${category}/${epoch}/${language}/${model}`);
      return stories;
    } catch (error) {
      console.error('❌ Error retrieving stories from blob storage:', error.message);
      return [];
    }
  }

  /**
   * Save stories to blob storage
   */
  async saveStories(category, epoch, language, model, stories) {
    if (!this.isConnected) {
      console.warn('⚠️ Blob Storage Service not connected');
      return false;
    }

    try {
      const blobName = `stories/${category}/${epoch}/${language}/${model}.json`;
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Convert stories to JSON
      const content = JSON.stringify(stories, null, 2);
      const buffer = Buffer.from(content, 'utf8');

      // Upload to blob storage
      await blobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json'
        },
        metadata: {
          category,
          epoch,
          language,
          model,
          timestamp: new Date().toISOString(),
          storyCount: stories.length.toString()
        }
      });

      console.log(`💾 Saved ${stories.length} stories to blob storage: ${blobName}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving stories to blob storage:', error.message);
      return false;
    }
  }

  /**
   * Get audio blob for a specific story
   */
  async getAudioBlob(category, epoch, language, model, storyId) {
    if (!this.isConnected) {
      console.warn('⚠️ Blob Storage Service not connected');
      return null;
    }

    try {
      const blobName = `audio/${category}/${epoch}/${language}/${model}/${storyId}.mp3`;
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Check if blob exists
      const exists = await blobClient.exists();
      if (!exists) {
        console.log(`🔊 No cached audio found for story ${storyId}`);
        return null;
      }

      // Download audio blob
      const downloadResponse = await blobClient.download();
      const chunks = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);

      console.log(`🎵 Retrieved audio for story ${storyId} (${audioBuffer.length} bytes)`);
      return audioBuffer;
    } catch (error) {
      console.error('❌ Error retrieving audio from blob storage:', error.message);
      return null;
    }
  }

  /**
   * Save audio blob for a specific story
   */
  async saveAudioBlob(category, epoch, language, model, storyId, audioBuffer) {
    if (!this.isConnected) {
      console.warn('⚠️ Blob Storage Service not connected');
      return false;
    }

    try {
      const blobName = `audio/${category}/${epoch}/${language}/${model}/${storyId}.mp3`;
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Upload audio blob
      await blobClient.upload(audioBuffer, audioBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'audio/mpeg'
        },
        metadata: {
          category,
          epoch,
          language,
          model,
          storyId,
          timestamp: new Date().toISOString(),
          size: audioBuffer.length.toString()
        }
      });

      console.log(`💾 Saved audio for story ${storyId} (${audioBuffer.length} bytes)`);
      return true;
    } catch (error) {
      console.error('❌ Error saving audio to blob storage:', error.message);
      return false;
    }
  }

  /**
   * Get image metadata for a category and epoch
   */
  async getImageMetadata(category, epoch) {
    if (!this.isConnected) {
      console.warn('⚠️ Blob Storage Service not connected');
      return null;
    }

    try {
      const blobName = `metadata/${category}/${epoch}/index.json`;
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Check if blob exists
      const exists = await blobClient.exists();
      if (!exists) {
        console.log(`🖼️ No image metadata found for ${category}/${epoch}`);
        return null;
      }

      // Download and parse JSON
      const downloadResponse = await blobClient.download();
      const chunks = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      const content = Buffer.concat(chunks).toString();
      const metadata = JSON.parse(content);

      console.log(`📋 Retrieved image metadata for ${category}/${epoch}`);
      return metadata;
    } catch (error) {
      console.error('❌ Error retrieving image metadata from blob storage:', error.message);
      return null;
    }
  }

  /**
   * Save image metadata for a category and epoch
   */
  async saveImageMetadata(category, epoch, metadata) {
    if (!this.isConnected) {
      console.warn('⚠️ Blob Storage Service not connected');
      return false;
    }

    try {
      const blobName = `metadata/${category}/${epoch}/index.json`;
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Convert metadata to JSON
      const content = JSON.stringify(metadata, null, 2);
      const buffer = Buffer.from(content, 'utf8');

      // Upload to blob storage
      await blobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json'
        },
        metadata: {
          category,
          epoch,
          timestamp: new Date().toISOString(),
          imageCount: metadata.images ? metadata.images.length.toString() : '0'
        }
      });

      console.log(`💾 Saved image metadata for ${category}/${epoch}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving image metadata to blob storage:', error.message);
      return false;
    }
  }

  /**
   * Check if blob storage is connected and ready
   */
  isReady() {
    return this.isConnected;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    if (!this.isConnected) {
      return { connected: false };
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      let storyCount = 0;
      let audioCount = 0;
      let metadataCount = 0;
      let totalSize = 0;

      // List all blobs and count by type
      for await (const blob of containerClient.listBlobsFlat()) {
        if (blob.name.startsWith('stories/')) {
          storyCount++;
        } else if (blob.name.startsWith('audio/')) {
          audioCount++;
        } else if (blob.name.startsWith('metadata/')) {
          metadataCount++;
        }
        totalSize += blob.properties.contentLength || 0;
      }

      return {
        connected: true,
        stories: storyCount,
        audio: audioCount,
        metadata: metadataCount,
        totalSize: totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error.message);
      return { connected: false, error: error.message };
    }
  }
}

export default BlobStorageService;
