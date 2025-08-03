#!/usr/bin/env node

/**
 * Direct TTS Test Script
 * Tests TTS functionality with the correct authorization header
 */

const AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
const AZURE_OPENAI_TTS_DEPLOYMENT = 'gpt-4o-mini-tts';

async function testTTSDirect() {
  console.log('🎵 Testing TTS Directly...');
  
  // Get the API key from environment (for testing)
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ AZURE_OPENAI_API_KEY not set in environment');
    return;
  }
  
  console.log(`🔑 API Key: ${apiKey.substring(0, 8)}...`);
  console.log(`🌐 Endpoint: ${AZURE_OPENAI_ENDPOINT}`);
  console.log(`🎤 TTS Deployment: ${AZURE_OPENAI_TTS_DEPLOYMENT}`);
  
  const testText = "Hello, this is a test of the TTS functionality.";
  
  try {
    console.log('📤 Sending TTS request...');
    
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AZURE_OPENAI_TTS_DEPLOYMENT,
        input: testText,
        voice: 'alloy'
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      const audioData = Buffer.from(audioBuffer).toString('base64');
      console.log('✅ TTS Audio generated successfully!');
      console.log(`📏 Audio size: ${audioData.length} characters`);
      console.log(`📏 Audio preview: ${audioData.substring(0, 50)}...`);
    } else {
      const errorText = await response.text();
      console.error('❌ TTS request failed:', errorText);
    }
    
  } catch (error) {
    console.error('💥 TTS test failed:', error.message);
  }
}

testTTSDirect().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
}); 