import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const healthData = await request.json();
    const { type, data, timestamp } = healthData;

    // Store health data in your hiking journal database
    // This could be a new collection like 'health_sync_data'
    
    console.log('Received health data:', {
      userId,
      type,
      dataKeys: Object.keys(data || {}),
      timestamp
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `${type || 'Health'} data synced successfully` 
    });
  } catch (error) {
    console.error('Error syncing health data:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock health data for demonstration
    const mockHealthData = {
      weight: {
        current: 165.5,
        unit: 'lbs',
        trend: 'down',
        lastUpdated: new Date().toISOString()
      },
      bloodPressure: {
        systolic: 120,
        diastolic: 80,
        category: 'normal',
        lastUpdated: new Date().toISOString()
      },
      goals: [
        {
          title: 'Lose 10 pounds',
          progress: 60,
          status: 'active'
        },
        {
          title: 'Lower blood pressure',
          progress: 80,
          status: 'active'
        }
      ]
    };

    return NextResponse.json(mockHealthData);
  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 });
  }
} 