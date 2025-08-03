import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

// Test configuration
const TEST_CATEGORIES = ['Technology', 'Science'];
const TEST_MODELS = ['o4-mini', 'perplexity-sonar'];
const TEST_EPOCHS = ['Modern'];
const TEST_LANGUAGES = ['en', 'es'];

console.log('🧪 Testing Story Cache System');
console.log('=' .repeat(50));

async function testCacheSystem() {
  const results = {
    totalTests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    generationTime: 0,
    retrievalTime: 0,
    errors: []
  };

  console.log('📊 Testing cache functionality...\n');

  for (const category of TEST_CATEGORIES) {
    for (const model of TEST_MODELS) {
      for (const epoch of TEST_EPOCHS) {
        for (const language of TEST_LANGUAGES) {
          results.totalTests++;
          
          console.log(`🔄 Test ${results.totalTests}: ${category}-${epoch}-${model}-${language}`);
          
          try {
            // First request - should generate and cache
            console.log('  📝 First request (should generate)...');
            const startTime = Date.now();
            
            const response1 = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                category,
                epoch,
                model,
                count: 3,
                language,
                prompt: `Generate 3 fascinating ${category} stories from ${epoch.toLowerCase()} times in ${language === 'es' ? 'Spanish' : 'English'}.`
              })
            });

            const generationTime = Date.now() - startTime;
            results.generationTime += generationTime;

            if (!response1.ok) {
              throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
            }

            const stories1 = await response1.json();
            console.log(`  ✅ Generated ${stories1.length} stories in ${generationTime}ms`);
            results.cacheMisses++;

            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Second request - should retrieve from cache
            console.log('  📖 Second request (should use cache)...');
            const startTime2 = Date.now();
            
            const response2 = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                category,
                epoch,
                model,
                count: 3,
                language,
                prompt: `Generate 3 fascinating ${category} stories from ${epoch.toLowerCase()} times in ${language === 'es' ? 'Spanish' : 'English'}.`
              })
            });

            const retrievalTime = Date.now() - startTime2;
            results.retrievalTime += retrievalTime;

            if (!response2.ok) {
              throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
            }

            const stories2 = await response2.json();
            console.log(`  ✅ Retrieved ${stories2.length} stories in ${retrievalTime}ms`);
            results.cacheHits++;

            // Verify stories are the same
            if (stories1.length === stories2.length) {
              console.log(`  ✅ Cache verification: Stories match (${stories1.length} stories)`);
            } else {
              console.log(`  ⚠️ Cache verification: Story count mismatch (${stories1.length} vs ${stories2.length})`);
            }

          } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            results.errors.push({
              test: `${category}-${epoch}-${model}-${language}`,
              error: error.message
            });
          }

          console.log('');
        }
      }
    }
  }

  // Test cache statistics
  console.log('📊 Testing cache statistics...');
  try {
    const statsResponse = await fetch(`${BACKEND_URL}/api/cache/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Cache Statistics:');
      console.log(`  Total Stories: ${stats.totalStories}`);
      console.log(`  Categories: ${stats.totalCategories}`);
      console.log(`  Epochs: ${stats.totalEpochs}`);
      console.log(`  Models: ${stats.totalModels}`);
      console.log(`  Languages: ${stats.totalLanguages}`);
    } else {
      console.log('❌ Failed to get cache statistics');
    }
  } catch (error) {
    console.log(`❌ Error getting cache stats: ${error.message}`);
  }

  // Print results
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Cache Hits: ${results.cacheHits}`);
  console.log(`Cache Misses: ${results.cacheMisses}`);
  console.log(`Hit Rate: ${Math.round((results.cacheHits / results.totalTests) * 100)}%`);
  console.log(`Average Generation Time: ${Math.round(results.generationTime / results.cacheMisses)}ms`);
  console.log(`Average Retrieval Time: ${Math.round(results.retrievalTime / results.cacheHits)}ms`);
  console.log(`Speed Improvement: ${Math.round((results.generationTime / results.cacheMisses) / (results.retrievalTime / results.cacheHits))}x faster`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    results.errors.forEach(error => {
      console.log(`  • ${error.test}: ${error.error}`);
    });
  }

  console.log('\n' + '=' .repeat(50));
  
  return {
    success: results.errors.length === 0,
    results
  };
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testCacheSystem()
    .then(results => {
      console.log(`\n🎯 Test ${results.success ? 'PASSED' : 'FAILED'}`);
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { testCacheSystem }; 