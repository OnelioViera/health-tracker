#!/usr/bin/env node

/**
 * Test script for Hiking Journal API authentication
 * Run this script to test if your API token is working
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Configuration
const API_URL = 'https://hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app/api/activities';
const API_TOKEN = process.env.HEALTH_SYNC_TOKEN || 'your_token_here';

console.log('🔍 Testing Hiking Journal API Authentication');
console.log('============================================');
console.log(`API URL: ${API_URL}`);
console.log(`Token: ${API_TOKEN.substring(0, 10)}...`);
console.log('');

function makeRequest(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app',
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

async function testAuthentication() {
  try {
    console.log('📡 Making API request...');
    const response = await makeRequest(API_TOKEN);
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Response Headers:`);
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log(`📄 Response Data:`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS: Authentication working!');
      console.log('You can now sync data from the Hiking Journal app.');
    } else if (response.status === 401) {
      console.log('\n❌ AUTHENTICATION FAILED: Invalid or missing token');
      console.log('Please check your HEALTH_SYNC_TOKEN environment variable.');
    } else if (response.status === 403) {
      console.log('\n🚫 FORBIDDEN: Token lacks required permissions');
      console.log('Please check if your token has the right scopes.');
    } else {
      console.log(`\n⚠️  UNEXPECTED STATUS: ${response.status}`);
      console.log('Please check the API endpoint and token configuration.');
    }
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.log('Please check your internet connection and API endpoint.');
  }
}

// Run the test
testAuthentication(); 