#!/usr/bin/env node

/**
 * Test script to check what the Hiking Journal API endpoint is returning
 */

const https = require('https');

function testEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app',
      port: 443,
      path: '/api/activities',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Health-First-App/1.0',
        'Authorization': 'Bearer 47f9e474072bb1a0197b59ccc4704d632c757d48ecfd989d7f14d34b8e445cc8'
      }
    };

    console.log('🔍 Testing Hiking Journal API endpoint...');
    console.log('URL: https://hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app/api/activities');

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📊 Response Details:`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Status Text: ${res.statusMessage}`);
        console.log(`Headers:`, res.headers);
        console.log(`\n📄 Response Body:`);
        console.log(data);
        
        if (res.statusCode === 401) {
          console.log('\n❌ Authentication failed. This means:');
          console.log('1. The API endpoint exists but token validation is failing');
          console.log('2. The VALID_API_TOKENS environment variable is not set correctly');
          console.log('3. The token validation logic in your API endpoint is not working');
        } else if (res.statusCode === 404) {
          console.log('\n❌ API endpoint not found. This means:');
          console.log('1. The /api/activities endpoint is not deployed');
          console.log('2. The endpoint path is incorrect');
          console.log('3. The Hiking Journal app is not properly deployed');
        } else if (res.statusCode === 200) {
          console.log('\n✅ API endpoint is working!');
        }
        
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
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

async function runTest() {
  try {
    await testEndpoint();
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

runTest(); 