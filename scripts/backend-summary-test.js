import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

console.log('🎯 New Backend Summary Test');
console.log('=' .repeat(50));

async function backendSummaryTest() {
  const results = {
    health: false,
    caching: false,
    performance: false,
    multiLanguage: false,
    multiModel: false,
    totalTime: 0
  };

  console.log('📋 Testing Core Functionality...\n');

  // Test 1: Health Check
  console.log('🔍 Test 1: Health Check');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const health = await response.json();
      console.log('  ✅ Backend is healthy and running');
      console.log(`    Version: ${health.version}`);
      console.log(`    Build: ${health.build}`);
      results.health = true;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Health check failed: ${error.message}`);
  }

  // Test 2: Caching System
  console.log('\n🔍 Test 2: Caching System');
  try {
    // First request (should generate)
    console.log('  📝 First request (generation)...');
    const startTime1 = Date.now();
    const response1 = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Technology',
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: 'en'
      })
    });
    const generationTime = Date.now() - startTime1;

    if (!response1.ok) throw new Error(`HTTP ${response1.status}`);
    const stories1 = await response1.json();
    console.log(`    ✅ Generated ${stories1.length} stories in ${generationTime}ms`);

    // Second request (should use cache)
    console.log('  📖 Second request (cache retrieval)...');
    const startTime2 = Date.now();
    const response2 = await fetch(`${BACKEND_URL}/api/orb/generate-news/Technology`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Technology',
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: 'en'
      })
    });
    const retrievalTime = Date.now() - startTime2;

    if (!response2.ok) throw new Error(`HTTP ${response2.status}`);
    const stories2 = await response2.json();
    console.log(`    ✅ Retrieved ${stories2.length} stories in ${retrievalTime}ms (CACHED)`);

    // Verify stories are the same
    if (stories1.length === stories2.length && stories1[0].headline === stories2[0].headline) {
      console.log('    ✅ Cache verification: Stories match');
      results.caching = true;
      results.totalTime = generationTime + retrievalTime;
    } else {
      console.log('    ⚠️ Cache verification: Stories may not match');
    }

  } catch (error) {
    console.log(`  ❌ Caching test failed: ${error.message}`);
  }

  // Test 3: Multi-Language Support
  console.log('\n🔍 Test 3: Multi-Language Support');
  try {
    const languages = ['en', 'es'];
    let languageSuccess = 0;

    for (const lang of languages) {
      const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/Science`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Science',
          epoch: 'Ancient',
          model: 'perplexity-sonar',
          count: 1,
          language: lang
        })
      });

      if (response.ok) {
        const stories = await response.json();
        console.log(`    ✅ ${lang.toUpperCase()}: Generated ${stories.length} stories`);
        languageSuccess++;
      } else {
        console.log(`    ❌ ${lang.toUpperCase()}: Failed`);
      }
    }

    if (languageSuccess === languages.length) {
      console.log('  ✅ Multi-language support working');
      results.multiLanguage = true;
    }

  } catch (error) {
    console.log(`  ❌ Multi-language test failed: ${error.message}`);
  }

  // Test 4: Multi-Model Support
  console.log('\n🔍 Test 4: Multi-Model Support');
  try {
    const models = [
      { id: 'o4-mini', name: 'O4-Mini' },
      { id: 'perplexity-sonar', name: 'Perplexity Sonar' },
      { id: 'grok-4', name: 'Grok 4' }
    ];
    let modelSuccess = 0;

    for (const model of models) {
      const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/Art`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Art',
          epoch: 'Modern',
          model: model.id,
          count: 1,
          language: 'en'
        })
      });

      if (response.ok) {
        const stories = await response.json();
        console.log(`    ✅ ${model.name}: Generated ${stories.length} stories`);
        modelSuccess++;
      } else {
        console.log(`    ❌ ${model.name}: Failed`);
      }
    }

    if (modelSuccess === models.length) {
      console.log('  ✅ Multi-model support working');
      results.multiModel = true;
    }

  } catch (error) {
    console.log(`  ❌ Multi-model test failed: ${error.message}`);
  }

  // Test 5: Performance Benchmark
  console.log('\n🔍 Test 5: Performance Benchmark');
  try {
    const testCases = [
      { category: 'Technology', model: 'o4-mini' },
      { category: 'Science', model: 'perplexity-sonar' },
      { category: 'Art', model: 'grok-4' }
    ];

    const performanceResults = [];
    
    for (const testCase of testCases) {
      const startTime = Date.now();
      
      const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${testCase.category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: testCase.category,
          epoch: 'Modern',
          model: testCase.model,
          count: 1,
          language: 'en'
        })
      });

      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const stories = await response.json();
        performanceResults.push({ duration, success: true });
        console.log(`    ✅ ${testCase.category}-${testCase.model}: ${duration}ms`);
      } else {
        performanceResults.push({ duration: 0, success: false });
        console.log(`    ❌ ${testCase.category}-${testCase.model}: Failed`);
      }
    }

    const successfulTests = performanceResults.filter(r => r.success);
    if (successfulTests.length > 0) {
      const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
      console.log(`  📊 Average response time: ${Math.round(avgDuration)}ms`);
      console.log(`  📊 Success rate: ${successfulTests.length}/${performanceResults.length}`);
      
      if (avgDuration < 500) {
        console.log('  ✅ Performance is acceptable (< 500ms)');
        results.performance = true;
      } else {
        console.log('  ⚠️ Performance is slow (> 500ms)');
      }
    }

  } catch (error) {
    console.log(`  ❌ Performance test failed: ${error.message}`);
  }

  // Calculate overall results
  const totalTests = Object.keys(results).filter(key => key !== 'totalTime').length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = Math.round((passedTests / totalTests) * 100);

  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY RESULTS');
  console.log('=' .repeat(50));
  
  console.log(`Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Caching System: ${results.caching ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Multi-Language: ${results.multiLanguage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Multi-Model: ${results.multiModel ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Performance: ${results.performance ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\nOverall Success Rate: ${successRate}%`);
  console.log(`Total Response Time: ${results.totalTime}ms`);

  console.log('\n🎯 Key Benefits Demonstrated:');
  if (results.caching) {
    console.log('  ✅ Story caching reduces token usage and improves performance');
  }
  if (results.multiLanguage) {
    console.log('  ✅ Multi-language support (English and Spanish)');
  }
  if (results.multiModel) {
    console.log('  ✅ Multi-AI model support (O4-Mini, Perplexity Sonar, Grok 4)');
  }
  if (results.performance) {
    console.log('  ✅ Fast response times for story generation');
  }

  console.log('\n' + '=' .repeat(50));
  
  return {
    success: successRate >= 80,
    results
  };
}

// Run the summary test
if (import.meta.url === `file://${process.argv[1]}`) {
  backendSummaryTest()
    .then(results => {
      console.log(`\n🎯 Summary Test ${results.success ? 'PASSED' : 'FAILED'}`);
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Summary test failed:', error);
      process.exit(1);
    });
}

export { backendSummaryTest }; 