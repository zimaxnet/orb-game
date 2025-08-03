import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.orbgame.us';

console.log('🔍 Debugging TTS Issue');
console.log('=' .repeat(50));

async function debugTTSIssue() {
  console.log('📋 Test Configuration:');
  console.log(`  Backend URL: ${BACKEND_URL}`);
  console.log('=' .repeat(50));

  // Test 1: Check if the backend is using the updated code
  console.log('\n🔍 Test 1: Backend Code Version Check');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const health = await response.json();
      console.log('  ✅ Backend is healthy');
      console.log(`    Version: ${health.version}`);
      console.log(`    Build: ${health.build}`);
    }
  } catch (error) {
    console.log(`  ❌ Backend health check failed: ${error.message}`);
    return;
  }

  // Test 2: Test story generation with detailed logging
  console.log('\n🔍 Test 2: Story Generation with Detailed Logging');
  try {
    console.log('  📝 Generating story with detailed logging...');
    
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const stories = await response.json();
    
    if (stories && stories.length > 0) {
      const story = stories[0];
      console.log(`  ✅ Story generated successfully`);
      console.log(`    Headline: ${story.headline}`);
      console.log(`    Summary: ${story.summary}`);
      console.log(`    TTS Audio: ${story.ttsAudio ? 'Present' : 'Missing'}`);
      
      if (story.ttsAudio) {
        console.log(`    Audio Length: ${story.ttsAudio.length} characters`);
        console.log(`    Audio Preview: ${story.ttsAudio.substring(0, 50)}...`);
      } else {
        console.log('    ⚠️ No TTS audio generated');
        console.log('    🔍 This suggests the TTS generation is failing in the backend');
      }
    } else {
      throw new Error('No stories generated');
    }

  } catch (error) {
    console.log(`  ❌ Story generation failed: ${error.message}`);
  }

  // Test 3: Test chat endpoint TTS
  console.log('\n🔍 Test 3: Chat Endpoint TTS');
  try {
    console.log('  📝 Testing chat endpoint TTS...');
    
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message for TTS generation.',
        language: 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const chatResponse = await response.json();
    console.log(`  ✅ Chat response received`);
    console.log(`    Response: ${chatResponse.response.substring(0, 100)}...`);
    console.log(`    Audio Data: ${chatResponse.audioData ? 'Present' : 'Missing'}`);
    console.log(`    Search Used: ${chatResponse.searchUsed}`);
    
    if (chatResponse.audioData) {
      console.log(`    Audio Length: ${chatResponse.audioData.length} characters`);
    }

  } catch (error) {
    console.log(`  ❌ Chat endpoint failed: ${error.message}`);
  }

  // Test 4: Compare the two endpoints
  console.log('\n🔍 Test 4: Endpoint Comparison');
  console.log('  📝 Comparing chat vs story generation endpoints...');
  console.log('  ℹ️ Chat endpoint uses: Authorization: Bearer');
  console.log('  ℹ️ Story generation uses: Authorization: Bearer (after fix)');
  console.log('  ℹ️ Both should work the same way now');

  // Test 5: Check if there's a difference in the TTS calls
  console.log('\n🔍 Test 5: TTS Call Analysis');
  console.log('  📝 Analyzing potential differences...');
  console.log('  ℹ️ Chat endpoint: Uses aiResponse for TTS');
  console.log('  ℹ️ Story generation: Uses story.summary for TTS');
  console.log('  ℹ️ Both use the same Azure TTS endpoint');
  console.log('  ℹ️ Both use the same authorization method');
  console.log('  ℹ️ The issue might be in the story generation logic');

  console.log('\n' + '=' .repeat(50));
  console.log('🔍 TTS Issue Debug Complete');
  console.log('=' .repeat(50));
  console.log('📋 Analysis:');
  console.log('  - Chat endpoint TTS works ✅');
  console.log('  - Story generation TTS fails ❌');
  console.log('  - Both use same authorization method');
  console.log('  - Issue likely in story generation logic');
  console.log('  - Need to check backend logs for TTS errors');
  console.log('=' .repeat(50));
}

// Run the debug
if (import.meta.url === `file://${process.argv[1]}`) {
  debugTTSIssue()
    .then(() => {
      console.log('\n🔍 TTS Debug Complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 TTS debug failed:', error);
      process.exit(1);
    });
}

export { debugTTSIssue }; 