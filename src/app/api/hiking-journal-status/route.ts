import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { hasUserApiKey } from '@/lib/api-key-manager';

export async function GET() {
  try {
    // Get user ID from auth (even if we allow public access, we still want to check user-specific keys)
    const { userId } = await auth();
    
    console.log('Checking Hiking Journal public API status...');
    
    // Test the Hiking Journal API endpoint (public, no authentication required)
    const testResponse = await fetch('https://hiking-journal-amber.vercel.app/api/activities', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Health-First-App/1.0',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    console.log('Status check - Response status:', testResponse.status);
    console.log('Status check - Response ok:', testResponse.ok);

    const status = {
      url: 'https://hiking-journal-amber.vercel.app/api/activities',
      status: testResponse.status,
      statusText: testResponse.statusText,
      available: testResponse.ok,
      requiresAuth: false, // Public API doesn't require auth
      timestamp: new Date().toISOString(),
    };

    // Also test the main site
    const mainSiteResponse = await fetch('https://hiking-journal-amber.vercel.app/', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    const mainSiteStatus = {
      url: 'https://hiking-journal-amber.vercel.app/',
      status: mainSiteResponse.status,
      statusText: mainSiteResponse.statusText,
      available: mainSiteResponse.ok,
    };

    let message = '';
    let recommendation = '';

    if (testResponse.ok) {
      message = 'Hiking Journal API is available and accessible';
      recommendation = 'You can sync exercise data from the Hiking Journal app';
    } else if (testResponse.status === 404) {
      message = 'Hiking Journal API endpoint not found';
      recommendation = 'The API endpoint may have changed or the Hiking Journal app may not be deployed';
    } else {
      message = `Hiking Journal API returned status: ${testResponse.status}`;
      recommendation = 'Check if the Hiking Journal app is running and accessible';
    }

    return NextResponse.json({
      status,
      mainSiteStatus,
      message,
      recommendation,
      authentication: {
        hasApiKey: userId ? hasUserApiKey(userId) : false,
        hasSessionToken: false,
        method: 'public-api',
        hasValidAuth: true // Public API doesn't need auth
      }
    });
  } catch (error) {
    console.error('Error checking Hiking Journal status:', error);
    return NextResponse.json({
      error: 'Failed to check integration status',
      message: 'Unable to connect to Hiking Journal API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 