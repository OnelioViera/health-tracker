import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Medication from "@/lib/models/Medication";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    
    // If using mock connection, return sample data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      return NextResponse.json({
        success: true,
        data: [
          {
            _id: 'mock_med_1',
            userId,
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            timeOfDay: 'morning',
            duration: 'Ongoing',
            startDate: new Date('2024-01-01'),
            status: 'active',
            category: 'prescription',
            prescribedBy: 'Dr. Smith',
            pharmacy: 'CVS Pharmacy',
            notes: 'For blood pressure control',
            sideEffects: ['Dry cough', 'Dizziness'],
            interactions: ['Avoid with potassium supplements'],
            reminders: {
              enabled: true,
              times: ['08:00'],
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            _id: 'mock_med_2',
            userId,
            name: 'Aspirin',
            dosage: '81mg',
            frequency: 'Once daily',
            timeOfDay: 'morning',
            duration: 'Ongoing',
            startDate: new Date('2024-01-15'),
            status: 'active',
            category: 'over-the-counter',
            notes: 'For heart health',
            reminders: {
              enabled: false,
              times: [],
              days: []
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      });
    }

    const medications = await Medication.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: medications
    });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json(
      { error: "Failed to fetch medications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockMedication = {
        _id: `mock_med_${Date.now()}`,
        userId,
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        timeOfDay: body.timeOfDay,
        duration: body.duration || 'Ongoing',
        startDate: new Date(body.startDate),
        status: body.status || 'active',
        category: body.category || 'prescription',
        prescribedBy: body.prescribedBy,
        pharmacy: body.pharmacy,
        notes: body.notes,
        sideEffects: body.sideEffects || [],
        interactions: body.interactions || [],
        reminders: body.reminders || {
          enabled: false,
          times: [],
          days: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return NextResponse.json({
        success: true,
        data: mockMedication
      }, { status: 201 });
    }

    const medication = new Medication({
      userId,
      name: body.name,
      dosage: body.dosage,
      frequency: body.frequency,
      timeOfDay: body.timeOfDay,
      duration: body.duration || 'Ongoing',
      startDate: new Date(body.startDate),
      status: body.status || 'active',
      category: body.category || 'prescription',
      prescribedBy: body.prescribedBy,
      pharmacy: body.pharmacy,
      notes: body.notes,
      sideEffects: body.sideEffects || [],
      interactions: body.interactions || [],
      reminders: body.reminders || {
        enabled: false,
        times: [],
        days: []
      }
    });

    await medication.save();

    return NextResponse.json({
      success: true,
      data: medication
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating medication:", error);
    return NextResponse.json(
      { error: "Failed to create medication" },
      { status: 500 }
    );
  }
} 