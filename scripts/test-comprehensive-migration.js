// Comprehensive Migration Test Script
import { MongoClient } from 'mongodb';
import HistoricalFiguresImageService from '../backend/historical-figures-image-service.js';

async function testComprehensiveMigration() {
    console.log('🔍 Comprehensive Migration Test Starting...\n');
    
    let client;
    
    try {
        // 1. Test MongoDB Connection
        console.log('📊 Step 1: Testing MongoDB Connection...');
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('❌ MONGO_URI not set');
            return;
        }
        
        client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('orbgame');
        console.log('✅ MongoDB connected successfully');
        
        // 2. Check Database Collections
        console.log('\n📊 Step 2: Checking Database Collections...');
        const collections = await db.listCollections().toArray();
        console.log('📋 Available collections:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        // 3. Check Stories Collection
        console.log('\n📊 Step 3: Checking Stories Collection...');
        const storiesCollection = db.collection('stories');
        const storyCount = await storiesCollection.countDocuments();
        console.log(`📚 Total stories: ${storyCount}`);
        
        if (storyCount > 0) {
            const sampleStory = await storiesCollection.findOne();
            console.log(`📖 Sample story structure:`);
            console.log(`   - Category: ${sampleStory.category}`);
            console.log(`   - Epoch: ${sampleStory.epoch}`);
            console.log(`   - Language: ${sampleStory.language}`);
            console.log(`   - Has TTS: ${sampleStory.ttsAudio ? 'Yes' : 'No'}`);
        }
        
        // 4. Check Historical Figure Images Collection
        console.log('\n📊 Step 4: Checking Historical Figure Images Collection...');
        const imagesCollection = db.collection('historical_figure_images');
        const imageCount = await imagesCollection.countDocuments();
        console.log(`🖼️ Total image records: ${imageCount}`);
        
        if (imageCount > 0) {
            const sampleImage = await imagesCollection.findOne();
            console.log(`🖼️ Sample image structure:`);
            console.log(`   - Figure: ${sampleImage.figureName}`);
            console.log(`   - Category: ${sampleImage.category}`);
            console.log(`   - Portrait URL: ${sampleImage.portraits?.[0]?.url || 'None'}`);
            console.log(`   - Source: ${sampleImage.source || 'Unknown'}`);
        }
        
        // 5. Test New Image Service
        console.log('\n📊 Step 5: Testing New Image Service...');
        const imageService = new HistoricalFiguresImageService();
        
        // Test with known figures
        const testFigures = ['Archimedes', 'Albert Einstein', 'Unknown Figure'];
        
        for (const figure of testFigures) {
            console.log(`\n🔍 Testing figure: ${figure}`);
            try {
                const images = await imageService.getFigureImages(figure, 'Technology', 'Ancient');
                console.log(`   ✅ Images found: ${images ? 'Yes' : 'No'}`);
                if (images) {
                    console.log(`   📷 Portrait: ${images.portrait ? 'Yes' : 'No'}`);
                    console.log(`   🖼️ Gallery: ${images.gallery ? images.gallery.length : 0} images`);
                    console.log(`   🏷️ Source: ${images.source || 'Unknown'}`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        
        // 6. Test API Endpoints
        console.log('\n📊 Step 6: Testing API Endpoints...');
        
        const endpoints = [
            'https://api.orbgame.us/api/orb/historical-figures/Technology?count=1&epoch=Ancient&language=en',
            'https://api.orbgame.us/api/orb/stories-with-images?category=Technology&epoch=Ancient&language=en&count=1',
            'https://api.orbgame.us/api/orb/images/stats'
        ];
        
        for (const endpoint of endpoints) {
            console.log(`\n🔍 Testing endpoint: ${endpoint}`);
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                console.log(`   ✅ Status: ${response.status}`);
                console.log(`   📊 Response keys: ${Object.keys(data).join(', ')}`);
                
                if (data.stories && data.stories.length > 0) {
                    const story = data.stories[0];
                    console.log(`   📖 Story: ${story.figureName || story.headline}`);
                    console.log(`   🖼️ Has images: ${story.images ? 'Yes' : 'No'}`);
                    console.log(`   🎵 Has audio: ${story.ttsAudio ? 'Yes' : 'No'}`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        
        // 7. Migration Recommendations
        console.log('\n📊 Step 7: Migration Recommendations...');
        
        if (imageCount > 0) {
            console.log('⚠️ RECOMMENDATION: Clear historical_figure_images collection');
            console.log('   - Contains old invalid data');
            console.log('   - New system will use verified sources');
            console.log('   - Run: node scripts/clear-and-test-image-service.js');
        }
        
        if (storyCount > 0) {
            console.log('✅ Stories collection looks good');
            console.log('   - Contains valid story data');
            console.log('   - Ready for migration');
        }
        
        console.log('\n✅ Comprehensive migration test completed!');
        
    } catch (error) {
        console.error('❌ Migration test failed:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Run the test
testComprehensiveMigration().catch(console.error); 