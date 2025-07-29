#!/usr/bin/env node

/**
 * Test Historical Figures Service
 * 
 * This script tests the historical figures service to see if it's working properly.
 */

import { HistoricalFiguresService } from '../backend/historical-figures-service.js';

async function testHistoricalFiguresService() {
  console.log('🧪 Testing Historical Figures Service...\n');

  try {
    // Get MongoDB URI from environment or secrets
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGO_URI not set in environment');
      return;
    }

    console.log('🔧 Initializing HistoricalFiguresService...');
    const service = new HistoricalFiguresService(mongoUri);
    
    try {
      await service.initialize();
      console.log('✅ HistoricalFiguresService initialized successfully');
      
      // Test getting stories
      console.log('\n📚 Testing story retrieval...');
      const stories = await service.getStories('Technology', 'Modern', 'en', 1, false);
      console.log(`Found ${stories.length} stories for Technology/Modern/en`);
      
      if (stories.length > 0) {
        console.log('✅ Story retrieval working');
        console.log('Sample story:', {
          headline: stories[0].headline,
          historicalFigure: stories[0].historicalFigure,
          category: stories[0].category,
          epoch: stories[0].epoch,
          language: stories[0].language
        });
      } else {
        console.log('⚠️ No stories found - this might be expected if no stories are cached');
      }
      
      // Test getting historical figures list
      console.log('\n👥 Testing historical figures list...');
      const figures = await service.getHistoricalFiguresList('Technology', 'Modern');
      console.log(`Found ${figures.length} historical figures for Technology/Modern`);
      
      if (figures.length > 0) {
        console.log('✅ Historical figures list working');
        console.log('Sample figures:', figures.slice(0, 3).map(f => f.name));
      } else {
        console.log('⚠️ No historical figures found - check seed data');
      }
      
      // Test story generation
      console.log('\n🤖 Testing story generation...');
      const newStory = await service.generateHistoricalFigureStory('Technology', 'Modern', 'en');
      
      if (newStory) {
        console.log('✅ Story generation working');
        console.log('Generated story:', {
          headline: newStory.headline,
          historicalFigure: newStory.historicalFigure,
          category: newStory.category,
          epoch: newStory.epoch,
          language: newStory.language
        });
      } else {
        console.log('❌ Story generation failed');
      }
      
    } catch (initError) {
      console.error('❌ HistoricalFiguresService initialization failed:', initError.message);
      console.error('Stack trace:', initError.stack);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testHistoricalFiguresService().catch(console.error); 