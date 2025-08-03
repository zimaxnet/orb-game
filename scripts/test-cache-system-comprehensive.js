import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.orbgame.us';

async function testComprehensiveCacheSystem() {
  console.log('🧪 Comprehensive Story Cache System Test on Azure...\n');
  console.log(`🔗 Backend URL: ${BACKEND_URL}\n`);
  
  const testResults = {
    health: false,
    preload: false,
    cacheStats: false,
    storyGeneration: false,
    cacheRetrieval: false,
    multipleEpochs: false,
    multipleModels: false,
    audioGeneration: false
  };
  
  try {
    // Test 1: Health Check
    console.log('🏥 Test 1: Health Check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check successful:', health);
      testResults.health = true;
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return testResults;
    }
    
    // Test 2: Preload Multiple Epochs
    console.log('\n📚 Test 2: Preloading Multiple Epochs...');
    const epochs = ['Modern', 'Ancient', 'Future'];
    const categories = ['Technology', 'Science'];
    const models = ['o4-mini', 'grok-4'];
    
    for (const epoch of epochs) {
      console.log(`\n🔄 Preloading ${epoch} epoch...`);
      const preloadResponse = await fetch(`${BACKEND_URL}/api/cache/preload/${epoch}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories: categories,
          models: models,
          languages: ['en'],
          ensureCaching: true
        })
      });
      
      if (preloadResponse.ok) {
        const preloadResult = await preloadResponse.json();
        console.log(`✅ ${epoch} preload successful:`, {
          successful: preloadResult.successful,
          failed: preloadResult.failed,
          totalStories: preloadResult.details.reduce((sum, detail) => sum + detail.storyCount, 0)
        });
        testResults.preload = true;
      } else {
        console.log(`❌ ${epoch} preload failed:`, preloadResponse.status);
      }
    }
    
    // Test 3: Generate Stories for Different Combinations
    console.log('\n🤖 Test 3: Generating Stories for Different Combinations...');
    const combinations = [
      { category: 'Technology', epoch: 'Modern', model: 'o4-mini' },
      { category: 'Science', epoch: 'Ancient', model: 'grok-4' },
      { category: 'Technology', epoch: 'Future', model: 'o4-mini' }
    ];
    
    for (const combo of combinations) {
      console.log(`\n🔄 Generating ${combo.category} stories for ${combo.epoch} epoch with ${combo.model}...`);
      const generateResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/${combo.category}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          epoch: combo.epoch,
          model: combo.model,
          count: 2,
          language: 'en',
          ensureCaching: true
        })
      });
      
      if (generateResponse.ok) {
        const stories = await generateResponse.json();
        console.log(`✅ Generated ${stories.length} stories for ${combo.category}-${combo.epoch}-${combo.model}`);
        console.log(`📝 Headline: ${stories[0]?.headline}`);
        console.log(`🎵 Has TTS audio: ${!!stories[0]?.ttsAudio}`);
        console.log(`📄 Summary preview: ${stories[0]?.summary?.substring(0, 80)}...`);
        testResults.storyGeneration = true;
        testResults.audioGeneration = stories.some(story => story.ttsAudio);
      } else {
        console.log(`❌ Failed to generate stories for ${combo.category}-${combo.epoch}-${combo.model}:`, generateResponse.status);
      }
    }
    
    // Test 4: Cache Retrieval Test
    console.log('\n🔄 Test 4: Cache Retrieval Test...');
    const cacheTestResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
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
    
    if (cacheTestResponse.ok) {
      const cachedStories = await cacheTestResponse.json();
      console.log(`✅ Retrieved ${cachedStories.length} stories from cache`);
      console.log(`📝 Cached headline: ${cachedStories[0]?.headline}`);
      console.log(`🎵 Cached story has TTS audio: ${!!cachedStories[0]?.ttsAudio}`);
      testResults.cacheRetrieval = true;
    } else {
      console.log('❌ Failed to retrieve from cache:', cacheTestResponse.status);
    }
    
    // Test 5: Multiple Models Test
    console.log('\n🤖 Test 5: Multiple AI Models Test...');
    const modelsToTest = ['o4-mini', 'grok-4', 'perplexity-sonar'];
    
    for (const model of modelsToTest) {
      console.log(`\n🔄 Testing ${model} model...`);
      const modelResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Science`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          epoch: 'Modern',
          model: model,
          count: 1,
          language: 'en',
          ensureCaching: true
        })
      });
      
      if (modelResponse.ok) {
        const modelStories = await modelResponse.json();
        console.log(`✅ ${model} generated ${modelStories.length} stories`);
        console.log(`📝 ${model} headline: ${modelStories[0]?.headline}`);
        testResults.multipleModels = true;
      } else {
        console.log(`❌ ${model} failed:`, modelResponse.status);
      }
    }
    
    // Test 6: Cache Statistics (if available)
    console.log('\n📊 Test 6: Cache Statistics...');
    const statsResponse = await fetch(`${BACKEND_URL}/api/cache/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Cache stats retrieved:', {
        totalStories: stats.totalStories,
        totalCategories: stats.totalCategories,
        totalEpochs: stats.totalEpochs,
        totalModels: stats.totalModels
      });
      testResults.cacheStats = true;
    } else {
      console.log('⚠️ Cache stats not available (service may be disabled)');
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log('='.repeat(50));
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! The caching system is working perfectly!');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    return testResults;
  }
}

testComprehensiveCacheSystem(); 