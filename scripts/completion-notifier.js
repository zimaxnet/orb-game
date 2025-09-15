#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';

function checkCompletion() {
  console.log('🔔 COMPLETION NOTIFIER');
  console.log('======================');
  console.log('Monitoring for process completion...\n');
  
  let storyCompleted = false;
  let ttsCompleted = false;
  let imageCompleted = false;
  
  // Check story generation
  try {
    if (fs.existsSync('story-generation.log')) {
      const storyLog = fs.readFileSync('story-generation.log', 'utf8');
      storyCompleted = storyLog.includes('EXCELLENT: Comprehensive story generation completed!');
    }
  } catch (error) {
    console.log('❌ Error checking story log');
  }
  
  // Check TTS generation
  try {
    if (fs.existsSync('tts-generation-fixed.log')) {
      const ttsLog = fs.readFileSync('tts-generation-fixed.log', 'utf8');
      ttsCompleted = ttsLog.includes('SUCCESS: TTS audio generation completed!');
    }
  } catch (error) {
    console.log('❌ Error checking TTS log');
  }
  
  // Check image download
  try {
    if (fs.existsSync('image-download-simple.log')) {
      const imageLog = fs.readFileSync('image-download-simple.log', 'utf8');
      imageCompleted = imageLog.includes('SUCCESS: Image download completed!');
    }
  } catch (error) {
    console.log('❌ Error checking image log');
  }
  
  // Display current status
  console.log('📊 CURRENT STATUS:');
  console.log(`   📚 Story Generation: ${storyCompleted ? '✅ COMPLETED' : '🔄 IN PROGRESS'}`);
  console.log(`   🎵 TTS Audio: ${ttsCompleted ? '✅ COMPLETED' : '🔄 IN PROGRESS'}`);
  console.log(`   🖼️ Images: ${imageCompleted ? '✅ COMPLETED' : '🔄 IN PROGRESS'}`);
  
  const completedCount = [storyCompleted, ttsCompleted, imageCompleted].filter(Boolean).length;
  const totalCount = 3;
  
  console.log(`\n📈 OVERALL PROGRESS: ${completedCount}/${totalCount} processes completed`);
  
  if (completedCount === totalCount) {
    console.log('\n🎉🎉🎉 ALL PROCESSES COMPLETED! 🎉🎉🎉');
    console.log('=====================================');
    console.log('✅ Story Generation: COMPLETED');
    console.log('✅ TTS Audio Generation: COMPLETED');
    console.log('✅ Image Download: COMPLETED');
    console.log('\n🚀 ORB GAME IS READY FOR TESTING AND DEPLOYMENT!');
    console.log('💡 Next steps:');
    console.log('   1. Test the frontend with new content');
    console.log('   2. Deploy to production');
    console.log('   3. Enjoy your fully restored Orb Game!');
    
    // Create a completion marker file
    fs.writeFileSync('completion-status.txt', JSON.stringify({
      completed: true,
      timestamp: new Date().toISOString(),
      storyGeneration: storyCompleted,
      ttsAudio: ttsCompleted,
      imageDownload: imageCompleted
    }, null, 2));
    
    console.log('\n📄 Completion status saved to: completion-status.txt');
    
    return true; // All completed
  } else {
    console.log('\n⏳ Still waiting for completion...');
    return false; // Not all completed
  }
}

function startMonitoring() {
  console.log('🔔 Starting completion monitoring...');
  console.log('💡 This will check every 30 seconds for completion');
  console.log('🛑 Press Ctrl+C to stop monitoring\n');
  
  // Check immediately
  if (checkCompletion()) {
    return; // All completed, exit
  }
  
  // Set up interval monitoring
  const interval = setInterval(() => {
    console.log(`\n⏰ Checking at ${new Date().toLocaleTimeString()}...`);
    
    if (checkCompletion()) {
      clearInterval(interval);
      console.log('\n🔔 Monitoring stopped - all processes completed!');
    }
  }, 30000); // Check every 30 seconds
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoring stopped by user');
    clearInterval(interval);
    process.exit(0);
  });
}

// Run the completion notifier
startMonitoring();
