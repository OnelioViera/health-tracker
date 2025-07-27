import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import BloodPressure from '@/lib/models/BloodPressure';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const reading = await BloodPressure.findOne({ _id: id, userId }).lean();

    if (!reading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error fetching blood pressure reading:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blood pressure reading' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { systolic, diastolic, pulse, date, notes } = body;

    await connectDB();

    const updatedReading = await BloodPressure.findOneAndUpdate(
      { _id: id, userId },
      {
        systolic,
        diastolic,
        pulse,
        date,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!updatedReading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    return NextResponse.json(updatedReading);
  } catch (error) {
    console.error('Error updating blood pressure reading:', error);
    return NextResponse.json(
      { error: 'Failed to update blood pressure reading' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const deletedReading = await BloodPressure.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!deletedReading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reading deleted successfully' });
  } catch (error) {
    console.error('Error deleting blood pressure reading:', error);
    return NextResponse.json(
      { error: 'Failed to delete blood pressure reading' },
      { status: 500 }
    );
  }
} 