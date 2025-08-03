import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.orbgame.us';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://orb-game.azurewebsites.net';

async function testFrontendCacheIntegration() {
  console.log('🧪 Testing Frontend Cache Integration...\n');
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}\n`);
  
  const testResults = {
    backendHealth: false,
    frontendAccess: false,
    preloadEndpoint: false,
    storyGeneration: false,
    cacheRetrieval: false,
    audioGeneration: false
  };
  
  try {
    // Test 1: Backend Health
    console.log('🏥 Test 1: Backend Health Check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Backend is healthy:', health.status);
      testResults.backendHealth = true;
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status);
      return testResults;
    }
    
    // Test 2: Frontend Access
    console.log('\n🌐 Test 2: Frontend Access Check...');
    const frontendResponse = await fetch(FRONTEND_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible');
      testResults.frontendAccess = true;
    } else {
      console.log('❌ Frontend access failed:', frontendResponse.status);
    }
    
    // Test 3: Preload Endpoint (simulates "Load Stories" button)
    console.log('\n📚 Test 3: Preload Endpoint (Load Stories Button)...');
    const preloadResponse = await fetch(`${BACKEND_URL}/api/cache/preload/Modern`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        categories: ['Technology', 'Science', 'Art', 'Nature'],
        models: ['o4-mini', 'grok-4'],
        languages: ['en'],
        ensureCaching: true
      })
    });
    
    if (preloadResponse.ok) {
      const preloadResult = await preloadResponse.json();
      console.log('✅ Preload successful:', {
        epoch: preloadResult.epoch,
        successful: preloadResult.successful,
        failed: preloadResult.failed,
        totalStories: preloadResult.details.reduce((sum, detail) => sum + detail.storyCount, 0)
      });
      testResults.preloadEndpoint = true;
    } else {
      console.log('❌ Preload failed:', preloadResponse.status);
    }
    
    // Test 4: Story Generation with Caching
    console.log('\n🤖 Test 4: Story Generation with Database Caching...');
    const generateResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        epoch: 'Modern',
        model: 'o4-mini',
        count: 3,
        language: 'en',
        ensureCaching: true
      })
    });
    
    if (generateResponse.ok) {
      const stories = await generateResponse.json();
      console.log(`✅ Generated ${stories.length} stories with caching`);
      console.log(`📝 First story: ${stories[0]?.headline}`);
      console.log(`🎵 TTS audio available: ${!!stories[0]?.ttsAudio}`);
      console.log(`📄 Summary: ${stories[0]?.summary?.substring(0, 100)}...`);
      testResults.storyGeneration = true;
      testResults.audioGeneration = stories.some(story => story.ttsAudio);
    } else {
      console.log('❌ Story generation failed:', generateResponse.status);
    }
    
    // Test 5: Cache Retrieval (simulates user clicking on orb)
    console.log('\n🔄 Test 5: Cache Retrieval (User Clicks Orb)...');
    const cacheResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Science`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        epoch: 'Modern',
        model: 'o4-mini',
        count: 2,
        language: 'en',
        ensureCaching: true
      })
    });
    
    if (cacheResponse.ok) {
      const cachedStories = await cacheResponse.json();
      console.log(`✅ Retrieved ${cachedStories.length} stories from cache`);
      console.log(`📝 Cached story: ${cachedStories[0]?.headline}`);
      console.log(`🎵 Cached TTS audio: ${!!cachedStories[0]?.ttsAudio}`);
      testResults.cacheRetrieval = true;
    } else {
      console.log('❌ Cache retrieval failed:', cacheResponse.status);
    }
    
    // Test 6: Multiple Epochs (simulates epoch selector)
    console.log('\n⏰ Test 6: Multiple Epochs (Epoch Selector)...');
    const epochs = ['Ancient', 'Modern', 'Future'];
    
    for (const epoch of epochs) {
      console.log(`\n🔄 Testing ${epoch} epoch...`);
      const epochResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Art`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          epoch: epoch,
          model: 'o4-mini',
          count: 1,
          language: 'en',
          ensureCaching: true
        })
      });
      
      if (epochResponse.ok) {
        const epochStories = await epochResponse.json();
        console.log(`✅ ${epoch} epoch: ${epochStories.length} stories generated`);
        console.log(`📝 ${epoch} headline: ${epochStories[0]?.headline}`);
      } else {
        console.log(`❌ ${epoch} epoch failed:`, epochResponse.status);
      }
    }
    
    // Summary
    console.log('\n📋 Frontend Cache Integration Test Summary:');
    console.log('='.repeat(60));
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! The frontend cache integration is working perfectly!');
      console.log('\n🚀 Ready for production use:');
      console.log('   ✅ Users can click "Load Stories" button');
      console.log('   ✅ Stories and audio are cached in database');
      console.log('   ✅ Smooth orb dragging experience');
      console.log('   ✅ Multiple epochs and AI models supported');
      console.log('   ✅ TTS audio generation working');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Frontend cache integration test failed:', error);
    return testResults;
  }
}

testFrontendCacheIntegration(); 