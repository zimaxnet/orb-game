#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';

function viewLogs() {
  console.log('📋 LIVE LOG VIEWER');
  console.log('==================');
  console.log('Choose which log to view:');
  console.log('1. Story Generation Log');
  console.log('2. Image Download Log');
  console.log('3. Both logs (tail -f)');
  console.log('4. Exit');
  console.log('');
  
  // For now, let's show the last 20 lines of each log
  console.log('📚 LAST 20 LINES OF STORY GENERATION LOG:');
  console.log('----------------------------------------');
  
  try {
    if (fs.existsSync('story-generation.log')) {
      const storyLog = fs.readFileSync('story-generation.log', 'utf8');
      const lines = storyLog.split('\n');
      const lastLines = lines.slice(-20).join('\n');
      console.log(lastLines);
    } else {
      console.log('No story generation log found');
    }
  } catch (error) {
    console.log(`Error reading story log: ${error.message}`);
  }
  
  console.log('\n🖼️ LAST 20 LINES OF IMAGE DOWNLOAD LOG:');
  console.log('--------------------------------------');
  
  try {
    if (fs.existsSync('image-download.log')) {
      const imageLog = fs.readFileSync('image-download.log', 'utf8');
      const lines = imageLog.split('\n');
      const lastLines = lines.slice(-20).join('\n');
      console.log(lastLines);
    } else {
      console.log('No image download log found');
    }
  } catch (error) {
    console.log(`Error reading image log: ${error.message}`);
  }
  
  console.log('\n💡 To view live logs, run: tail -f story-generation.log');
  console.log('💡 Or run: tail -f image-download.log');
}

viewLogs();
