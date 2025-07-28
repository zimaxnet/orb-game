// Test script to verify historical figure stories are working
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';

async function testHistoricalFigures() {
  console.log('🧪 Testing historical figure story loading...');
  
  try {
    // Test fetching historical figure stories
    const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/Technology?count=2&epoch=Modern&language=en&storyType=historical-figure`);
    
    if (response.ok) {
      const stories = await response.json();
      console.log(`✅ Found ${stories.length} historical figure stories`);
      
      if (stories.length > 0) {
        console.log('📖 Sample story:');
        console.log(`   Headline: ${stories[0].headline}`);
        console.log(`   Summary: ${stories[0].summary}`);
        console.log(`   Has TTS: ${stories[0].ttsAudio ? 'Yes' : 'No'}`);
        console.log(`   Story Type: ${stories[0].storyType || 'Not set'}`);
      }
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHistoricalFigures(); 