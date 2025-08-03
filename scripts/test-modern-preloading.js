import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

// Test configuration
const EPOCH = 'Modern';
const CATEGORIES = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
const MODELS = [
  { id: 'grok-4', name: 'Grok 4' },
  { id: 'perplexity-sonar', name: 'Perplexity Sonar' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'o4-mini', name: 'O4-Mini' }
];

// Test results storage
const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  errors: [],
  modelResults: {}
};

// Initialize model results
MODELS.forEach(model => {
  testResults.modelResults[model.id] = {
    name: model.name,
    totalCategories: 0,
    successfulCategories: 0,
    failedCategories: [],
    averageResponseTime: 0,
    totalResponseTime: 0
  };
});

// Helper function to test a single category-model combination
async function testCategoryModel(category, model, language = 'en') {
  const startTime = Date.now();
  const testId = `${category}-${model.id}-${language}`;
  
  console.log(`🔄 Testing ${category} with ${model.name} (${language})...`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category}?epoch=${EPOCH}&model=${model.id}&count=3&language=${language}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: category,
        epoch: EPOCH,
        model: model.id,
        count: 3,
        language: language,
        prompt: `Generate 3 fascinating, positive ${category} stories from ${EPOCH.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries.`
      })
    });

    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const stories = await response.json();
    
    // Validate response structure
    if (!Array.isArray(stories)) {
      throw new Error('Response is not an array');
    }
    
    if (stories.length === 0) {
      throw new Error('No stories returned');
    }
    
    // Validate each story
    stories.forEach((story, index) => {
      if (!story.headline || !story.summary || !story.fullText || !story.source) {
        throw new Error(`Story ${index + 1} missing required fields`);
      }
      
      if (!story.ttsAudio) {
        console.warn(`⚠️ Story ${index + 1} missing TTS audio`);
      }
    });
    
    // Update test results
    testResults.totalTests++;
    testResults.passedTests++;
    testResults.modelResults[model.id].totalCategories++;
    testResults.modelResults[model.id].successfulCategories++;
    testResults.modelResults[model.id].totalResponseTime += responseTime;
    
    console.log(`✅ ${category} with ${model.name} (${language}): ${stories.length} stories, ${responseTime}ms`);
    
    return {
      success: true,
      stories: stories.length,
      responseTime,
      hasTTS: stories.every(s => s.ttsAudio)
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    testResults.totalTests++;
    testResults.failedTests++;
    testResults.modelResults[model.id].totalCategories++;
    testResults.modelResults[model.id].failedCategories.push(category);
    testResults.modelResults[model.id].totalResponseTime += responseTime;
    
    const errorMsg = `${category} with ${model.name} (${language}): ${error.message}`;
    testResults.errors.push(errorMsg);
    
    console.log(`❌ ${errorMsg}`);
    
    return {
      success: false,
      error: error.message,
      responseTime
    };
  }
}

// Main test function
async function runModernPreloadingTest() {
  console.log('🚀 Starting Modern Epoch Preloading Test');
  console.log('=' .repeat(60));
  console.log(`📅 Epoch: ${EPOCH}`);
  console.log(`📚 Categories: ${CATEGORIES.length}`);
  console.log(`🤖 Models: ${MODELS.length}`);
  console.log(`🌐 Languages: English, Spanish`);
  console.log(`📊 Total Tests: ${CATEGORIES.length * MODELS.length * 2}`);
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  // Test all combinations
  for (const category of CATEGORIES) {
    for (const model of MODELS) {
      // Test English
      await testCategoryModel(category, model, 'en');
      
      // Test Spanish
      await testCategoryModel(category, model, 'es');
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const totalTime = Date.now() - startTime;
  
  // Calculate averages
  MODELS.forEach(model => {
    const results = testResults.modelResults[model.id];
    if (results.totalCategories > 0) {
      results.averageResponseTime = Math.round(results.totalResponseTime / results.totalCategories);
    }
  });
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`✅ Passed: ${testResults.passedTests}`);
  console.log(`❌ Failed: ${testResults.failedTests}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passedTests / testResults.totalTests) * 100)}%`);
  
  console.log('\n🤖 MODEL PERFORMANCE:');
  MODELS.forEach(model => {
    const results = testResults.modelResults[model.id];
    const successRate = results.totalCategories > 0 
      ? Math.round((results.successfulCategories / results.totalCategories) * 100)
      : 0;
    
    console.log(`\n${model.name}:`);
    console.log(`  ✅ Success Rate: ${successRate}%`);
    console.log(`  📊 Categories: ${results.successfulCategories}/${results.totalCategories}`);
    console.log(`  ⏱️  Avg Response Time: ${results.averageResponseTime}ms`);
    
    if (results.failedCategories.length > 0) {
      console.log(`  ❌ Failed Categories: ${results.failedCategories.join(', ')}`);
    }
  });
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Return test results
  return {
    success: testResults.failedTests === 0,
    summary: {
      totalTests: testResults.totalTests,
      passedTests: testResults.passedTests,
      failedTests: testResults.failedTests,
      successRate: Math.round((testResults.passedTests / testResults.totalTests) * 100),
      totalTime,
      modelResults: testResults.modelResults
    }
  };
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  runModernPreloadingTest()
    .then(results => {
      console.log(`\n🎯 Test ${results.success ? 'PASSED' : 'FAILED'}`);
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { runModernPreloadingTest }; 