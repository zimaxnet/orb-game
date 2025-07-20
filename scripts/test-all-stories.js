#!/usr/bin/env node

/**
 * Test All Stories Script
 * Tests getting all stories from the database to see how many are available
 */

const BACKEND_URL = 'https://api.orbgame.us';

async function testAllStories() {
  console.log('🧪 Testing All Stories from Database...');
  
  try {
    // Test getting all stories for Technology category
    console.log('\n📖 Testing database endpoint with high count...');
    const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/Technology?count=50&epoch=Modern`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database endpoint successful');
      console.log(`📊 Response type: ${Array.isArray(data) ? 'Array' : typeof data}`);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📝 Found ${data.length} stories`);
        
        // Count stories with TTS
        const storiesWithTTS = data.filter(story => story.ttsAudio);
        const storiesWithoutTTS = data.filter(story => !story.ttsAudio);
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total stories: ${data.length}`);
        console.log(`   Stories with TTS: ${storiesWithTTS.length}`);
        console.log(`   Stories without TTS: ${storiesWithoutTTS.length}`);
        console.log(`   TTS success rate: ${((storiesWithTTS.length / data.length) * 100).toFixed(1)}%`);
        
        // Show first few stories
        console.log(`\n📖 First 3 stories:`);
        for (let i = 0; i < Math.min(3, data.length); i++) {
          const story = data[i];
          console.log(`\n   Story ${i + 1}:`);
          console.log(`   Headline: ${story.headline}`);
          console.log(`   Source: ${story.source}`);
          console.log(`   TTS: ${story.ttsAudio ? 'Available' : 'Not available'}`);
          if (story.ttsAudio) {
            console.log(`   TTS Length: ${story.ttsAudio.length} characters`);
          }
        }
        
        // Show categories if available
        const categories = [...new Set(data.map(story => story.category))];
        console.log(`\n📋 Categories found: ${categories.join(', ')}`);
        
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
testAllStories().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
}); 