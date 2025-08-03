#!/usr/bin/env node

/**
 * Test Spanish Story Generation
 * 
 * This script tests whether Spanish stories are being generated in Spanish
 * by calling the backend API directly.
 */

const fetch = (await import('node-fetch')).default;

async function testSpanishStoryGeneration() {
  console.log('🧪 Testing Spanish Story Generation...\n');

  try {
    // Test Spanish story generation
    console.log('📝 Testing Spanish story generation for Technology/Modern...');
    
    const response = await fetch('https://api.orbgame.us/api/orb/historical-figures/Technology?count=1&epoch=Modern&language=es', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const stories = await response.json();
    
    if (stories && stories.length > 0) {
      const story = stories[0];
      console.log('✅ Spanish story generated successfully!');
      console.log('\n📄 Story Content:');
      console.log(`Headline: ${story.headline}`);
      console.log(`Summary: ${story.summary}`);
      console.log(`Full Text: ${story.fullText}`);
      console.log(`Language: ${story.language}`);
      console.log(`Historical Figure: ${story.historicalFigure}`);
      
      // Check if the story is actually in Spanish
      const spanishIndicators = [
        'de', 'la', 'el', 'en', 'y', 'que', 'por', 'con', 'su', 'para',
        'una', 'un', 'es', 'son', 'fue', 'era', 'hizo', 'creó', 'desarrolló'
      ];
      
      const text = `${story.headline} ${story.summary} ${story.fullText}`.toLowerCase();
      const spanishWordCount = spanishIndicators.filter(word => text.includes(word)).length;
      
      console.log(`\n🔍 Spanish Analysis:`);
      console.log(`Spanish words found: ${spanishWordCount}`);
      
      if (spanishWordCount > 3) {
        console.log('✅ Story appears to be in Spanish!');
      } else {
        console.log('⚠️ Story may still be in English - check content above');
      }
      
    } else {
      console.log('❌ No stories returned');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSpanishStoryGeneration().catch(console.error); 