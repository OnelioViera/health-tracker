#!/usr/bin/env node

/**
 * Test script for Cross-App Clerk Authentication Setup
 * Tests if we can authenticate between two different Clerk instances
 */

const https = require('https');

console.log('🔍 Testing Cross-App Clerk Authentication Setup');
console.log('==============================================');
console.log('');

console.log('📋 Clerk Instances:');
console.log('- Health Tracker App: promoted-dane-74');
console.log('- Hiking Journal App: giving-ostrich-12');
console.log('');

console.log('🔑 Authentication Strategy:');
console.log('1. Both apps use different Clerk instances');
console.log('2. Cross-app authentication requires same user account');
console.log('3. Session tokens are instance-specific');
console.log('');

console.log('🧪 Testing API with different authentication methods...');

function testWithDifferentTokens() {
  const tokens = [
    { name: 'Health Tracker Session Token', token: 'health-tracker-session-token' },
    { name: 'Hiking Journal Session Token', token: 'hiking-journal-session-token' },
    { name: 'API Token', token: 'api-token' },
    { name: 'Invalid Token', token: 'invalid-token' }
  ];

  return Promise.all(tokens.map(async ({ name, token }) => {
    return new Promise((resolve) => {
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
              name,
              token: token.substring(0, 10) + '...',
              status: res.statusCode,
              headers: res.headers,
              data: jsonData
            });
          } catch (error) {
            resolve({
              name,
              token: token.substring(0, 10) + '...',
              status: res.statusCode,
              headers: res.headers,
              data: data
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          name,
          token: token.substring(0, 10) + '...',
          status: 'ERROR',
          error: error.message
        });
      });

      req.end();
    });
  }));
}

async function testCrossAppSetup() {
  try {
    console.log('📡 Testing different authentication methods...');
    const results = await testWithDifferentTokens();
    
    console.log('\n📊 Results:');
    console.log('===========');
    
    results.forEach(result => {
      console.log(`\n🔑 ${result.name}:`);
      console.log(`   Token: ${result.token}`);
      console.log(`   Status: ${result.status}`);
      
      if (result.headers) {
        const authHeaders = Object.entries(result.headers).filter(([key]) => 
          key.toLowerCase().includes('clerk') || key.toLowerCase().includes('auth')
        );
        
        if (authHeaders.length > 0) {
          console.log(`   Auth Headers:`);
          authHeaders.forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`);
          });
        }
      }
      
      if (result.status === 200) {
        console.log(`   ✅ SUCCESS: Authentication working!`);
      } else if (result.status === 401) {
        console.log(`   ❌ FAILED: Authentication required`);
      } else if (result.status === 'ERROR') {
        console.log(`   💥 ERROR: ${result.error}`);
      }
    });
    
    console.log('\n💡 Analysis:');
    console.log('============');
    console.log('• If all tokens return 401, cross-app auth is not configured');
    console.log('• If API token works, you need to get a real token');
    console.log('• If session tokens work, cross-app auth is possible');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Get an API token from the Hiking Journal app');
    console.log('2. Or contact the developer to enable cross-app auth');
    console.log('3. Use demo data for testing in the meantime');
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
  }
}

// Run the test
testCrossAppSetup(); 