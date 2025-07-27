#!/usr/bin/env node

/**
 * Test script to check if the public API endpoint works
 */

const https = require('https');

function testPublicAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app',
      port: 443,
      path: '/api/activities',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Health-First-App/1.0'
        // No Authorization header - public API
      }
    };

    console.log('🔍 Testing Hiking Journal Public API...');
    console.log('URL: https://hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app/api/activities');
    console.log('No authentication required (public API)');

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📊 Response Details:`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Status Text: ${res.statusMessage}`);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`✅ SUCCESS! API is working!`);
            console.log(`📊 Data received: ${jsonData.data ? jsonData.data.length : 0} activities`);
            console.log(`📝 Message: ${jsonData.message}`);
            
            if (jsonData.data && jsonData.data.length > 0) {
              console.log(`\n📋 Sample Activity:`);
              const sample = jsonData.data[0];
              console.log(`   Title: ${sample.title}`);
              console.log(`   Date: ${sample.date}`);
              console.log(`   Duration: ${sample.duration} minutes`);
              console.log(`   Distance: ${sample.distance} ${sample.distanceUnit}`);
              console.log(`   Difficulty: ${sample.difficulty}`);
              console.log(`   Mood: ${sample.mood}`);
            }
          } catch (e) {
            console.log('❌ Response is not valid JSON');
            console.log('Response body:', data.substring(0, 200) + '...');
          }
        } else if (res.statusCode === 401) {
          console.log('❌ Still requires authentication');
          console.log('The API endpoint still has authentication enabled');
        } else if (res.statusCode === 404) {
          console.log('❌ API endpoint not found');
          console.log('The /api/activities endpoint is not deployed');
        } else {
          console.log(`❌ Unexpected status: ${res.statusCode}`);
          console.log('Response body:', data.substring(0, 200) + '...');
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

async function runTest() {
  try {
    await testPublicAPI();
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

runTest(); 