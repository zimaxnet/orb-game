#!/usr/bin/env node

/**
 * Test Story Generation API Script
 * Tests the story generation API to see if TTS audio is being returned
 */

const BACKEND_URL = 'https://api.orbgame.us';

async function testStoryAPI() {
  console.log('🧪 Testing Story Generation API...');
  
  try {
    // Test 1: Generate story with TTS
    console.log('\n📖 Testing story generation with TTS...');
    const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: 'en'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Story generation successful');
      console.log(`📊 Response type: ${Array.isArray(data) ? 'Array' : typeof data}`);
      
      if (Array.isArray(data) && data.length > 0) {
        const story = data[0];
        console.log(`📝 Story headline: ${story.headline}`);
        console.log(`📝 Story summary: ${story.summary?.substring(0, 100)}...`);
        
        if (story.ttsAudio) {
          console.log(`🎵 TTS Audio: Available (${story.ttsAudio.length} characters)`);
          console.log(`🎵 TTS Audio preview: ${story.ttsAudio.substring(0, 50)}...`);
        } else {
          console.log(`🔇 TTS Audio: Not available`);
        }
        
        // Check all story fields
        console.log(`📋 Story fields:`, Object.keys(story));
      } else {
        console.log('⚠️ No stories in response');
      }
    } else {
      console.error(`❌ Story generation failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
    
    // Test 2: Chat API with TTS
    console.log('\n💬 Testing chat API with TTS...');
    const chatResponse = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Tell me a short story about technology',
        userId: `test-${Date.now()}`
      })
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat response successful');
      console.log(`📝 Response: ${chatData.response?.substring(0, 100)}...`);
      
      if (chatData.audioData) {
        console.log(`🎵 Chat Audio: Available (${chatData.audioData.length} characters)`);
        console.log(`🎵 Chat Audio preview: ${chatData.audioData.substring(0, 50)}...`);
      } else {
        console.log(`🔇 Chat Audio: Not available`);
      }
      
      // Check all response fields
      console.log(`📋 Response fields:`, Object.keys(chatData));
    } else {
      console.error(`❌ Chat API failed: ${chatResponse.status} ${chatResponse.statusText}`);
      const errorText = await chatResponse.text();
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testStoryAPI().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
}); 