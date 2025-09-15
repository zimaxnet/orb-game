#!/usr/bin/env node

import fs from 'fs';

function checkCompletion() {
  console.log('🔔 COMPLETION CHECKER');
  console.log('=====================');
  console.log(`⏰ Checked at: ${new Date().toLocaleString()}\n`);
  
  let storyCompleted = false;
  let ttsCompleted = false;
  let imageCompleted = false;
  
  // Check story generation
  try {
    if (fs.existsSync('story-generation.log')) {
      const storyLog = fs.readFileSync('story-generation.log', 'utf8');
      storyCompleted = storyLog.includes('EXCELLENT: Comprehensive story generation completed!');
      
      if (storyCompleted) {
        console.log('✅ STORY GENERATION: COMPLETED');
      } else {
        const categoryMatches = storyLog.match(/CATEGORY \d+\/8:/g) || [];
        const successMatches = storyLog.match(/✅ Generated \d+ stories/g) || [];
        console.log(`🔄 STORY GENERATION: IN PROGRESS (${categoryMatches.length}/8 categories, ${successMatches.length} stories)`);
      }
    } else {
      console.log('⚠️ STORY GENERATION: No log found');
    }
  } catch (error) {
    console.log('❌ STORY GENERATION: Error checking log');
  }
  
  // Check TTS generation
  try {
    if (fs.existsSync('tts-generation-fixed.log')) {
      const ttsLog = fs.readFileSync('tts-generation-fixed.log', 'utf8');
      ttsCompleted = ttsLog.includes('SUCCESS: TTS audio generation completed!');
      
      if (ttsCompleted) {
        console.log('✅ TTS AUDIO: COMPLETED');
      } else {
        const audioMatches = ttsLog.match(/✅ Audio generated/g) || [];
        const combinationMatches = ttsLog.match(/COMBINATION \d+\/\d+:/g) || [];
        console.log(`🔄 TTS AUDIO: IN PROGRESS (${combinationMatches.length}/5 combinations, ${audioMatches.length} audio files)`);
      }
    } else {
      console.log('⚠️ TTS AUDIO: No log found');
    }
  } catch (error) {
    console.log('❌ TTS AUDIO: Error checking log');
  }
  
  // Check image download
  try {
    if (fs.existsSync('image-download-simple.log')) {
      const imageLog = fs.readFileSync('image-download-simple.log', 'utf8');
      imageCompleted = imageLog.includes('SUCCESS: Image download completed!');
      
      if (imageCompleted) {
        console.log('✅ IMAGES: COMPLETED');
      } else {
        const imageMatches = imageLog.match(/✅ Image metadata saved/g) || [];
        console.log(`🔄 IMAGES: IN PROGRESS (${imageMatches.length} images)`);
      }
    } else {
      console.log('⚠️ IMAGES: No log found');
    }
  } catch (error) {
    console.log('❌ IMAGES: Error checking log');
  }
  
  // Overall status
  const completedCount = [storyCompleted, ttsCompleted, imageCompleted].filter(Boolean).length;
  const totalCount = 3;
  
  console.log(`\n📊 OVERALL PROGRESS: ${completedCount}/${totalCount} processes completed`);
  
  if (completedCount === totalCount) {
    console.log('\n🎉🎉🎉 ALL PROCESSES COMPLETED! 🎉🎉🎉');
    console.log('=====================================');
    console.log('🚀 ORB GAME IS READY FOR TESTING AND DEPLOYMENT!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test the frontend with new content');
    console.log('   2. Deploy to production');
    console.log('   3. Enjoy your fully restored Orb Game!');
    
    // Create completion marker
    fs.writeFileSync('completion-status.txt', JSON.stringify({
      completed: true,
      timestamp: new Date().toISOString(),
      storyGeneration: storyCompleted,
      ttsAudio: ttsCompleted,
      imageDownload: imageCompleted
    }, null, 2));
    
    return true;
  } else {
    console.log('\n⏳ Still in progress...');
    console.log('💡 Run this script again to check progress');
    return false;
  }
}

checkCompletion();
