#!/usr/bin/env node

/**
 * Test Historical Figures Loading
 * Verifies that the historical figures are being loaded correctly
 */

import fs from 'fs';
import path from 'path';

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// Test historical figures loading
function testHistoricalFiguresLoading() {
  log('\n🎯 Testing Historical Figures Loading', colors.blue);
  
  try {
    // Read the historical figures file
    const seedData = JSON.parse(fs.readFileSync('OrbGameInfluentialPeopleSeeds', 'utf8'));
    
    log('✅ Successfully loaded historical figures file', colors.green);
    
    // Test a few categories and epochs
    const testCases = [
      { category: 'Technology', epoch: 'Modern' },
      { category: 'Science', epoch: 'Ancient' },
      { category: 'Art', epoch: 'Medieval' },
      { category: 'Space', epoch: 'Modern' }
    ];
    
    for (const testCase of testCases) {
      const { category, epoch } = testCase;
      
      if (seedData[category] && seedData[category][epoch]) {
        const figures = seedData[category][epoch];
        log(`✅ ${category} - ${epoch}: Found ${figures.length} figures`, colors.green);
        
        // Show the first figure
        if (figures.length > 0) {
          const firstFigure = figures[0];
          log(`   📚 Example: ${firstFigure.name} - ${firstFigure.context}`, colors.cyan);
        }
      } else {
        log(`❌ ${category} - ${epoch}: No figures found`, colors.red);
      }
    }
    
    // Test the specific prompt generation
    log('\n🔧 Testing Prompt Generation', colors.blue);
    
    for (const testCase of testCases) {
      const { category, epoch } = testCase;
      
      if (seedData[category] && seedData[category][epoch]) {
        const figures = seedData[category][epoch];
        const figureNames = figures.map(fig => fig.name).join(', ');
        
        const prompt = `Tell the story of one of these specific historical figures: ${figureNames}. Focus on their name, specific achievements in ${category.toLowerCase()}, and how their innovations changed the world during ${epoch.toLowerCase()} times. Include their background, the challenges they faced, and the lasting impact of their contributions. Make it engaging and educational with concrete details about their life and work.`;
        
        log(`📝 ${category} - ${epoch} Prompt:`, colors.yellow);
        log(`   ${prompt.substring(0, 100)}...`, colors.cyan);
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to load historical figures: ${error.message}`, colors.red);
    return false;
  }
}

// Main test runner
async function runHistoricalFiguresTests() {
  log('🎯 Historical Figures Loading Test', colors.magenta);
  log('================================', colors.magenta);
  
  const success = testHistoricalFiguresLoading();
  
  log('\n📊 Test Summary:', colors.magenta);
  log('================', colors.magenta);
  
  if (success) {
    log('✅ Historical figures are being loaded correctly!', colors.green);
    log('🔧 The backend should now generate stories about specific historical figures.', colors.cyan);
  } else {
    log('❌ Issues detected with historical figures loading.', colors.red);
    log('🔧 Check the file path and format.', colors.yellow);
  }
  
  return success;
}

// Run tests
runHistoricalFiguresTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 