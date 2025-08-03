import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

// Test AI models for story generation
const models = ['o4-mini'];

// Test categories and epochs
const testCases = [
  { category: 'Technology', epoch: 'Modern', language: 'en' },
  { category: 'Science', epoch: 'Ancient', language: 'es' },
  { category: 'Art', epoch: 'Medieval', language: 'en' }
];

async function testAIModelGeneration() {
  console.log('🤖 Testing AI Model Generation Capabilities...\n');
  console.log(`📡 Backend URL: ${BACKEND_URL}\n`);

  let totalTests = 0;
  let successfulTests = 0;

  for (const model of models) {
    console.log(`\n🔍 Testing ${model}...`);
    console.log('='.repeat(50));

    for (const testCase of testCases) {
      totalTests++;
      console.log(`\n📝 Testing: ${testCase.category} - ${testCase.epoch} epoch`);
      
      try {
        const startTime = Date.now();
        
        const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${testCase.category}?epoch=${testCase.epoch}&model=${model}&count=2`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category: testCase.category,
            epoch: testCase.epoch,
            model: model,
            count: 2,
            prompt: `Generate 2 fascinating, positive ${testCase.category} stories from ${testCase.epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries.`
          })
        });

        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const stories = await response.json();
          
          if (stories && stories.length > 0) {
            successfulTests++;
            console.log(`✅ SUCCESS (${responseTime}ms)`);
            console.log(`   📰 Generated ${stories.length} stories`);
            console.log(`   🎯 First story: "${stories[0].headline}"`);
            console.log(`   📝 Summary: ${stories[0].summary.substring(0, 80)}...`);
            console.log(`   🎵 Audio: ${stories[0].ttsAudio ? '✅ Available' : '❌ Not available'}`);
          } else {
            console.log(`❌ FAILED - No stories generated (${responseTime}ms)`);
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ FAILED - HTTP ${response.status} (${responseTime}ms)`);
          console.log(`   Error: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`❌ FAILED - Network error (${error.message})`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 AI Model Generation Test Results:');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successfulTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successfulTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
  
  if (successfulTests === totalTests) {
    console.log('\n🎉 All AI models are working perfectly!');
  } else if (successfulTests > totalTests * 0.8) {
    console.log('\n⚠️  Most AI models are working, but some issues detected.');
  } else {
    console.log('\n🚨 Significant issues with AI model generation detected.');
  }
}

// Run the test
testAIModelGeneration().catch(console.error); 