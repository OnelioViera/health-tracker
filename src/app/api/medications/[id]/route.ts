import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Medication from "@/lib/models/Medication";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectDB();
    
    // If using mock connection, return sample data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      return NextResponse.json({
        success: true,
        data: {
          _id: id,
          userId,
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
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
        }
      });
    }

    const medication = await Medication.findOne({ _id: id, userId });
    
    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: medication
    });
  } catch (error) {
    console.error("Error fetching medication:", error);
    return NextResponse.json(
      { error: "Failed to fetch medication" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      return NextResponse.json({
        success: true,
        data: {
          ...body,
          _id: id,
          userId,
          updatedAt: new Date()
        }
      });
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: id, userId },
      {
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
      },
      { new: true }
    );

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: medication
    });
  } catch (error) {
    console.error("Error updating medication:", error);
    return NextResponse.json(
      { error: "Failed to update medication" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      return NextResponse.json({
        success: true,
        message: "Medication deleted successfully"
      });
    }

    const medication = await Medication.findOneAndDelete({ _id: id, userId });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Medication deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting medication:", error);
    return NextResponse.json(
      { error: "Failed to delete medication" },
      { status: 500 }
    );
  }
} 