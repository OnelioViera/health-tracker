#!/usr/bin/env node

/**
 * Test script for Cross-App Clerk Authentication
 * This tests if we can use Clerk session tokens for Hiking Journal API access
 */

const https = require('https');

console.log('🔍 Testing Cross-App Clerk Authentication');
console.log('==========================================');
console.log('');

console.log('📋 Current Setup:');
console.log('- Health Tracker App: http://localhost:3001');
console.log('- Hiking Journal App: https://hiking-journal-amber.vercel.app/');
console.log('- Both apps use Clerk authentication');
console.log('');

console.log('🔑 Authentication Methods:');
console.log('1. API Token (not configured)');
console.log('2. Clerk Session Token (automatic)');
console.log('3. Default Token (fallback)');
console.log('');

console.log('📝 Instructions:');
console.log('1. Make sure you are logged into BOTH apps with the same Clerk account');
console.log('2. Visit http://localhost:3001 and sign in');
console.log('3. Visit https://hiking-journal-amber.vercel.app/ and sign in');
console.log('4. Go back to health-tracker and try syncing from Exercise page');
console.log('');

console.log('🧪 Testing API Endpoint...');

function testHikingJournalAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hiking-journal-amber.vercel.app',
      port: 443,
      path: '/api/activities',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-session-token',
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

async function testCrossAppAuth() {
  try {
    console.log('📡 Making API request with test token...');
    const response = await testHikingJournalAPI();
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Response Headers:`);
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase().includes('clerk') || key.toLowerCase().includes('auth')) {
        console.log(`   ${key}: ${value}`);
      }
    });
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS: Cross-app authentication working!');
      console.log('The Hiking Journal API accepted the session token.');
    } else if (response.status === 401) {
      console.log('\n❌ AUTHENTICATION FAILED: Session token not accepted');
      console.log('This means the Hiking Journal app is not configured to accept');
      console.log('tokens from other Clerk applications.');
      console.log('');
      console.log('💡 Solutions:');
      console.log('1. Contact the Hiking Journal developer to enable cross-app auth');
      console.log('2. Get an API token from the Hiking Journal app');
      console.log('3. Use the demo data feature for testing');
    } else {
      console.log(`\n⚠️  UNEXPECTED STATUS: ${response.status}`);
      console.log('Please check the API endpoint and configuration.');
    }
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.log('Please check your internet connection and API endpoint.');
  }
}

// Run the test
testCrossAppAuth(); 