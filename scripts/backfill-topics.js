#!/usr/bin/env node

/**
 * Backfill Topics Script
 * Uses o4-mini to generate content for all categories
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

const categories = [
  'Technology', 'Science', 'Art', 'Nature', 'Sports',
  'Music', 'Space', 'Innovation', 'Health', 'Education'
];

async function backfillCategory(category) {
  try {
    console.log(`\n🎯 Backfilling category: ${category}`);
    
    const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/${category}`);
    
    if (!response.ok) {
      console.error(`❌ Failed to backfill ${category}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.headline || !data.summary || !data.fullText) {
      console.error(`❌ Invalid data for ${category}: missing required fields`);
      return false;
    }
    
    console.log(`✅ ${category}: "${data.headline}"`);
    console.log(`   Summary: ${data.summary}`);
    console.log(`   Source: ${data.source}`);
    console.log(`   TTS Audio: ${data.ttsAudio ? '✅ Available' : '❌ Not available'}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error backfilling ${category}:`, error.message);
    return false;
  }
}

async function backfillAllTopics() {
  console.log('🚀 Starting topic backfill with o4-mini...');
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log(`📊 Backfilling ${categories.length} categories...`);
  
  const results = [];
  
  for (const category of categories) {
    const success = await backfillCategory(category);
    results.push({ category, success });
    
    // Add a small delay between requests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Backfill Results:');
  console.log('===================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${categories.length}`);
  console.log(`❌ Failed: ${failed}/${categories.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed categories:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.category}`);
    });
  }
  
  if (successful === categories.length) {
    console.log('\n🎉 All topics successfully backfilled with o4-mini!');
  } else {
    console.log('\n⚠️ Some categories failed to backfill. Check the backend logs for more details.');
  }
}

// Run the backfill
backfillAllTopics().catch(error => {
  console.error('❌ Backfill failed:', error);
  process.exit(1);
}); 