import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/lib/models/Goal';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const goal = await Goal.findOne({ _id: params.id, userId });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, targetValue, currentValue, unit, startDate, targetDate } = body;

    await connectDB();

    // Calculate updated progress
    const progress = Math.min(Math.max((currentValue / targetValue) * 100, 0), 100);
    
    // Determine status based on dates and progress
    const now = new Date();
    const target = new Date(targetDate);
    let status: 'active' | 'completed' | 'overdue' = 'active';
    
    if (progress >= 100) {
      status = 'completed';
    } else if (now > target) {
      status = 'overdue';
    }

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: params.id, userId },
      {
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
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const deletedGoal = await Goal.findOneAndDelete({ _id: params.id, userId });

    if (!deletedGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 