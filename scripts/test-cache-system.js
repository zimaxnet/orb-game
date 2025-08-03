import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.orbgame.us';

async function testCacheSystem() {
  console.log('🧪 Testing Story Cache System on Azure...\n');
  console.log(`🔗 Backend URL: ${BACKEND_URL}\n`);
  
  try {
    // Test 1: Check health endpoint
    console.log('🏥 Test 1: Checking health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check successful:', health);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return;
    }
    
    // Test 2: Preload stories for Modern epoch
    console.log('\n📚 Test 2: Preloading stories for Modern epoch...');
    const preloadResponse = await fetch(`${BACKEND_URL}/api/cache/preload/Modern`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        categories: ['Technology', 'Science'],
        models: ['o4-mini'],
        languages: ['en'],
        ensureCaching: true
      })
    });
    
    if (preloadResponse.ok) {
      const preloadResult = await preloadResponse.json();
      console.log('✅ Preload successful:', preloadResult);
    } else {
      console.log('❌ Preload failed:', preloadResponse.status);
      const errorText = await preloadResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 3: Check cache statistics
    console.log('\n📊 Test 3: Checking cache statistics...');
    const statsResponse = await fetch(`${BACKEND_URL}/api/cache/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Cache stats:', stats);
    } else {
      console.log('❌ Failed to get cache stats:', statsResponse.status);
    }
    
    // Test 4: Generate stories and verify caching
    console.log('\n🤖 Test 4: Generating stories with caching...');
    const generateResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
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
    
    if (generateResponse.ok) {
      const stories = await generateResponse.json();
      console.log('✅ Generated stories:', stories.length);
      console.log('📝 First story headline:', stories[0]?.headline);
      console.log('🎵 Has TTS audio:', !!stories[0]?.ttsAudio);
      console.log('📄 Story summary:', stories[0]?.summary?.substring(0, 100) + '...');
    } else {
      console.log('❌ Failed to generate stories:', generateResponse.status);
      const errorText = await generateResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 5: Check if stories exist in cache
    console.log('\n🔍 Test 5: Checking cache for Technology stories...');
    const checkResponse = await fetch(`${BACKEND_URL}/api/cache/check/Technology/Modern/o4-mini/en`);
    if (checkResponse.ok) {
      const checkResult = await checkResponse.json();
      console.log('✅ Cache check result:', checkResult);
    } else {
      console.log('❌ Failed to check cache:', checkResponse.status);
    }
    
    // Test 6: Generate stories again to test cache retrieval
    console.log('\n🔄 Test 6: Generating stories again to test cache retrieval...');
    const generateResponse2 = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
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
    
    if (generateResponse2.ok) {
      const stories2 = await generateResponse2.json();
      console.log('✅ Retrieved from cache:', stories2.length, 'stories');
      console.log('📝 Cache story headline:', stories2[0]?.headline);
      console.log('🎵 Cache story has TTS audio:', !!stories2[0]?.ttsAudio);
    } else {
      console.log('❌ Failed to retrieve from cache:', generateResponse2.status);
    }
    
    console.log('\n🎉 Cache system test completed on Azure!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCacheSystem(); 