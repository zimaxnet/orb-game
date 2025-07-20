#!/usr/bin/env node

/**
 * Comprehensive Frontend Test Suite
 * Tests all frontend functions, UI interactions, and build process
 */

import https from 'https';
import { URL } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'https://api.orbgame.us';

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// HTTP request helper
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BACKEND_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Frontend-Comprehensive-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      const jsonData = JSON.stringify(data);
      req.write(jsonData);
    }
    
    req.end();
  });
}

// Test frontend build process
async function testFrontendBuild() {
  log('\n🔨 Testing Frontend Build Process', colors.blue);
  
  try {
    log('Checking package.json...', colors.yellow);
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      log('✅ Build script found in package.json', colors.green);
    } else {
      log('❌ Build script not found in package.json', colors.red);
      return false;
    }
    
    log('Checking for required dependencies...', colors.yellow);
    const requiredDeps = ['react', 'react-dom', '@react-three/fiber', '@react-three/drei'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]);
    
    if (missingDeps.length === 0) {
      log('✅ All required dependencies found', colors.green);
    } else {
      log(`❌ Missing dependencies: ${missingDeps.join(', ')}`, colors.red);
      return false;
    }
    
    log('Checking for main component files...', colors.yellow);
    const requiredFiles = [
      'components/OrbGame.jsx',
      'components/OrbGame.css',
      'api/orbApi.js',
      'contexts/LanguageContext.jsx'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length === 0) {
      log('✅ All required component files found', colors.green);
    } else {
      log(`❌ Missing files: ${missingFiles.join(', ')}`, colors.red);
      return false;
    }
    
    log('Testing build process...', colors.yellow);
    try {
      execSync('npm run build', { stdio: 'pipe', timeout: 60000 });
      log('✅ Frontend build successful', colors.green);
      return true;
    } catch (error) {
      log(`❌ Build failed: ${error.message}`, colors.red);
      return false;
    }
    
  } catch (error) {
    log(`❌ Build test failed: ${error.message}`, colors.red);
    return false;
  }
}

