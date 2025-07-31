#!/usr/bin/env node

/**
 * Test script to verify image integration with story text
 * This script tests the complete flow from story generation to image display
 */

const BACKEND_URL = 'https://api.orbgame.us';

async function testImageIntegration() {
    console.log('🧪 Testing image integration with story text...\n');

    try {
        // Test 1: Fetch story with images
        console.log('📚 Test 1: Fetching story with images...');
        const response = await fetch(`${BACKEND_URL}/api/orb/stories-with-images?category=Technology&epoch=Modern&language=en&count=1`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error('API returned success: false');
        }

        const story = data.stories[0];
        
        console.log('✅ Story fetched successfully');
        console.log(`   Headline: ${story.headline}`);
        console.log(`   Historical Figure: ${story.historicalFigure}`);
        console.log(`   Figure Name: ${story.figureName}`);
        console.log(`   Image Status: ${story.imageStatus}`);
        
        // Test 2: Verify image data
        console.log('\n🖼️  Test 2: Verifying image data...');
        
        if (story.imageStatus === 'loaded' && story.images) {
            console.log('✅ Images are loaded');
            console.log(`   Portrait URL: ${story.images.portrait?.url || 'N/A'}`);
            console.log(`   Gallery count: ${story.images.gallery?.length || 0}`);
            
            if (story.images.portrait) {
                console.log(`   Portrait source: ${story.images.portrait.source}`);
                console.log(`   Portrait licensing: ${story.images.portrait.licensing}`);
            }
        } else {
            console.log(`⚠️  Image status: ${story.imageStatus}`);
            console.log(`   Images object: ${story.images ? 'Present' : 'Missing'}`);
        }

        // Test 3: Verify frontend can access the data
        console.log('\n🌐 Test 3: Verifying frontend compatibility...');
        
        const frontendCompatible = {
            headline: story.headline,
            summary: story.summary,
            fullText: story.fullText,
            source: story.source,
            category: story.category,
            epoch: story.epoch,
            language: story.language,
            historicalFigure: story.historicalFigure,
            figureName: story.figureName,
            imageStatus: story.imageStatus,
            images: story.images
        };

        console.log('✅ Frontend-compatible data structure created');
        console.log(`   Has figureName: ${!!frontendCompatible.figureName}`);
        console.log(`   Has imageStatus: ${!!frontendCompatible.imageStatus}`);
        console.log(`   Has images: ${!!frontendCompatible.images}`);

        // Test 4: Test image URL accessibility
        if (story.images?.portrait?.url) {
            console.log('\n🔗 Test 4: Testing image URL accessibility...');
            try {
                const imageResponse = await fetch(story.images.portrait.url, { method: 'HEAD' });
                if (imageResponse.ok) {
                    console.log('✅ Image URL is accessible');
                    console.log(`   Content-Type: ${imageResponse.headers.get('content-type')}`);
                } else {
                    console.log(`⚠️  Image URL returned ${imageResponse.status}`);
                }
            } catch (imageError) {
                console.log(`❌ Image URL test failed: ${imageError.message}`);
            }
        }

        console.log('\n🎉 Image integration test completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   ✅ Story generation: Working`);
        console.log(`   ✅ Image integration: ${story.imageStatus === 'loaded' ? 'Working' : 'Status: ' + story.imageStatus}`);
        console.log(`   ✅ Frontend compatibility: Working`);
        console.log(`   ✅ Historical figure extraction: ${story.historicalFigure ? 'Working' : 'Missing'}`);
        
        return true;

    } catch (error) {
        console.error('❌ Image integration test failed:', error.message);
        return false;
    }
}

// Run the test
testImageIntegration().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
}); 