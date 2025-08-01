#!/usr/bin/env node

/**
 * Debug Frontend API Issues
 * Tests the API endpoints that the frontend uses
 */

const BACKEND_URL = 'https://api.orbgame.us';

async function debugFrontendAPI() {
    console.log('🔍 Debugging Frontend API Issues');
    console.log('==================================\n');

    const testCases = [
        { category: 'Art', epoch: 'Ancient', language: 'en' },
        { category: 'Art', epoch: 'Modern', language: 'en' },
        { category: 'Technology', epoch: 'Modern', language: 'en' },
        { category: 'Science', epoch: 'Modern', language: 'en' }
    ];

    for (const testCase of testCases) {
        console.log(`\n📚 Testing: ${testCase.category}/${testCase.epoch}/${testCase.language}`);
        
        const url = `${BACKEND_URL}/api/orb/stories-with-images?category=${testCase.category}&epoch=${testCase.epoch}&language=${testCase.language}&count=1`;
        
        try {
            console.log(`🔗 URL: ${url}`);
            
            const startTime = Date.now();
            const response = await fetch(url);
            const endTime = Date.now();
            
            console.log(`⏱️  Response time: ${endTime - startTime}ms`);
            console.log(`📊 Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.stories && data.stories.length > 0) {
                    const story = data.stories[0];
                    console.log(`✅ Success: ${story.headline}`);
                    console.log(`📸 Image Status: ${story.imageStatus}`);
                    console.log(`👤 Figure: ${story.figureName}`);
                    console.log(`🖼️  Has Images: ${story.images ? 'Yes' : 'No'}`);
                    
                    if (story.images && story.images.portrait) {
                        console.log(`🖼️  Portrait URL: ${story.images.portrait.url.substring(0, 50)}...`);
                    }
                } else {
                    console.log(`❌ No stories returned`);
                    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
                }
            } else {
                console.log(`❌ HTTP Error: ${response.status}`);
                const errorText = await response.text();
                console.log(`📄 Error Response:`, errorText);
            }
        } catch (error) {
            console.log(`❌ Network Error: ${error.message}`);
            console.log(`🔍 Error Type: ${error.constructor.name}`);
            
            if (error.name === 'TypeError') {
                console.log(`💡 This might be a CORS or network connectivity issue`);
            }
        }
    }

    // Test with different user agents to simulate browser
    console.log('\n🌐 Testing with Browser User Agent...');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/orb/stories-with-images?category=Art&epoch=Ancient&language=en&count=1`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Browser simulation successful: ${data.stories[0].headline}`);
        } else {
            console.log(`❌ Browser simulation failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Browser simulation error: ${error.message}`);
    }
}

debugFrontendAPI().catch(console.error); 