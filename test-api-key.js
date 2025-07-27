#!/usr/bin/env node

/**
 * Test script to verify API key with Hiking Journal
 * Run this to check if your API key is working
 */

const https = require('https');

// Configuration
const API_URL = 'https://hiking-journal-amber.vercel.app/api/activities';

// Get API key from command line argument
const apiKey = process.argv[2];

if (!apiKey) {
  console.log('❌ Please provide an API key as an argument');
  console.log('Usage: node test-api-key.js YOUR_API_KEY_HERE');
  process.exit(1);
}

console.log('🔍 Testing API Key with Hiking Journal');
console.log('=====================================');
console.log(`API URL: ${API_URL}`);
console.log(`API Key: ${apiKey.substring(0, 8)}...`);

function testApiKey(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hiking-journal-amber.vercel.app',
      port: 443,
      path: '/api/activities',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Health-First-App/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTest() {
  try {
    console.log('📡 Making API request...');
    const response = await testApiKey(apiKey);
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Response Headers:`);
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log(`📄 Response Data:`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS: API key is working!');
      console.log('You can now sync data from the Hiking Journal app.');
    } else if (response.status === 401) {
      console.log('\n❌ AUTHENTICATION FAILED: Invalid API key');
      console.log('Please check:');
      console.log('1. The API key is correct and complete');
      console.log('2. The API key has the required permissions');
      console.log('3. The Hiking Journal app is configured to accept external API requests');
    } else if (response.status === 403) {
      console.log('\n🚫 FORBIDDEN: API key lacks required permissions');
      console.log('The API key exists but doesn\'t have the right scopes.');
    } else {
      console.log(`\n⚠️  UNEXPECTED STATUS: ${response.status}`);
      console.log('Please check the API endpoint and key configuration.');
    }
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.log('Please check your internet connection and API endpoint.');
  }
}

runTest(); 