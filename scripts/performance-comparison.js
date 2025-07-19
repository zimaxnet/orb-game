import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

console.log('⚡ Performance Comparison: Cached vs Uncached');
console.log('=' .repeat(60));

async function performanceComparison() {
  const results = {
    uncached: [],
    cached: [],
    totalTime: 0
  };

  const testCases = [
    { category: 'Technology', epoch: 'Modern', model: 'o4-mini', language: 'en' },
    { category: 'Science', epoch: 'Ancient', model: 'perplexity-sonar', language: 'es' },
    { category: 'Art', epoch: 'Modern', model: 'grok-4', language: 'en' },
    { category: 'Nature', epoch: 'Future', model: 'o4-mini', language: 'en' },
    { category: 'Sports', epoch: 'Industrial', model: 'perplexity-sonar', language: 'es' }
  ];

  console.log('🔄 Testing Uncached Performance (First Requests)...');
  console.log('=' .repeat(60));

  for (const testCase of testCases) {
    try {
      console.log(`📝 ${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}...`);
      const startTime = Date.now();
      
      const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${testCase.category}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: testCase.category,
          epoch: testCase.epoch,
          model: testCase.model,
          count: 2,
          language: testCase.language,
          prompt: `Generate 2 fascinating ${testCase.category} stories from ${testCase.epoch.toLowerCase()} times in ${testCase.language === 'es' ? 'Spanish' : 'English'}.`
        })
      });

      const duration = Date.now() - startTime;
      results.totalTime += duration;

      if (response.ok) {
        const stories = await response.json();
        results.uncached.push({
          testCase: `${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}`,
          duration,
          storyCount: stories.length,
          success: true
        });
        console.log(`  ✅ Generated ${stories.length} stories in ${duration}ms`);
      } else {
        results.uncached.push({
          testCase: `${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}`,
          duration: 0,
          storyCount: 0,
          success: false,
          error: `HTTP ${response.status}`
        });
        console.log(`  ❌ Failed: HTTP ${response.status}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      results.uncached.push({
        testCase: `${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}`,
        duration: 0,
        storyCount: 0,
        success: false,
        error: error.message
      });
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n⏳ Waiting 2 seconds for cache to settle...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n📖 Testing Cached Performance (Second Requests)...');
  console.log('=' .repeat(60));

  for (const testCase of testCases) {
    try {
      console.log(`📖 ${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}...`);
      const startTime = Date.now();
      
      const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${testCase.category}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: testCase.category,
          epoch: testCase.epoch,
          model: testCase.model,
          count: 2,
          language: testCase.language,
          prompt: `Generate 2 fascinating ${testCase.category} stories from ${testCase.epoch.toLowerCase()} times in ${testCase.language === 'es' ? 'Spanish' : 'English'}.`
        })
      });

      const duration = Date.now() - startTime;
      results.totalTime += duration;

      if (response.ok) {
        const stories = await response.json();
        results.cached.push({
          testCase: `${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}`,
          duration,
          storyCount: stories.length,
          success: true
        });
        console.log(`  ✅ Retrieved ${stories.length} stories in ${duration}ms (CACHED)`);
      } else {
        results.cached.push({
          testCase: `${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}`,
          duration: 0,
          storyCount: 0,
          success: false,
          error: `HTTP ${response.status}`
        });
        console.log(`  ❌ Failed: HTTP ${response.status}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      results.cached.push({
        testCase: `${testCase.category}-${testCase.epoch}-${testCase.model}-${testCase.language}`,
        duration: 0,
        storyCount: 0,
        success: false,
        error: error.message
      });
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  // Calculate statistics
  const successfulUncached = results.uncached.filter(r => r.success);
  const successfulCached = results.cached.filter(r => r.success);

  const avgUncached = successfulUncached.length > 0 
    ? successfulUncached.reduce((sum, r) => sum + r.duration, 0) / successfulUncached.length 
    : 0;
  
  const avgCached = successfulCached.length > 0 
    ? successfulCached.reduce((sum, r) => sum + r.duration, 0) / successfulCached.length 
    : 0;

  const speedImprovement = avgUncached > 0 ? avgUncached / avgCached : 0;
  const timeSaved = avgUncached - avgCached;

  console.log('\n' + '=' .repeat(60));
  console.log('📊 PERFORMANCE COMPARISON RESULTS');
  console.log('=' .repeat(60));
  
  console.log('\n🔄 Uncached Performance (First Requests):');
  console.log(`  Total Tests: ${results.uncached.length}`);
  console.log(`  Successful: ${successfulUncached.length}`);
  console.log(`  Average Time: ${Math.round(avgUncached)}ms`);
  console.log(`  Success Rate: ${Math.round((successfulUncached.length / results.uncached.length) * 100)}%`);

  console.log('\n📖 Cached Performance (Second Requests):');
  console.log(`  Total Tests: ${results.cached.length}`);
  console.log(`  Successful: ${successfulCached.length}`);
  console.log(`  Average Time: ${Math.round(avgCached)}ms`);
  console.log(`  Success Rate: ${Math.round((successfulCached.length / results.cached.length) * 100)}%`);

  console.log('\n⚡ Performance Improvements:');
  console.log(`  Speed Improvement: ${speedImprovement > 0 ? Math.round(speedImprovement * 10) / 10 : 0}x faster`);
  console.log(`  Time Saved: ${Math.round(timeSaved)}ms per request`);
  console.log(`  Total Time Saved: ${Math.round(timeSaved * successfulCached.length)}ms for all cached requests`);

  console.log('\n📈 Detailed Results:');
  console.log('  Uncached Requests:');
  successfulUncached.forEach(result => {
    console.log(`    • ${result.testCase}: ${result.duration}ms`);
  });

  console.log('\n  Cached Requests:');
  successfulCached.forEach(result => {
    console.log(`    • ${result.testCase}: ${result.duration}ms`);
  });

  console.log('\n' + '=' .repeat(60));
  
  return {
    success: successfulCached.length > 0,
    results: {
      uncached: successfulUncached,
      cached: successfulCached,
      avgUncached,
      avgCached,
      speedImprovement,
      timeSaved
    }
  };
}

// Run the performance comparison
if (import.meta.url === `file://${process.argv[1]}`) {
  performanceComparison()
    .then(results => {
      console.log(`\n🎯 Performance Comparison ${results.success ? 'COMPLETED' : 'FAILED'}`);
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Performance comparison failed:', error);
      process.exit(1);
    });
}

export { performanceComparison }; 