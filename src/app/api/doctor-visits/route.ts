import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import DoctorVisit from "@/lib/models/DoctorVisit";
import CalendarEvent from "@/lib/models/CalendarEvent";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const doctorVisit = new DoctorVisit({
      userId,
      doctorName: body.doctorName,
      specialty: body.specialty,
      visitDate: body.visitDate,
      visitTime: body.visitTime,
      visitType: body.visitType,
      symptoms: body.symptoms,
      diagnosis: body.diagnosis,
      treatment: body.treatment,
      medications: body.medications,
      recommendations: body.recommendations,
      followUpDate: body.followUpDate,
      notes: body.notes,
      cost: body.cost,
      insurance: body.insurance,
      location: body.location,
      status: body.status,
    });

    await doctorVisit.save();

    // Also create a calendar event for this doctor visit
    const calendarEvent = new CalendarEvent({
      userId,
      title: `${body.visitType} - ${body.doctorName}`,
      type: 'appointment',
      date: body.visitDate,
      time: body.visitTime || '9:00 AM', // Default time if not provided
      doctor: body.doctorName,
      location: body.location,
      status: body.status === 'completed' ? 'completed' : 'upcoming',
      color: 'blue',
      notes: body.notes || `Visit type: ${body.visitType}${body.specialty ? `, Specialty: ${body.specialty}` : ''}`
    });

    await calendarEvent.save();

    return NextResponse.json(doctorVisit, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor visit record:", error);
    return NextResponse.json(
      { error: "Failed to create doctor visit record" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const doctorVisits = await DoctorVisit.find({ userId })
      .sort({ visitDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await DoctorVisit.countDocuments({ userId });

    // Serialize the documents to avoid ObjectId issues
    const serializedVisits = doctorVisits.map(visit => ({
      ...visit.toObject(),
      _id: visit._id.toString(),
      visitDate: visit.visitDate.toISOString(),
      followUpDate: visit.followUpDate ? visit.followUpDate.toISOString() : undefined,
      createdAt: visit.createdAt.toISOString(),
      updatedAt: visit.updatedAt.toISOString(),
      medications: visit.medications.map((med: Medication) => ({
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
        notes: med.notes || ''
      }))
    }));

    return NextResponse.json({
      data: serializedVisits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching doctor visit records:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor visit records" },
      { status: 500 }
    );
  }
} 