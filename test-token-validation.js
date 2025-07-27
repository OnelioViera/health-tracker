#!/usr/bin/env node

/**
 * Test script to verify token validation in Hiking Journal app
 */

const https = require('https');

// Test different scenarios
const testCases = [
  {
    name: 'Valid API Token',
    token: '47f9e474072bb1a0197b59ccc4704d632c757d48ecfd989d7f14d34b8e445cc8',
    expected: 200
  },
  {
    name: 'Invalid Token',
    token: 'invalid_token_here',
    expected: 401
  },
  {
    name: 'No Token',
    token: null,
    expected: 401
  }
];

function makeRequest(token, testName) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Health-First-App/1.0'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app',
      port: 443,
      path: '/api/activities',
      method: 'GET',
      headers
    };

    console.log(`\n🔍 Testing: ${testName}`);
    console.log(`Token: ${token ? token.substring(0, 10) + '...' : 'None'}`);

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Expected: ${testCases.find(t => t.name === testName).expected}`);
        console.log(`Result: ${res.statusCode === testCases.find(t => t.name === testName).expected ? '✅ PASS' : '❌ FAIL'}`);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`Data received: ${jsonData.data ? jsonData.data.length : 0} activities`);
          } catch (e) {
            console.log('Response is not JSON');
          }
        }
        
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Hiking Journal API Token Validation');
  console.log('=============================================');

  for (const testCase of testCases) {
    try {
      await makeRequest(testCase.token, testCase.name);
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
  }

  console.log('\n📋 Summary:');
  console.log('If the "Valid API Token" test passes (200), your token is working.');
  console.log('If it fails (401), check your Hiking Journal app\'s token validation.');
}

runTests(); 