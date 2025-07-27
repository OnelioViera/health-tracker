import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Exercise from '@/lib/models/Exercise';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const activityType = searchParams.get('activityType');

    await connectDB();

    const query: Record<string, unknown> = { userId };
    if (activityType) {
      query.activityType = activityType;
    }

    const exercises = await Exercise.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Exercise.countDocuments(query);

    return NextResponse.json({
      data: exercises,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      activityType,
      title,
      description,
      date,
      duration,
      distance,
      distanceUnit,
      calories,
      heartRate,
      elevation,
      location,
      weather,
      notes,
      photos,
      tags,
      difficulty,
      mood,
      source,
      externalId
    } = body;

    await connectDB();

    const exercise = new Exercise({
      userId,
      activityType,
      title,
      description,
      date,
      duration,
      distance,
      distanceUnit,
      calories,
      heartRate,
      elevation,
      location,
      weather,
      notes,
      photos,
      tags,
      difficulty,
      mood,
      source,
      externalId
    });

    const savedExercise = await exercise.save();
    return NextResponse.json(savedExercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
} 