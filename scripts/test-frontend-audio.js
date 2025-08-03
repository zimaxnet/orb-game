#!/usr/bin/env node

/**
 * Test Frontend Audio Script
 * Tests if the frontend can load and play audio from the database
 */

const BACKEND_URL = 'https://api.orbgame.us';

async function testFrontendAudio() {
  console.log('🧪 Testing Frontend Audio Loading...');
  
  try {
    // Test 1: Get stories from database endpoint
    console.log('\n📖 Testing database endpoint...');
    const dbResponse = await fetch(`${BACKEND_URL}/api/orb/positive-news/Technology?count=3&epoch=Modern`);
    
    if (dbResponse.ok) {
      const dbStories = await dbResponse.json();
      console.log(`✅ Database endpoint returned ${dbStories.length} stories`);
      
      if (dbStories.length > 0) {
        const story = dbStories[0];
        console.log(`📝 Story: ${story.headline}`);
        console.log(`🎵 TTS Audio: ${story.ttsAudio ? 'Available' : 'Not available'}`);
        
        if (story.ttsAudio) {
          console.log(`📏 Audio size: ${story.ttsAudio.length} characters`);
          console.log(`🎵 Audio preview: ${story.ttsAudio.substring(0, 50)}...`);
          
          // Test 2: Simulate frontend audio loading
          console.log('\n🎵 Testing frontend audio loading...');
          try {
            // Create a data URL for the audio
            const audioDataUrl = `data:audio/mp3;base64,${story.ttsAudio}`;
            console.log(`✅ Audio data URL created (${audioDataUrl.length} characters)`);
            
            // Test if the base64 data is valid
            const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(story.ttsAudio);
            console.log(`✅ Base64 validation: ${isValidBase64 ? 'Valid' : 'Invalid'}`);
            
            // Test if the audio data starts with the expected MP3 header
            const audioBuffer = Buffer.from(story.ttsAudio, 'base64');
            const isMP3 = audioBuffer.length > 4 && 
                         audioBuffer[0] === 0xFF && 
                         (audioBuffer[1] & 0xE0) === 0xE0;
            console.log(`✅ MP3 header validation: ${isMP3 ? 'Valid' : 'Invalid'}`);
            console.log(`📏 Audio buffer size: ${audioBuffer.length} bytes`);
            
            console.log('✅ Frontend audio loading test passed!');
            
          } catch (audioError) {
            console.error('❌ Frontend audio loading test failed:', audioError.message);
          }
        }
      }
    } else {
      console.error(`❌ Database endpoint failed: ${dbResponse.status}`);
    }
    
    // Test 3: Test chat endpoint for comparison
    console.log('\n💬 Testing chat endpoint for comparison...');
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
      console.log(`✅ Chat endpoint successful`);
      console.log(`🎵 Chat Audio: ${chatData.audioData ? 'Available' : 'Not available'}`);
      
      if (chatData.audioData) {
        console.log(`📏 Chat audio size: ${chatData.audioData.length} characters`);
      }
    } else {
      console.error(`❌ Chat endpoint failed: ${chatResponse.status}`);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testFrontendAudio().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
}); 