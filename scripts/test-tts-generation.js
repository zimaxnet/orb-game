import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.orbgame.us';

console.log('🎵 Testing TTS Generation');
console.log('=' .repeat(50));

async function testTTSGeneration() {
  console.log('📋 Test Configuration:');
  console.log(`  Backend URL: ${BACKEND_URL}`);
  console.log('=' .repeat(50));

  // Test 1: Check if backend is healthy
  console.log('\n🔍 Test 1: Backend Health Check');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const health = await response.json();
      console.log('  ✅ Backend is healthy');
      console.log(`    Status: ${health.status}`);
      console.log(`    Version: ${health.version}`);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Backend health check failed: ${error.message}`);
    return;
  }

  // Test 2: Test story generation with TTS
  console.log('\n🔍 Test 2: Story Generation with TTS');
  try {
    console.log('  📝 Generating story with TTS...');
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: 'Technology',
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: 'en'
      })
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const stories = await response.json();
    
    if (stories && stories.length > 0) {
      const story = stories[0];
      console.log(`  ✅ Story generated in ${duration}ms`);
      console.log(`    Headline: ${story.headline}`);
      console.log(`    Summary: ${story.summary}`);
      console.log(`    TTS Audio: ${story.ttsAudio ? 'Present' : 'Missing'}`);
      
      if (story.ttsAudio) {
        console.log(`    Audio Length: ${story.ttsAudio.length} characters`);
        console.log(`    Audio Preview: ${story.ttsAudio.substring(0, 50)}...`);
      } else {
        console.log('    ⚠️ No TTS audio generated');
      }
    } else {
      throw new Error('No stories generated');
    }

  } catch (error) {
    console.log(`  ❌ Story generation failed: ${error.message}`);
  }

  // Test 3: Test different AI models
  console.log('\n🔍 Test 3: Different AI Models');
  const models = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];
  
  for (const model of models) {
    try {
      console.log(`  📝 Testing ${model}...`);
      
      const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/Science`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: 'Science',
          epoch: 'Modern',
          model: model,
          count: 1,
          language: 'en'
        })
      });

      if (response.ok) {
        const stories = await response.json();
        if (stories && stories.length > 0) {
          const story = stories[0];
          console.log(`    ✅ ${model}: ${story.ttsAudio ? 'TTS Present' : 'TTS Missing'}`);
        } else {
          console.log(`    ⚠️ ${model}: No stories generated`);
        }
      } else {
        console.log(`    ❌ ${model}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`    ❌ ${model}: ${error.message}`);
    }
  }

  // Test 4: Test Spanish language
  console.log('\n🔍 Test 4: Spanish Language TTS');
  try {
    console.log('  📝 Testing Spanish TTS...');
    
    const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/Art`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: 'Art',
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: 'es'
      })
    });

    if (response.ok) {
      const stories = await response.json();
      if (stories && stories.length > 0) {
        const story = stories[0];
        console.log(`    ✅ Spanish TTS: ${story.ttsAudio ? 'Present' : 'Missing'}`);
        console.log(`    Headline: ${story.headline}`);
      } else {
        console.log('    ⚠️ No Spanish stories generated');
      }
    } else {
      console.log(`    ❌ Spanish TTS failed: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`    ❌ Spanish TTS error: ${error.message}`);
  }

  // Test 5: Check Azure TTS endpoint directly
  console.log('\n🔍 Test 5: Azure TTS Endpoint Check');
  try {
    console.log('  📝 Testing Azure TTS endpoint...');
    
    // This would require Azure credentials, so we'll just check if the endpoint is configured
    console.log('    ℹ️ Azure TTS endpoint check requires Azure credentials');
    console.log('    ℹ️ Check if AZURE_OPENAI_TTS_DEPLOYMENT is configured correctly');
    console.log('    ℹ️ Verify Azure OpenAI TTS deployment exists and is accessible');
  } catch (error) {
    console.log(`    ❌ Azure TTS check failed: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎵 TTS Generation Test Complete');
  console.log('=' .repeat(50));
  console.log('📋 Summary:');
  console.log('  - Check if Azure OpenAI TTS deployment is configured');
  console.log('  - Verify AZURE_OPENAI_TTS_DEPLOYMENT environment variable');
  console.log('  - Check Azure OpenAI API key permissions');
  console.log('  - Verify TTS deployment exists in Azure portal');
  console.log('=' .repeat(50));
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testTTSGeneration()
    .then(() => {
      console.log('\n🎵 TTS Test Complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 TTS test failed:', error);
      process.exit(1);
    });
}

export { testTTSGeneration }; 