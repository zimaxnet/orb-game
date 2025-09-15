#!/usr/bin/env node

import fs from 'fs';

function monitorAllProcesses() {
  console.log('📊 MONITORING ALL PROCESSES');
  console.log('===========================');
  console.log('🔄 Checking all background processes...\n');
  
  // Check story generation progress
  console.log('📚 STORY GENERATION STATUS:');
  console.log('----------------------------');
  
  try {
    if (fs.existsSync('story-generation.log')) {
      const storyLog = fs.readFileSync('story-generation.log', 'utf8');
      
      const categoryMatches = storyLog.match(/CATEGORY \d+\/8:/g) || [];
      const successMatches = storyLog.match(/✅ Generated \d+ stories/g) || [];
      const errorMatches = storyLog.match(/❌ Error:/g) || [];
      const completionMatches = storyLog.match(/EXCELLENT: Comprehensive story generation completed!/g) || [];
      
      const lines = storyLog.split('\n');
      const lastLine = lines[lines.length - 2] || '';
      
      console.log(`   📈 Categories processed: ${categoryMatches.length}/8`);
      console.log(`   ✅ Successful generations: ${successMatches.length}`);
      console.log(`   ❌ Errors: ${errorMatches.length}`);
      console.log(`   📝 Last activity: ${lastLine.substring(0, 80)}...`);
      
      if (completionMatches.length > 0) {
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
  
  // Check TTS generation progress
  console.log('\n🎵 TTS AUDIO GENERATION STATUS:');
  console.log('--------------------------------');
  
  try {
    if (fs.existsSync('tts-generation-fixed.log')) {
      const ttsLog = fs.readFileSync('tts-generation-fixed.log', 'utf8');
      
      const audioMatches = ttsLog.match(/✅ Audio generated/g) || [];
      const errorMatches = ttsLog.match(/❌ Error/g) || [];
      const combinationMatches = ttsLog.match(/COMBINATION \d+\/\d+:/g) || [];
      const completionMatches = ttsLog.match(/SUCCESS: TTS audio generation completed!/g) || [];
      
      const lines = ttsLog.split('\n');
      const lastLine = lines[lines.length - 2] || '';
      
      console.log(`   🎯 Combinations processed: ${combinationMatches.length}`);
      console.log(`   🎵 Audio files generated: ${audioMatches.length}`);
      console.log(`   ❌ Errors: ${errorMatches.length}`);
      console.log(`   📝 Last activity: ${lastLine.substring(0, 80)}...`);
      
      if (completionMatches.length > 0) {
        console.log('   🎉 STATUS: COMPLETED SUCCESSFULLY!');
      } else if (ttsLog.includes('FATAL ERROR:')) {
        console.log('   ❌ STATUS: FAILED');
      } else {
        console.log('   🔄 STATUS: IN PROGRESS');
      }
    } else {
      console.log('   ⚠️ No TTS generation log found');
    }
  } catch (error) {
    console.log(`   ❌ Error reading TTS log: ${error.message}`);
  }
  
  // Check image download progress
  console.log('\n🖼️ IMAGE DOWNLOAD STATUS:');
  console.log('--------------------------');
  
  try {
    if (fs.existsSync('image-download-simple.log')) {
      const imageLog = fs.readFileSync('image-download-simple.log', 'utf8');
      
      const imageMatches = imageLog.match(/✅ Image metadata saved/g) || [];
      const errorMatches = imageLog.match(/❌ Error/g) || [];
      const completionMatches = imageLog.match(/SUCCESS: Image download completed!/g) || [];
      
      console.log(`   🖼️ Images downloaded: ${imageMatches.length}`);
      console.log(`   ❌ Errors: ${errorMatches.length}`);
      
      if (completionMatches.length > 0) {
        console.log('   🎉 STATUS: COMPLETED SUCCESSFULLY!');
      } else if (imageLog.includes('FATAL ERROR:')) {
        console.log('   ❌ STATUS: FAILED');
      } else {
        console.log('   🔄 STATUS: IN PROGRESS');
      }
    } else {
      console.log('   ⚠️ No image download log found');
    }
  } catch (error) {
    console.log(`   ❌ Error reading image log: ${error.message}`);
  }
  
  console.log('\n📊 OVERALL SYSTEM STATUS:');
  console.log('==========================');
  
  // Calculate overall completion
  let completedProcesses = 0;
  let totalProcesses = 3;
  
  if (fs.existsSync('story-generation.log') && fs.readFileSync('story-generation.log', 'utf8').includes('EXCELLENT: Comprehensive story generation completed!')) {
    completedProcesses++;
  }
  if (fs.existsSync('image-download-simple.log') && fs.readFileSync('image-download-simple.log', 'utf8').includes('SUCCESS: Image download completed!')) {
    completedProcesses++;
  }
  if (fs.existsSync('tts-generation-fixed.log') && fs.readFileSync('tts-generation-fixed.log', 'utf8').includes('SUCCESS: TTS audio generation completed!')) {
    completedProcesses++;
  }
  
  const overallProgress = ((completedProcesses / totalProcesses) * 100).toFixed(1);
  
  console.log(`   📈 Overall Progress: ${completedProcesses}/${totalProcesses} processes completed (${overallProgress}%)`);
  
  if (completedProcesses === totalProcesses) {
    console.log('   🎉 ALL PROCESSES COMPLETED!');
    console.log('   🚀 Orb Game is ready for testing and deployment!');
  } else if (completedProcesses >= 2) {
    console.log('   ✅ MOSTLY COMPLETE: Ready for testing!');
  } else if (completedProcesses >= 1) {
    console.log('   🔄 IN PROGRESS: Good progress, continue monitoring');
  } else {
    console.log('   ⏳ STARTING: Processes are initializing');
  }
  
  console.log('\n💡 TIP: Run this script again to check progress');
  console.log('📁 Log files: story-generation.log, tts-generation-fixed.log, image-download-simple.log');
}

monitorAllProcesses();
