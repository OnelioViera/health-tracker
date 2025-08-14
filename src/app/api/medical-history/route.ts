import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface MedicalHistoryEntry {
  _id: string;
  condition: string;
  diagnosisDate: Date;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'chronic';
  symptoms: string[];
  treatments: string[];
  medications: string[];
  doctorName?: string;
  specialty?: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data storage - in a real app, this would be a database
const medicalHistoryData: MedicalHistoryEntry[] = [];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // If ID is provided, fetch single entry
    if (id) {
      const entry = medicalHistoryData.find(entry => entry._id === id && entry.userId === userId);
      
      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: entry
      });
    }

    // Otherwise, fetch filtered list
    let filteredData = medicalHistoryData.filter(entry => entry.userId === userId);

    if (status) {
      filteredData = filteredData.filter(entry => entry.status === status);
    }

    if (limit) {
      const limitNum = parseInt(limit);
      filteredData = filteredData.slice(0, limitNum);
    }

    // Sort by diagnosis date (newest first)
    filteredData.sort((a, b) => new Date(b.diagnosisDate).getTime() - new Date(a.diagnosisDate).getTime());

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    });

  } catch (error) {
    console.error('Error fetching medical history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.condition || !body.diagnosisDate) {
      return NextResponse.json(
        { error: 'Condition and diagnosis date are required' },
        { status: 400 }
      );
    }

    // Create new entry
    const newEntry: MedicalHistoryEntry = {
      _id: `mh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      condition: body.condition,
      diagnosisDate: new Date(body.diagnosisDate),
      severity: body.severity || 'mild',
      status: body.status || 'active',
      symptoms: body.symptoms || [],
      treatments: body.treatments || [],
      medications: body.medications || [],
      doctorName: body.doctorName || '',
      specialty: body.specialty || '',
      notes: body.notes || '',
      followUpRequired: body.followUpRequired || false,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to mock data
    medicalHistoryData.push(newEntry);

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'Medical history entry created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating medical history entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const entryIndex = medicalHistoryData.findIndex(entry => entry._id === id && entry.userId === userId);
    
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Update entry
    const updatedEntry = {
      ...medicalHistoryData[entryIndex],
      ...body,
      updatedAt: new Date(),
    };

    medicalHistoryData[entryIndex] = updatedEntry;

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'Medical history entry updated successfully'
    });

  } catch (error) {
    console.error('Error updating medical history entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const entryIndex = medicalHistoryData.findIndex(entry => entry._id === id && entry.userId === userId);
    
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Remove entry
    medicalHistoryData.splice(entryIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Medical history entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting medical history entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 