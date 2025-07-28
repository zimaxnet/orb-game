import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testHistoricalFiguresAPI() {
  console.log('🧪 Testing Historical Figures API Endpoints...');
  
  const tests = [
    {
      name: 'Get historical figures stats',
      url: `${BASE_URL}/api/historical-figures/stats`,
      method: 'GET'
    },
    {
      name: 'Get historical figures list for Technology-Modern',
      url: `${BASE_URL}/api/historical-figures/list/Technology/Modern`,
      method: 'GET'
    },
    {
      name: 'Get random historical figure story for Technology',
      url: `${BASE_URL}/api/historical-figures/random/Technology?epoch=Modern&language=en`,
      method: 'GET'
    },
    {
      name: 'Get historical figure stories for Technology',
      url: `${BASE_URL}/api/orb/historical-figures/Technology?count=1&epoch=Modern&language=en&includeTTS=false`,
      method: 'GET'
    },
    {
      name: 'Backward compatibility: Get positive news for Technology',
      url: `${BASE_URL}/api/orb/positive-news/Technology?count=1&epoch=Modern&language=en&storyType=historical-figure`,
      method: 'GET'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      console.log(`🔗 URL: ${test.url}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS (${response.status})`);
        console.log(`📊 Response:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
        passed++;
      } else {
        console.log(`❌ FAILED (${response.status})`);
        const errorText = await response.text();
        console.log(`📄 Error: ${errorText}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return failed === 0;
}

// Test story generation endpoint
async function testStoryGeneration() {
  console.log('\n🧪 Testing Story Generation Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/orb/generate-historical-figures/Technology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        epoch: 'Modern',
        count: 1,
        language: 'en',
        includeTTS: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Story generation successful');
      console.log('📊 Generated stories:', data.length);
      if (data.length > 0) {
        console.log('📝 First story:', {
          headline: data[0].headline,
          historicalFigure: data[0].historicalFigure,
          category: data[0].category,
          epoch: data[0].epoch
        });
      }
      return true;
    } else {
      console.log(`❌ Story generation failed (${response.status})`);
      const errorText = await response.text();
      console.log(`📄 Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Story generation error: ${error.message}`);
    return false;
  }
}

// Test preload endpoint
async function testPreload() {
  console.log('\n🧪 Testing Preload Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/historical-figures/preload/Modern`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        categories: ['Technology', 'Science'],
        languages: ['en']
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Preload successful');
      console.log('📊 Preload results:', {
        epoch: data.epoch,
        totalCombinations: data.totalCombinations,
        successful: data.successful,
        failed: data.failed
      });
      return true;
    } else {
      console.log(`❌ Preload failed (${response.status})`);
      const errorText = await response.text();
      console.log(`📄 Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Preload error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Historical Figures API Tests...\n');
  
  const apiTests = await testHistoricalFiguresAPI();
  const generationTests = await testStoryGeneration();
  const preloadTests = await testPreload();
  
  console.log('\n🎯 Final Results:');
  console.log(`📋 API Tests: ${apiTests ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`📝 Generation Tests: ${generationTests ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🔄 Preload Tests: ${preloadTests ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = apiTests && generationTests && preloadTests;
  console.log(`\n🏆 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}); 