#!/usr/bin/env node

/**
 * Test script to verify positive news fallback functionality
 * Tests all categories to ensure they have content
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

const categories = [
  'Technology', 'Science', 'Art', 'Nature', 'Sports',
  'Music', 'Space', 'Innovation', 'Health', 'Education'
];

async function testCategory(category) {
  try {
    console.log(`\n🔍 Testing category: ${category}`);
    
    const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/${category}`);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch ${category}: ${response.status} ${response.statusText}`);
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
    console.error(`❌ Error testing ${category}:`, error.message);
    return false;
  }
}

async function testAllCategories() {
  console.log('🚀 Testing positive news fallback functionality...');
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log(`📊 Testing ${categories.length} categories...`);
  
  const results = [];
  
  for (const category of categories) {
    const success = await testCategory(category);
    results.push({ category, success });
  }
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
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
    console.log('\n🎉 All categories have content! Fallback system is working correctly.');
  } else {
    console.log('\n⚠️ Some categories failed. Check the backend logs for more details.');
  }
}

// Run the test
testAllCategories().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 