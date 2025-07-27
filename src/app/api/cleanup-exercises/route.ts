import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Exercise from '@/lib/models/Exercise';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please sign in to clean up exercise data',
        details: 'Authentication required to access this endpoint'
      }, { status: 401 });
    }

    await connectDB();

    console.log('🧹 Starting comprehensive cleanup of exercise data...');

    // Get counts before cleanup
    const totalBefore = await Exercise.countDocuments({ userId });
    const mockDataBefore = await Exercise.countDocuments({ userId, source: 'mock-data' });
    const hikingJournalBefore = await Exercise.countDocuments({ userId, source: 'hiking-journal' });

    // Remove all mock data
    const mockExercises = await Exercise.find({ 
      userId, 
      source: 'mock-data' 
    });
    
    if (mockExercises.length > 0) {
      await Exercise.deleteMany({ 
        userId, 
        source: 'mock-data' 
      });
      console.log(`Removed ${mockExercises.length} mock exercises`);
    }
    
    // Remove any exercises with mock external IDs
    const mockExternalIds = await Exercise.find({ 
      userId, 
      externalId: { $regex: /^mock_/ } 
    });
    
    if (mockExternalIds.length > 0) {
      await Exercise.deleteMany({ 
        userId, 
        externalId: { $regex: /^mock_/ } 
      });
      console.log(`Removed ${mockExternalIds.length} exercises with mock external IDs`);
    }
    
    // Remove any exercises that don't have a proper source
    const invalidSourceExercises = await Exercise.find({ 
      userId, 
      $or: [
        { source: { $exists: false } },
        { source: '' },
        { source: 'demo' },
        { source: 'test' }
      ]
    });
    
    if (invalidSourceExercises.length > 0) {
      await Exercise.deleteMany({ 
        userId, 
        $or: [
          { source: { $exists: false } },
          { source: '' },
          { source: 'demo' },
          { source: 'test' }
        ]
      });
      console.log(`Removed ${invalidSourceExercises.length} exercises with invalid sources`);
    }

    // Get counts after cleanup
    const totalAfter = await Exercise.countDocuments({ userId });
    const hikingJournalAfter = await Exercise.countDocuments({ userId, source: 'hiking-journal' });

    const removedCount = totalBefore - totalAfter;

    console.log(`Cleanup complete! Removed ${removedCount} mock/demo exercises`);
    console.log(`Kept ${hikingJournalAfter} real hiking journal exercises`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up exercise data. Removed ${removedCount} mock/demo exercises, kept ${hikingJournalAfter} real hiking activities.`,
      cleanupStats: {
        totalBefore,
        totalAfter,
        removedCount,
        hikingJournalCount: hikingJournalAfter,
        mockDataRemoved: mockDataBefore
      }
    });

  } catch (error) {
    console.error('Error in cleanup-exercises endpoint:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to clean up exercise data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 