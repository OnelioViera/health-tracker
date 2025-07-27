import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getUserApiKeyInfo, 
  setUserApiKey, 
  deleteUserApiKey 
} from '@/lib/api-key-manager';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please sign in to access API key settings'
      }, { status: 401 });
    }

    // Get the user's API key info
    const apiKeyInfo = getUserApiKeyInfo(userId);
    
    return NextResponse.json(apiKeyInfo);
  } catch (error) {
    console.error('Error getting API key:', error);
    return NextResponse.json({ error: 'Failed to get API key' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please sign in to update API key settings'
      }, { status: 401 });
    }

    const { apiKey } = await request.json();
    
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid API key',
        message: 'Please provide a valid API key'
      }, { status: 400 });
    }

    // Store the API key
    setUserApiKey(userId, apiKey);
    const apiKeyInfo = getUserApiKeyInfo(userId);

    return NextResponse.json({
      success: true,
      message: 'API key saved successfully',
      ...apiKeyInfo
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please sign in to delete API key'
      }, { status: 401 });
    }

    // Remove the API key
    deleteUserApiKey(userId);

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
      hasApiKey: false
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
} 