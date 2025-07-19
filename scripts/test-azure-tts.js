import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing Azure TTS Endpoint Directly');
console.log('=' .repeat(50));

async function testAzureTTS() {
  console.log('📋 Configuration:');
  console.log(`  AZURE_OPENAI_ENDPOINT: ${process.env.AZURE_OPENAI_ENDPOINT || 'NOT SET'}`);
  console.log(`  AZURE_OPENAI_TTS_DEPLOYMENT: ${process.env.AZURE_OPENAI_TTS_DEPLOYMENT || 'NOT SET'}`);
  console.log(`  AZURE_OPENAI_API_KEY: ${process.env.AZURE_OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
  console.log('=' .repeat(50));

  if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_TTS_DEPLOYMENT || !process.env.AZURE_OPENAI_API_KEY) {
    console.log('❌ Missing required environment variables');
    return;
  }

  // Test 1: Test TTS endpoint directly
  console.log('\n🔍 Test 1: Direct Azure TTS Test');
  try {
    console.log('  📝 Testing Azure TTS endpoint directly...');
    
    const ttsUrl = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`;
    console.log(`  URL: ${ttsUrl}`);
    
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
        input: 'Hello, this is a test of the Azure TTS service.',
        voice: 'alloy',
        response_format: 'mp3'
      })
    });

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      const audioData = Buffer.from(audioBuffer).toString('base64');
      console.log(`  ✅ TTS request successful`);
      console.log(`  Audio data length: ${audioData.length} characters`);
      console.log(`  Audio preview: ${audioData.substring(0, 50)}...`);
    } else {
      const errorText = await response.text();
      console.log(`  ❌ TTS request failed`);
      console.log(`  Error details: ${errorText}`);
    }

  } catch (error) {
    console.log(`  ❌ TTS test failed: ${error.message}`);
  }

  // Test 2: Test with different voice
  console.log('\n🔍 Test 2: Spanish Voice Test');
  try {
    console.log('  📝 Testing with Spanish voice...');
    
    const ttsUrl = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`;
    
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
        input: 'Hola, esto es una prueba del servicio TTS de Azure.',
        voice: 'jorge',
        response_format: 'mp3'
      })
    });

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      const audioData = Buffer.from(audioBuffer).toString('base64');
      console.log(`  ✅ Spanish TTS request successful`);
      console.log(`  Audio data length: ${audioData.length} characters`);
    } else {
      const errorText = await response.text();
      console.log(`  ❌ Spanish TTS request failed`);
      console.log(`  Error details: ${errorText}`);
    }

  } catch (error) {
    console.log(`  ❌ Spanish TTS test failed: ${error.message}`);
  }

  // Test 3: Test with different model
  console.log('\n🔍 Test 3: Different Model Test');
  try {
    console.log('  📝 Testing with different model...');
    
    const ttsUrl = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`;
    
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts', // Try a different model name
        input: 'Testing with a different model name.',
        voice: 'alloy',
        response_format: 'mp3'
      })
    });

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      const audioData = Buffer.from(audioBuffer).toString('base64');
      console.log(`  ✅ Different model TTS request successful`);
      console.log(`  Audio data length: ${audioData.length} characters`);
    } else {
      const errorText = await response.text();
      console.log(`  ❌ Different model TTS request failed`);
      console.log(`  Error details: ${errorText}`);
    }

  } catch (error) {
    console.log(`  ❌ Different model TTS test failed: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🔍 Azure TTS Test Complete');
  console.log('=' .repeat(50));
  console.log('📋 Summary:');
  console.log('  - Check if Azure TTS deployment exists');
  console.log('  - Verify API key permissions');
  console.log('  - Check deployment name configuration');
  console.log('=' .repeat(50));
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAzureTTS()
    .then(() => {
      console.log('\n🔍 Azure TTS Test Complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Azure TTS test failed:', error);
      process.exit(1);
    });
}

export { testAzureTTS }; 