#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function monitorProgressFixed() {
  console.log('📊 MONITORING PROGRESS (UPDATED)');
  console.log('=================================');
  console.log('🔄 Checking background processes...\n');
  
  // Check story generation progress
  console.log('📚 STORY GENERATION STATUS:');
  console.log('----------------------------');
  
  try {
    if (fs.existsSync('story-generation.log')) {
      const storyLog = fs.readFileSync('story-generation.log', 'utf8');
      const lines = storyLog.split('\n');
      
      // Find key progress indicators
      const lastLine = lines[lines.length - 2] || '';
      const categoryMatches = storyLog.match(/CATEGORY \d+\/8:/g) || [];
      const successMatches = storyLog.match(/✅ Generated \d+ stories/g) || [];
      const errorMatches = storyLog.match(/❌ Error:/g) || [];
      
      console.log(`   📈 Categories processed: ${categoryMatches.length}/8`);
      console.log(`   ✅ Successful generations: ${successMatches.length}`);
      console.log(`   ❌ Errors: ${errorMatches.length}`);
      console.log(`   📝 Last activity: ${lastLine.substring(0, 80)}...`);
      
      if (storyLog.includes('EXCELLENT: Comprehensive story generation completed!')) {
        console.log('   🎉 STATUS: COMPLETED SUCCESSFULLY!');
      } else if (storyLog.includes('FATAL ERROR:')) {
        console.log('   ❌ STATUS: FAILED');
      } else {
        console.log('   🔄 STATUS: IN PROGRESS');
      }
    } else {
      console.log('   ⚠️ No story generation log found');
    }
  } catch (error) {
    console.log(`   ❌ Error reading story log: ${error.message}`);
  }
  
  console.log('\n🖼️ IMAGE DOWNLOAD STATUS (FIXED):');
  console.log('----------------------------------');
  
  try {
    if (fs.existsSync('image-download-fixed.log')) {
      const imageLog = fs.readFileSync('image-download-fixed.log', 'utf8');
      const lines = imageLog.split('\n');
      
      // Find key progress indicators
      const lastLine = lines[lines.length - 2] || '';
      const figureMatches = imageLog.match(/FIGURE \d+\/\d+:/g) || [];
      const imageMatches = imageLog.match(/✅ Image metadata saved/g) || [];
      const errorMatches = imageLog.match(/❌ Error downloading/g) || [];
      
      console.log(`   👥 Figures processed: ${figureMatches.length}`);
      console.log(`   🖼️ Images downloaded: ${imageMatches.length}`);
      console.log(`   ❌ Errors: ${errorMatches.length}`);
      console.log(`   📝 Last activity: ${lastLine.substring(0, 80)}...`);
      
      if (imageLog.includes('SUCCESS: Image download completed!')) {
        console.log('   🎉 STATUS: COMPLETED SUCCESSFULLY!');
      } else if (imageLog.includes('FATAL ERROR:')) {
        console.log('   ❌ STATUS: FAILED');
      } else {
        console.log('   🔄 STATUS: IN PROGRESS');
      }
    } else {
      console.log('   ⚠️ No fixed image download log found');
    }
  } catch (error) {
    console.log(`   ❌ Error reading fixed image log: ${error.message}`);
  }
  
  console.log('\n💡 TIP: Run this script again to check progress');
  console.log('📁 Log files: story-generation.log, image-download-fixed.log');
}

monitorProgressFixed();
