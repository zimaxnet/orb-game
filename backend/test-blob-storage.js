import BlobStorageService from './blob-storage-service.js';
import HistoricalFiguresServiceBlob from './historical-figures-service-blob.js';
import dotenv from 'dotenv';

dotenv.config();

async function testBlobStorage() {
  console.log('🧪 Testing Blob Storage Service...');
  
  // Set the connection string
  process.env.AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || 'your-azure-storage-connection-string';
  
  try {
    // Test blob storage service directly
    console.log('1. Testing BlobStorageService...');
    const blobService = new BlobStorageService();
    const connected = await blobService.initialize();
    
    if (connected) {
      console.log('✅ BlobStorageService connected successfully');
      
      // Test storage stats
      const stats = await blobService.getStorageStats();
      console.log('📊 Storage stats:', stats);
      
      // Test saving and retrieving stories
      const testStories = [
        {
          headline: 'Test Story',
          story: 'This is a test story',
          figureName: 'Test Figure',
          category: 'Technology',
          epoch: 'Modern',
          language: 'en',
          model: 'o4-mini',
          timestamp: new Date().toISOString()
        }
      ];
      
      console.log('2. Testing story save/retrieve...');
      const saved = await blobService.saveStories('Technology', 'Modern', 'en', 'o4-mini', testStories);
      console.log('💾 Story saved:', saved);
      
      const retrieved = await blobService.getStories('Technology', 'Modern', 'en', 'o4-mini');
      console.log('📖 Stories retrieved:', retrieved.length);
      
    } else {
      console.log('❌ BlobStorageService failed to connect');
    }
    
    // Test historical figures service
    console.log('3. Testing HistoricalFiguresServiceBlob...');
    const figuresService = new HistoricalFiguresServiceBlob();
    const initialized = await figuresService.initialize();
    
    if (initialized) {
      console.log('✅ HistoricalFiguresServiceBlob initialized successfully');
      
      // Test getting historical figures
      const figures = figuresService.getHistoricalFigures('Technology', 'Modern');
      console.log('👥 Technology/Modern figures:', figures);
      
      // Test service stats
      const stats = await figuresService.getStats();
      console.log('📊 Service stats:', stats);
      
    } else {
      console.log('❌ HistoricalFiguresServiceBlob failed to initialize');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBlobStorage();
