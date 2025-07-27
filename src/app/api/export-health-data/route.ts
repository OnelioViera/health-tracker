import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserApiKey } from '@/lib/api-key-manager';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetApp } = await request.json();

    // Export health data (this would typically fetch from your database)
    const exportData = {
      weight: { current: 70, target: 68, unit: 'kg' },
      bloodPressure: { systolic: 120, diastolic: 80 },
      goals: { dailySteps: 10000, weeklyWorkouts: 3 }
    };

    // Send to target app (Hiking Journal)
    if (targetApp === 'hiking-journal') {
      try {
        // Use user-specific API key if available, fallback to environment variable
        const userApiKey = getUserApiKey(userId);
        const authToken = userApiKey || process.env.HEALTH_SYNC_TOKEN || 'default-token';
        
        const syncResponse = await fetch('https://hiking-journal-amber.vercel.app/api/health-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            userId,
            data: exportData,
            timestamp: new Date().toISOString(),
          }),
        });

        if (syncResponse.ok) {
          return NextResponse.json({ 
            success: true, 
            message: 'Data synced to Hiking Journal successfully' 
          });
        } else {
          console.log('Sync failed, returning local data');
        }
      } catch (error) {
        console.log('Sync error, returning local data:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: exportData 
    });
    
  } catch (error) {
    console.error('Error exporting health data:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
} 