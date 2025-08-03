import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

// All combinations to preload
const CATEGORIES = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
const MODELS = ['grok-4', 'perplexity-sonar', 'gemini-1.5-flash', 'o4-mini'];
const EPOCHS = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
const LANGUAGES = ['en', 'es'];

console.log('🚀 Preloading All Stories for Cache');
console.log('=' .repeat(50));
console.log(`Categories: ${CATEGORIES.length}`);
console.log(`Models: ${MODELS.length}`);
console.log(`Epochs: ${EPOCHS.length}`);
console.log(`Languages: ${LANGUAGES.length}`);
console.log(`Total Combinations: ${CATEGORIES.length * MODELS.length * EPOCHS.length * LANGUAGES.length}`);
console.log('=' .repeat(50));

async function preloadAllStories() {
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: [],
    startTime: Date.now()
  };

  const totalCombinations = CATEGORIES.length * MODELS.length * EPOCHS.length * LANGUAGES.length;
  let completed = 0;

  for (const category of CATEGORIES) {
    for (const model of MODELS) {
      for (const epoch of EPOCHS) {
        for (const language of LANGUAGES) {
          results.total++;
          completed++;
          
          const progress = Math.round((completed / totalCombinations) * 100);
          console.log(`\n🔄 [${progress}%] Preloading ${category}-${epoch}-${model}-${language} (${completed}/${totalCombinations})`);
          
          try {
            const startTime = Date.now();
            
            const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category}`, {
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
                prompt: `Generate 3 fascinating ${category} stories from ${epoch.toLowerCase()} times in ${language === 'es' ? 'Spanish' : 'English'}. Each story should be engaging, informative, and highlight remarkable achievements or discoveries.`
              })
            });

            const duration = Date.now() - startTime;

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const stories = await response.json();
            
            if (stories && stories.length > 0) {
              console.log(`  ✅ Generated ${stories.length} stories in ${duration}ms`);
              results.successful++;
            } else {
              console.log(`  ⚠️ No stories generated in ${duration}ms`);
              results.failed++;
            }

            // Small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));

          } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            results.errors.push({
              combination: `${category}-${epoch}-${model}-${language}`,
              error: error.message
            });
            results.failed++;
          }
        }
      }
    }
  }

  const totalTime = Date.now() - results.startTime;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);

  console.log('\n' + '=' .repeat(50));
  console.log('📊 PRELOAD RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Combinations: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.successful / results.total) * 100)}%`);
  console.log(`Total Time: ${minutes}m ${seconds}s`);
  console.log(`Average Time per Request: ${Math.round(totalTime / results.total)}ms`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors (${results.errors.length}):`);
    results.errors.slice(0, 10).forEach(error => {
      console.log(`  • ${error.combination}: ${error.error}`);
    });
    if (results.errors.length > 10) {
      console.log(`  ... and ${results.errors.length - 10} more errors`);
    }
  }

  // Test cache statistics
  console.log('\n📊 Final Cache Statistics:');
  try {
    const statsResponse = await fetch(`${BACKEND_URL}/api/cache/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`  Total Stories: ${stats.totalStories}`);
      console.log(`  Categories: ${stats.totalCategories}`);
      console.log(`  Epochs: ${stats.totalEpochs}`);
      console.log(`  Models: ${stats.totalModels}`);
      console.log(`  Languages: ${stats.totalLanguages}`);
      
      if (stats.mostAccessed && stats.mostAccessed.length > 0) {
        console.log(`  Most Accessed: ${stats.mostAccessed[0].cacheKey} (${stats.mostAccessed[0].accessCount} times)`);
      }
    } else {
      console.log('  ❌ Failed to get cache statistics');
    }
  } catch (error) {
    console.log(`  ❌ Error getting cache stats: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(50));
  
  return {
    success: results.failed === 0,
    results
  };
}

// Run the preload
if (import.meta.url === `file://${process.argv[1]}`) {
  preloadAllStories()
    .then(results => {
      console.log(`\n🎯 Preload ${results.success ? 'COMPLETED' : 'COMPLETED WITH ERRORS'}`);
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Preload execution failed:', error);
      process.exit(1);
    });
}

export { preloadAllStories }; 