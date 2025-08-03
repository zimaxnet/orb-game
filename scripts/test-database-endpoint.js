#!/usr/bin/env node

/**
 * Test Database Endpoint Script
 * Tests the database endpoint to see if it returns stories with TTS audio
 */

const BACKEND_URL = 'https://api.orbgame.us';

async function testDatabaseEndpoint() {
  console.log('🧪 Testing Database Endpoint...');
  
  try {
    // Test the positive news endpoint
    console.log('\n📖 Testing positive news endpoint...');
    const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/Technology?count=3&epoch=Modern`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database endpoint successful');
      console.log(`📊 Response type: ${Array.isArray(data) ? 'Array' : typeof data}`);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📝 Found ${data.length} stories`);
        
        for (let i = 0; i < data.length; i++) {
          const story = data[i];
          console.log(`\n📖 Story ${i + 1}:`);
          console.log(`   Headline: ${story.headline}`);
          console.log(`   Summary: ${story.summary?.substring(0, 100)}...`);
          console.log(`   Source: ${story.source}`);
          console.log(`   Published: ${story.publishedAt}`);
          
          if (story.ttsAudio) {
            console.log(`   🎵 TTS Audio: Available (${story.ttsAudio.length} characters)`);
            console.log(`   🎵 TTS Audio preview: ${story.ttsAudio.substring(0, 50)}...`);
          } else {
            console.log(`   🔇 TTS Audio: Not available`);
          }
          
          // Check all story fields
          console.log(`   📋 Story fields:`, Object.keys(story));
        }
        
        // Count stories with TTS
        const storiesWithTTS = data.filter(story => story.ttsAudio);
        console.log(`\n📊 Summary:`);
        console.log(`   Total stories: ${data.length}`);
        console.log(`   Stories with TTS: ${storiesWithTTS.length}`);
        console.log(`   TTS success rate: ${((storiesWithTTS.length / data.length) * 100).toFixed(1)}%`);
        
      } else {
        console.log('⚠️ No stories in response');
      }
    } else {
      console.error(`❌ Database endpoint failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testDatabaseEndpoint().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
}); 