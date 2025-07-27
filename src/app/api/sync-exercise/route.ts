import { NextRequest, NextResponse } from 'next/server';
import { auth, getAuth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Exercise from '@/lib/models/Exercise';
import { getUserApiKey } from '@/lib/api-key-manager';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please sign in to sync exercise data',
        details: 'Authentication required to access this endpoint'
      }, { status: 401 });
    }

    // Check for force parameter
    const url = new URL(request.url);
    const forceSync = url.searchParams.get('force') === 'true';

    await connectDB();

    // Fetch exercise data from Hiking Journal app (public endpoint)
    try {
      console.log('Attempting to fetch from Hiking Journal public API...');
      
      const hikingResponse = await fetch('https://hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app/api/activities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Health-First-App/1.0',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log(`Hiking Journal API response status: ${hikingResponse.status}`);

      if (hikingResponse.ok) {
        const hikingData = await hikingResponse.json();
        console.log('Successfully fetched data from Hiking Journal:', hikingData);
        
        // Process and store each activity
        const syncedActivities = [];
        
        // Helper function to map mood values to valid enum values
        const mapMoodValue = (mood: string): string => {
          const moodMap: Record<string, string> = {
            'excellent': 'great',
            'amazing': 'great',
            'fantastic': 'great',
            'wonderful': 'great',
            'good': 'good',
            'great': 'great',
            'okay': 'okay',
            'fine': 'okay',
            'tough': 'tough',
            'difficult': 'tough',
            'challenging': 'tough',
            'exhausted': 'exhausted',
            'tired': 'exhausted',
            'drained': 'exhausted'
          };
          return moodMap[mood.toLowerCase()] || 'good';
        };
        
        // Helper function to map difficulty values to valid enum values
        const mapDifficultyValue = (difficulty: string): string => {
          const difficultyMap: Record<string, string> = {
            'easy': 'easy',
            'moderate': 'moderate',
            'medium': 'moderate',
            'hard': 'hard',
            'difficult': 'hard',
            'challenging': 'hard',
            'extreme': 'extreme',
            'very hard': 'extreme',
            'very difficult': 'extreme'
          };
          return difficultyMap[difficulty.toLowerCase()] || 'moderate';
        };
        
        for (const activity of hikingData.data || []) {
          // Check if activity already exists
          const existingExercise = await Exercise.findOne({ 
            userId, 
            externalId: activity._id 
          });

          console.log(`Activity ${activity._id}: ${existingExercise ? 'Already exists' : 'New activity'}`);

          if (!existingExercise || forceSync) {
            if (existingExercise && forceSync) {
              console.log(`Force updating existing exercise: ${existingExercise.title}`);
              // Update existing exercise with new data
              existingExercise.title = activity.title || 'Hiking Activity';
              existingExercise.description = activity.description || '';
              existingExercise.date = new Date(activity.date || activity.createdAt);
              existingExercise.duration = activity.duration || 0;
              existingExercise.distance = activity.distance || 0;
              existingExercise.distanceUnit = activity.distanceUnit || 'miles';
              existingExercise.calories = activity.calories || 0;
              existingExercise.heartRate = activity.heartRate || {};
              existingExercise.elevation = activity.elevation || {};
              existingExercise.location = activity.location || {};
              existingExercise.weather = activity.weather || {};
              existingExercise.notes = activity.notes || '';
              existingExercise.photos = activity.photos || [];
              existingExercise.tags = activity.tags || [];
              existingExercise.difficulty = mapDifficultyValue(activity.difficulty || 'moderate');
              existingExercise.mood = mapMoodValue(activity.mood || 'good');
              
              const updatedExercise = await existingExercise.save();
              syncedActivities.push(updatedExercise);
              console.log(`Updated existing exercise: ${updatedExercise.title}`);
            } else {
              const exercise = new Exercise({
                userId,
                activityType: 'hiking',
                title: activity.title || 'Hiking Activity',
                description: activity.description || '',
                date: new Date(activity.date || activity.createdAt),
                duration: activity.duration || 0,
                distance: activity.distance || 0,
                distanceUnit: activity.distanceUnit || 'miles',
                calories: activity.calories || 0,
                heartRate: activity.heartRate || {},
                elevation: activity.elevation || {},
                location: activity.location || {},
                weather: activity.weather || {},
                notes: activity.notes || '',
                photos: activity.photos || [],
                tags: activity.tags || [],
                difficulty: mapDifficultyValue(activity.difficulty || 'moderate'),
                mood: mapMoodValue(activity.mood || 'good'),
                source: 'hiking-journal',
                externalId: activity._id
              });

              const savedExercise = await exercise.save();
              syncedActivities.push(savedExercise);
              console.log(`Saved new exercise: ${savedExercise.title}`);
            }
          } else {
            console.log(`Skipping existing exercise: ${existingExercise.title}`);
          }
        }

        return NextResponse.json({
          success: true,
          message: `Successfully synced ${syncedActivities.length} activities from Hiking Journal${forceSync ? ' (force sync)' : ''}`,
          syncedCount: syncedActivities.length,
          source: 'hiking-journal',
          authMethod: 'public-api',
          forceSync
        });
      } else {
        console.log(`Hiking Journal API returned status: ${hikingResponse.status}`);
        throw new Error(`Hiking Journal API unavailable (Status: ${hikingResponse.status})`);
      }
    } catch (error) {
      console.error('Error syncing from Hiking Journal:', error);
      
      // Create mock data for demonstration if API is unavailable
      console.log('Creating mock data for demonstration...');
      
      const mockExercises = [
        {
          userId,
          activityType: 'hiking',
          title: 'Mountain Trail Hike',
          description: 'Beautiful hike through mountain trails with scenic views',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          duration: 180, // 3 hours
          distance: 5.2,
          distanceUnit: 'miles',
          calories: 850,
          elevation: { gain: 1200, loss: 1200 },
          location: { name: 'Mountain Trail' },
          weather: { temperature: 65, conditions: 'Sunny' },
          difficulty: 'moderate',
          mood: 'great',
          source: 'hiking-journal',
          externalId: 'mock_1'
        },
        {
          userId,
          activityType: 'hiking',
          title: 'Riverside Walk',
          description: 'Peaceful walk along the river with gentle terrain',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          duration: 90, // 1.5 hours
          distance: 3.1,
          distanceUnit: 'miles',
          calories: 450,
          elevation: { gain: 200, loss: 200 },
          location: { name: 'Riverside Trail' },
          weather: { temperature: 72, conditions: 'Partly Cloudy' },
          difficulty: 'easy',
          mood: 'good',
          source: 'hiking-journal',
          externalId: 'mock_2'
        },
        {
          userId,
          activityType: 'hiking',
          title: 'Forest Trail Adventure',
          description: 'Challenging hike through dense forest with steep climbs',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          duration: 240, // 4 hours
          distance: 7.8,
          distanceUnit: 'miles',
          calories: 1200,
          elevation: { gain: 1800, loss: 1800 },
          location: { name: 'National Forest' },
          weather: { temperature: 58, conditions: 'Overcast' },
          difficulty: 'hard',
          mood: 'tough',
          source: 'hiking-journal',
          externalId: 'mock_3'
        }
      ];

      for (const exerciseData of mockExercises) {
        const existingExercise = await Exercise.findOne({ 
          userId, 
          externalId: exerciseData.externalId 
        });

        if (!existingExercise) {
          const exercise = new Exercise(exerciseData);
          await exercise.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Created mock exercise data for demonstration (Hiking Journal API is not available)',
        syncedCount: mockExercises.length,
        source: 'mock-data',
        error: 'Hiking Journal API is not available',
        authMethod: 'public-api'
      });
    }
  } catch (error) {
    console.error('Error in sync-exercise endpoint:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync exercise data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 