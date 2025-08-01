import HistoricalFiguresImageService from '../backend/historical-figures-image-service.js';

async function testNewImageService() {
    console.log('🧪 Testing New Image Service...\n');
    
    const imageService = new HistoricalFiguresImageService();
    
    try {
        // Connect to MongoDB
        await imageService.connect();
        console.log('✅ Connected to MongoDB\n');
        
        // Test 1: Get images for Archimedes (should use primary source)
        console.log('🔍 Test 1: Getting images for Archimedes...');
        const archimedesImages = await imageService.getFigureImages('Archimedes', 'Technology', 'Ancient', 'portraits');
        console.log(`✅ Archimedes images: ${archimedesImages.length} found`);
        if (archimedesImages.length > 0) {
            console.log(`   Portrait URL: ${archimedesImages[0].url}`);
        }
        console.log('');
        
        // Test 2: Get images for Albert Einstein (should use primary source)
        console.log('🔍 Test 2: Getting images for Albert Einstein...');
        const einsteinImages = await imageService.getFigureImages('Albert Einstein', 'Science', 'Modern', 'portraits');
        console.log(`✅ Einstein images: ${einsteinImages.length} found`);
        if (einsteinImages.length > 0) {
            console.log(`   Portrait URL: ${einsteinImages[0].url}`);
        }
        console.log('');
        
        // Test 3: Get images for unknown figure (should use fallback)
        console.log('🔍 Test 3: Getting images for unknown figure...');
        const unknownImages = await imageService.getFigureImages('Unknown Figure', 'Technology', 'Ancient', 'portraits');
        console.log(`✅ Unknown figure images: ${unknownImages.length} found`);
        if (unknownImages.length > 0) {
            console.log(`   Portrait URL: ${unknownImages[0].url}`);
        }
        console.log('');
        
        // Test 4: Get gallery images
        console.log('🔍 Test 4: Getting gallery for Archimedes...');
        const archimedesGallery = await imageService.getFigureGallery('Archimedes', 'Technology', 'Ancient', 3);
        console.log(`✅ Archimedes gallery: ${archimedesGallery.length} images found`);
        archimedesGallery.forEach((img, index) => {
            console.log(`   Gallery ${index + 1}: ${img.url}`);
        });
        console.log('');
        
        // Test 5: Get image stats
        console.log('🔍 Test 5: Getting image statistics...');
        const stats = await imageService.getImageStats();
        console.log(`✅ Image stats:`);
        console.log(`   Total figures: ${stats.totalFigures}`);
        console.log(`   Total images: ${stats.totalImages}`);
        console.log(`   Primary sources: ${stats.sources.primary}`);
        console.log(`   Fallback sources: ${stats.sources.fallbacks}`);
        console.log('');
        
        // Test 6: Test figure name extraction
        console.log('🔍 Test 6: Testing figure name extraction...');
        const testStory = {
            title: "Archimedes' Discovery",
            content: "Archimedes was a great mathematician who discovered the principle of buoyancy.",
            historicalFigure: "Archimedes"
        };
        const extractedName = imageService.extractFigureName(testStory);
        console.log(`✅ Extracted figure name: ${extractedName}`);
        console.log('');
        
        console.log('🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await imageService.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testNewImageService(); 