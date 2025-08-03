#!/usr/bin/env node

import { MissingStoryGenerator } from './generate-missing-stories.js';

async function testFixedGeneration() {
  console.log('🧪 Testing Fixed Story Generation...');
  console.log('====================================');
  
  const generator = new MissingStoryGenerator();
  
  try {
    await generator.initialize();
    
    // Test a single story generation
    console.log('\n📝 Testing single story generation...');
    
    const testFigure = {
      name: 'Alan Turing',
      context: 'He was a brilliant mathematician and computer scientist who laid the foundation for modern computing.'
    };
    
    const stories = await generator.generateStoryWithO4Mini('Technology', 'Modern', testFigure, 'en');
    
    if (stories.length > 0) {
      console.log('✅ Story generation successful!');
      console.log(`📊 Generated ${stories.length} stories`);
      console.log(`📝 First story headline: ${stories[0].headline}`);
      console.log(`🎵 TTS audio generated: ${stories[0].ttsAudio ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Story generation failed');
    }
    
    console.log('\n📊 Error Statistics:');
    console.log(`   JSON Parse Errors: ${generator.errorStats.jsonParseErrors}`);
    console.log(`   TTS Generation Errors: ${generator.errorStats.ttsErrors}`);
    console.log(`   API Errors: ${generator.errorStats.apiErrors}`);
    console.log(`   Network Errors: ${generator.errorStats.networkErrors}`);
    console.log(`   Total Errors: ${generator.errorStats.totalErrors}`);
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await generator.disconnect();
  }
}

testFixedGeneration().catch(console.error); 