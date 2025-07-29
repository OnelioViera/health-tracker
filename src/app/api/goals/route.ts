import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/lib/models/Goal';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ data: goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, targetValue, currentValue, unit, startDate, targetDate } = body;

    // Validate required fields
    if (!title || !targetValue || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Calculate progress based on goal category
    let progress = 0;
    if (category === 'weight') {
      // For weight goals, calculate progress based on weight loss
      const startWeight = currentValue; // Current value is the start weight for weight goals
      const weightDifference = startWeight - targetValue; // How much weight to lose
      const currentProgress = startWeight - currentValue; // How much weight lost (initially 0)
      
      if (weightDifference > 0) {
        progress = (currentProgress / weightDifference) * 100;
      }
    } else {
      // For other goals, use standard progress calculation
      progress = Math.min(Math.max((currentValue / targetValue) * 100, 0), 100);
    }
    
    // Determine status based on dates and progress
    const now = new Date();
    const target = new Date(targetDate);
    let status: 'active' | 'completed' | 'overdue' = 'active';
    
    if (progress >= 100) {
      status = 'completed';
    } else if (now > target) {
      status = 'overdue';
    }

    const goal = new Goal({
      userId,
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      startDate,
      targetDate,
      status,
      progress,
    });

    const savedGoal = await goal.save();
    return NextResponse.json(savedGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 