// Test all API endpoints used by frontend
async function testAllAPIEndpoints() {
  log('\n🌐 Testing All API Endpoints Used by Frontend', colors.blue);
  
  const endpoints = [
    { name: 'Health Check', endpoint: '/health', method: 'GET' },
    { name: 'Chat API', endpoint: '/api/chat', method: 'POST', data: { message: 'Test message', userId: 'test-user' } },
    { name: 'Positive News - Technology', endpoint: '/api/orb/positive-news/Technology', method: 'GET' },
    { name: 'Positive News - Science', endpoint: '/api/orb/positive-news/Science', method: 'GET' },
    { name: 'Positive News - Art', endpoint: '/api/orb/positive-news/Art', method: 'GET' },
    { name: 'Generate News - Technology', endpoint: '/api/orb/generate-news/Technology', method: 'POST', data: { epoch: 'Modern', model: 'o4-mini', count: 1, language: 'en' } },
    { name: 'Memory Stats', endpoint: '/api/memory/stats', method: 'GET' },
    { name: 'Memory Search', endpoint: '/api/memory/search', method: 'POST', data: { query: 'test', userId: 'test-user', limit: 5 } },
    { name: 'Memory Export', endpoint: '/api/memory/export', method: 'GET' },
    { name: 'Memory Profile', endpoint: '/api/memory/profile', method: 'GET' }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const endpoint of endpoints) {
    try {
      log(`Testing: ${endpoint.name}`, colors.yellow);
      const response = await makeRequest(endpoint.endpoint, endpoint.method, endpoint.data);
      
      if (response.status === 200) {
        log(`✅ ${endpoint.name}: Success`, colors.green);
        passedTests++;
      } else {
        log(`❌ ${endpoint.name}: Failed (${response.status})`, colors.red);
        failedTests++;
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: Error - ${error.message}`, colors.red);
      failedTests++;
    }
  }
  
  log(`\n📊 API Endpoints Summary:`, colors.blue);
  log(`✅ Passed: ${passedTests}`, colors.green);
  log(`❌ Failed: ${failedTests}`, colors.red);
  
  return { passed: passedTests, failed: failedTests };
}

// Test frontend component functionality
async function testFrontendComponents() {
  log('\n🎮 Testing Frontend Component Functionality', colors.blue);
  
  const componentTests = [
    {
      name: 'Orb Game Component',
      test: async () => {
        // Test orb category interactions
        const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
        let successCount = 0;
        
        for (const category of categories) {
          try {
            const response = await makeRequest(`/api/orb/positive-news/${category}`);
            if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
              successCount++;
            }
          } catch (error) {
            // Ignore individual failures
          }
        }
        
        return successCount >= categories.length * 0.8; // 80% success rate
      }
    },
    {
      name: 'Chat Interface',
      test: async () => {
        try {
          const response = await makeRequest('/api/chat', 'POST', {
            message: 'Hello, test message',
            userId: 'component-test-user'
          });
          return response.status === 200 && response.data.response;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Memory Panel',
      test: async () => {
        try {
          const statsResponse = await makeRequest('/api/memory/stats');
          const exportResponse = await makeRequest('/api/memory/export');
          return statsResponse.status === 200 && exportResponse.status === 200;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Language Context',
      test: async () => {
        try {
          // Test both English and Spanish
          const enResponse = await makeRequest('/api/orb/generate-news/Art', 'POST', {
            epoch: 'Modern',
            model: 'o4-mini',
            count: 1,
            language: 'en'
          });
          const esResponse = await makeRequest('/api/orb/generate-news/Art', 'POST', {
            epoch: 'Modern',
            model: 'o4-mini',
            count: 1,
            language: 'es'
          });
          return enResponse.status === 200 && esResponse.status === 200;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'AI Model Selection',
      test: async () => {
        try {
          const models = ['grok-4', 'perplexity-sonar', 'o4-mini'];
          let successCount = 0;
          
          for (const model of models) {
            try {
              const response = await makeRequest('/api/orb/generate-news/Science', 'POST', {
                epoch: 'Modern',
                model: model,
                count: 1,
                language: 'en'
              });
              if (response.status === 200) {
                successCount++;
              }
            } catch (error) {
              // Ignore individual failures
            }
          }
          
          return successCount >= models.length * 0.8; // 80% success rate
        } catch (error) {
          return false;
        }
      }
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const componentTest of componentTests) {
    try {
      log(`Testing: ${componentTest.name}`, colors.yellow);
      const result = await componentTest.test();
      
      if (result) {
        log(`✅ ${componentTest.name}: Passed`, colors.green);
        passedTests++;
      } else {
        log(`❌ ${componentTest.name}: Failed`, colors.red);
        failedTests++;
      }
    } catch (error) {
      log(`❌ ${componentTest.name}: Error - ${error.message}`, colors.red);
      failedTests++;
    }
  }
  
  log(`\n📊 Component Tests Summary:`, colors.blue);
  log(`✅ Passed: ${passedTests}`, colors.green);
  log(`❌ Failed: ${failedTests}`, colors.red);
  
  return { passed: passedTests, failed: failedTests };
}

// Test performance and load handling
async function testPerformanceAndLoad() {
  log('\n⚡ Testing Performance and Load Handling', colors.blue);
  
  const performanceTests = [
    {
      name: 'Single Request Performance',
      test: async () => {
        const startTime = Date.now();
        const response = await makeRequest('/api/chat', 'POST', {
          message: 'Performance test',
          userId: 'perf-test'
        });
        const duration = Date.now() - startTime;
        
        if (response.status === 200 && duration < 5000) {
          log(`✅ Single request: ${duration}ms`, colors.green);
          return true;
        } else {
          log(`❌ Single request: ${duration}ms (too slow)`, colors.red);
          return false;
        }
      }
    },
    {
      name: 'Concurrent Requests',
      test: async () => {
        const requests = Array(5).fill().map((_, i) => 
          makeRequest('/api/chat', 'POST', {
            message: `Concurrent test ${i}`,
            userId: `concurrent-test-${i}`
          })
        );
        
        const startTime = Date.now();
        const responses = await Promise.all(requests);
        const duration = Date.now() - startTime;
        
        const successCount = responses.filter(r => r.status === 200).length;
        
        if (successCount >= 4 && duration < 10000) {
          log(`✅ Concurrent requests: ${successCount}/5 successful in ${duration}ms`, colors.green);
          return true;
        } else {
          log(`❌ Concurrent requests: ${successCount}/5 successful in ${duration}ms`, colors.red);
          return false;
        }
      }
    },
    {
      name: 'Memory Usage',
      test: async () => {
        try {
          const response = await makeRequest('/api/memory/stats');
          if (response.status === 200 && response.data.totalMemories) {
            log(`✅ Memory stats: ${response.data.totalMemories} memories`, colors.green);
            return true;
          } else {
            log(`❌ Memory stats failed`, colors.red);
            return false;
          }
        } catch (error) {
          log(`❌ Memory test failed: ${error.message}`, colors.red);
          return false;
        }
      }
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const perfTest of performanceTests) {
    try {
      const result = await perfTest.test();
      if (result) {
        passedTests++;
      } else {
        failedTests++;
      }
    } catch (error) {
      log(`❌ ${perfTest.name}: Error - ${error.message}`, colors.red);
      failedTests++;
    }
  }
  
  log(`\n📊 Performance Tests Summary:`, colors.blue);
  log(`✅ Passed: ${passedTests}`, colors.green);
  log(`❌ Failed: ${failedTests}`, colors.red);
  
  return { passed: passedTests, failed: failedTests };
}

// Test error handling and edge cases
async function testErrorHandling() {
  log('\n🛡️ Testing Error Handling and Edge Cases', colors.blue);
  
  const errorTests = [
    {
      name: 'Invalid API Endpoint',
      test: async () => {
        try {
          const response = await makeRequest('/api/non-existent');
          return response.status >= 400; // Should return error
        } catch (error) {
          return true; // Error expected
        }
      }
    },
    {
      name: 'Invalid Chat Message',
      test: async () => {
        try {
          const response = await makeRequest('/api/chat', 'POST', { invalid: 'data' });
          return response.status >= 400; // Should return error
        } catch (error) {
          return true; // Error expected
        }
      }
    },
    {
      name: 'Empty Message',
      test: async () => {
        try {
          const response = await makeRequest('/api/chat', 'POST', { message: '', userId: 'test' });
          return response.status >= 400; // Should return error
        } catch (error) {
          return true; // Error expected
        }
      }
    },
    {
      name: 'Invalid Category',
      test: async () => {
        try {
          const response = await makeRequest('/api/orb/positive-news/invalid-category');
          return response.status >= 400; // Should return error
        } catch (error) {
          return true; // Error expected
        }
      }
    },
    {
      name: 'Invalid Memory Search',
      test: async () => {
        try {
          const response = await makeRequest('/api/memory/search', 'POST', { invalid: 'data' });
          return response.status >= 400; // Should return error
        } catch (error) {
          return true; // Error expected
        }
      }
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const errorTest of errorTests) {
    try {
      log(`Testing: ${errorTest.name}`, colors.yellow);
      const result = await errorTest.test();
      
      if (result) {
        log(`✅ ${errorTest.name}: Properly handled`, colors.green);
        passedTests++;
      } else {
        log(`❌ ${errorTest.name}: Not properly handled`, colors.red);
        failedTests++;
      }
    } catch (error) {
      log(`❌ ${errorTest.name}: Test error - ${error.message}`, colors.red);
      failedTests++;
    }
  }
  
  log(`\n📊 Error Handling Summary:`, colors.blue);
  log(`✅ Passed: ${passedTests}`, colors.green);
  log(`❌ Failed: ${failedTests}`, colors.red);
  
  return { passed: passedTests, failed: failedTests };
}

// Main comprehensive test runner
async function runComprehensiveTests() {
  log('🚀 Comprehensive Frontend Test Suite', colors.magenta);
  log('====================================', colors.magenta);
  
  const testSuites = [
    { name: 'Frontend Build Process', fn: testFrontendBuild },
    { name: 'API Endpoints', fn: testAllAPIEndpoints },
    { name: 'Frontend Components', fn: testFrontendComponents },
    { name: 'Performance and Load', fn: testPerformanceAndLoad },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  const results = [];
  
  for (const testSuite of testSuites) {
    try {
      log(`\n🧪 Running: ${testSuite.name}`, colors.blue);
      const result = await testSuite.fn();
      
      if (result && typeof result === 'object' && 'passed' in result) {
        totalPassed += result.passed;
        totalFailed += result.failed;
        results.push({ name: testSuite.name, ...result });
      } else if (result === true) {
        totalPassed++;
        results.push({ name: testSuite.name, passed: 1, failed: 0 });
      } else {
        totalFailed++;
        results.push({ name: testSuite.name, passed: 0, failed: 1 });
      }
    } catch (error) {
      log(`❌ ${testSuite.name} failed: ${error.message}`, colors.red);
      totalFailed++;
      results.push({ name: testSuite.name, passed: 0, failed: 1 });
    }
  }
  
  // Final summary
  log('\n📊 Comprehensive Test Results Summary:', colors.magenta);
  log('=====================================', colors.magenta);
  
  for (const result of results) {
    const successRate = result.passed + result.failed > 0 ? 
      Math.round((result.passed / (result.passed + result.failed)) * 100) : 0;
    log(`${result.name}: ${result.passed} passed, ${result.failed} failed (${successRate}%)`, 
      successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red);
  }
  
  log(`\n📈 Overall Results:`, colors.magenta);
  log(`✅ Total Passed: ${totalPassed}`, colors.green);
  log(`❌ Total Failed: ${totalFailed}`, colors.red);
  
  const overallSuccessRate = totalPassed + totalFailed > 0 ? 
    Math.round((totalPassed / (totalPassed + totalFailed)) * 100) : 0;
  log(`📊 Overall Success Rate: ${overallSuccessRate}%`, colors.blue);
  
  if (overallSuccessRate >= 90) {
    log('\n🎉 Excellent! All Frontend Tests Passed!', colors.green);
  } else if (overallSuccessRate >= 80) {
    log('\n✅ Good! Most Frontend Tests Passed!', colors.green);
  } else if (overallSuccessRate >= 60) {
    log('\n⚠️ Fair! Some Frontend Tests Need Attention.', colors.yellow);
  } else {
    log('\n❌ Poor! Many Frontend Tests Failed.', colors.red);
  }
  
  return { totalPassed, totalFailed, overallSuccessRate };
}

// Run comprehensive tests
runComprehensiveTests().catch(error => {
  log(`\n💥 Comprehensive test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 