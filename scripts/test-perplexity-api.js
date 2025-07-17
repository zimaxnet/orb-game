#!/usr/bin/env node

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY not set in environment variables');
  console.log('💡 Make sure to set your Perplexity API key in your .env file');
  process.exit(1);
}

async function testPerplexityAPI() {
  const testMessage = process.argv[2] || "Hello! What's the latest news about AI?";

  // Print the curl command with the correct testMessage
  console.log('🔧 Equivalent curl command:');
  console.log(`curl -X POST https://api.perplexity.ai/chat/completions \\`);
  console.log(`  -H "Authorization: Bearer ${PERPLEXITY_API_KEY}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{`);
  console.log(`    "model": "sonar",`);
  console.log(`    "messages": [`);
  console.log(`      {"role": "user", "content": "${testMessage}"}`);
  console.log(`    ],`);
  console.log(`    "stream": false,`);
  console.log(`    "max_tokens": 500`);
  console.log(`  }'`);
  console.log('\n');

  console.log('🧪 Testing Perplexity API...');
  console.log(`📝 Test message: "${testMessage}"`);
  console.log('🔑 Using API key:', PERPLEXITY_API_KEY.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'user', content: testMessage }
        ],
        stream: false,
        max_tokens: 500
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log('🤖 Response:');
      console.log(data.choices[0].message.content);
      
      console.log('\n📊 Response details:');
      console.log('- Model used:', data.model);
      console.log('- Tokens used:', data.usage?.total_tokens || 'N/A');
      console.log('- Response time:', response.headers.get('x-request-id') ? 'Tracked' : 'Not tracked');
    } else {
      const errorText = await response.text();
      console.error('❌ API call failed:');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testPerplexityAPI(); 