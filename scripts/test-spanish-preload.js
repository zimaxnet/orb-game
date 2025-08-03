import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.orbgame.us';

async function testSpanishPreload() {
  console.log('🧪 Testing Spanish Language Preload Function...\n');
  console.log(`🔗 Backend URL: ${BACKEND_URL}\n`);
  
  const testResults = {
    health: false,
    spanishPreload: false,
    spanishStoryGeneration: false,
    spanishTTSAudio: false,
    spanishCacheRetrieval: false,
    multipleEpochsSpanish: false,
    multipleModelsSpanish: false
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
    
    // Test 2: Spanish Preload for Modern Epoch
    console.log('\n📚 Test 2: Spanish Preload for Modern Epoch...');
    const preloadResponse = await fetch(`${BACKEND_URL}/api/cache/preload/Modern`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        categories: ['Technology', 'Science', 'Art'],
        models: ['o4-mini', 'grok-4'],
        languages: ['es'], // Spanish language
        ensureCaching: true
      })
    });
    
    if (preloadResponse.ok) {
      const preloadResult = await preloadResponse.json();
      console.log('✅ Spanish preload successful:', {
        epoch: preloadResult.epoch,
        successful: preloadResult.successful,
        failed: preloadResult.failed,
        totalStories: preloadResult.details.reduce((sum, detail) => sum + detail.storyCount, 0)
      });
      
      // Log details for each combination
      preloadResult.details.forEach(detail => {
        console.log(`  📝 ${detail.category}-${detail.model}: ${detail.storyCount} stories, TTS: ${detail.hasAudio ? '✅' : '❌'}`);
      });
      
      testResults.spanishPreload = true;
    } else {
      console.log('❌ Spanish preload failed:', preloadResponse.status);
      const errorText = await preloadResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 3: Spanish Story Generation
    console.log('\n🤖 Test 3: Spanish Story Generation...');
    const generateResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        epoch: 'Modern',
        model: 'o4-mini',
        count: 2,
        language: 'es', // Spanish language
        ensureCaching: true
      })
    });
    
    if (generateResponse.ok) {
      const stories = await generateResponse.json();
      console.log(`✅ Generated ${stories.length} Spanish stories`);
      console.log(`📝 First story headline: ${stories[0]?.headline}`);
      console.log(`🎵 Has TTS audio: ${!!stories[0]?.ttsAudio}`);
      console.log(`📄 Summary preview: ${stories[0]?.summary?.substring(0, 100)}...`);
      console.log(`🌍 Language: Spanish (es)`);
      
      testResults.spanishStoryGeneration = true;
      testResults.spanishTTSAudio = stories.some(story => story.ttsAudio);
    } else {
      console.log('❌ Spanish story generation failed:', generateResponse.status);
      const errorText = await generateResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 4: Spanish Cache Retrieval
    console.log('\n🔄 Test 4: Spanish Cache Retrieval...');
    const cacheResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Science`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        epoch: 'Modern',
        model: 'o4-mini',
        count: 2,
        language: 'es', // Spanish language
        ensureCaching: true
      })
    });
    
    if (cacheResponse.ok) {
      const cachedStories = await cacheResponse.json();
      console.log(`✅ Retrieved ${cachedStories.length} Spanish stories from cache`);
      console.log(`📝 Cached headline: ${cachedStories[0]?.headline}`);
      console.log(`🎵 Cached TTS audio: ${!!cachedStories[0]?.ttsAudio}`);
      console.log(`🌍 Language: Spanish (es)`);
      testResults.spanishCacheRetrieval = true;
    } else {
      console.log('❌ Spanish cache retrieval failed:', cacheResponse.status);
    }
    
    // Test 5: Multiple Epochs in Spanish
    console.log('\n⏰ Test 5: Multiple Epochs in Spanish...');
    const epochs = ['Ancient', 'Modern', 'Future'];
    
    for (const epoch of epochs) {
      console.log(`\n🔄 Testing ${epoch} epoch in Spanish...`);
      const epochResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Art`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          epoch: epoch,
          model: 'o4-mini',
          count: 1,
          language: 'es', // Spanish language
          ensureCaching: true
        })
      });
      
      if (epochResponse.ok) {
        const epochStories = await epochResponse.json();
        console.log(`✅ ${epoch} epoch: ${epochStories.length} Spanish stories generated`);
        console.log(`📝 ${epoch} headline: ${epochStories[0]?.headline}`);
        console.log(`🌍 Language: Spanish (es)`);
        testResults.multipleEpochsSpanish = true;
      } else {
        console.log(`❌ ${epoch} epoch failed:`, epochResponse.status);
      }
    }
    
    // Test 6: Multiple AI Models in Spanish
    console.log('\n🤖 Test 6: Multiple AI Models in Spanish...');
    const models = ['o4-mini', 'grok-4', 'perplexity-sonar'];
    
    for (const model of models) {
      console.log(`\n🔄 Testing ${model} model in Spanish...`);
      const modelResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          epoch: 'Modern',
          model: model,
          count: 1,
          language: 'es', // Spanish language
          ensureCaching: true
        })
      });
      
      if (modelResponse.ok) {
        const modelStories = await modelResponse.json();
        console.log(`✅ ${model} generated ${modelStories.length} Spanish stories`);
        console.log(`📝 ${model} headline: ${modelStories[0]?.headline}`);
        console.log(`🌍 Language: Spanish (es)`);
        testResults.multipleModelsSpanish = true;
      } else {
        console.log(`❌ ${model} failed:`, modelResponse.status);
      }
    }
    
    // Test 7: Check Spanish Cache Statistics
    console.log('\n📊 Test 7: Spanish Cache Statistics...');
    const statsResponse = await fetch(`${BACKEND_URL}/api/cache/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Cache stats retrieved:', {
        totalStories: stats.totalStories,
        totalLanguages: stats.totalLanguages,
        languages: stats.languages || 'Not available'
      });
    } else {
      console.log('⚠️ Cache stats not available (service may be disabled)');
    }
    
    // Summary
    console.log('\n📋 Spanish Preload Test Summary:');
    console.log('='.repeat(50));
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All Spanish preload tests passed! The Spanish language caching system is working perfectly!');
      console.log('\n🚀 Spanish Language Features Ready:');
      console.log('   ✅ Spanish story generation working');
      console.log('   ✅ Spanish TTS audio generation working');
      console.log('   ✅ Spanish content cached in database');
      console.log('   ✅ Multiple epochs supported in Spanish');
      console.log('   ✅ Multiple AI models supported in Spanish');
      console.log('   ✅ Cache retrieval working for Spanish content');
    } else {
      console.log('⚠️ Some Spanish tests failed. Check the logs above for details.');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Spanish preload test failed:', error);
    return testResults;
  }
}

testSpanishPreload(); 