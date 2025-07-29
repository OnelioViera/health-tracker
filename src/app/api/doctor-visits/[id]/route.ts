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
    await connectDB();

    const doctorVisit = await DoctorVisit.findOne({ _id: id, userId });
    
    if (!doctorVisit) {
      return NextResponse.json({ error: "Doctor visit not found" }, { status: 404 });
    }

    // Serialize the document to avoid ObjectId issues
    const serializedVisit = {
      ...doctorVisit.toObject(),
      _id: doctorVisit._id.toString(),
      visitDate: doctorVisit.visitDate.toISOString(),
      followUpDate: doctorVisit.followUpDate ? doctorVisit.followUpDate.toISOString() : undefined,
      createdAt: doctorVisit.createdAt.toISOString(),
      updatedAt: doctorVisit.updatedAt.toISOString(),
      medications: doctorVisit.medications.map((med: Medication) => ({
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
        notes: med.notes || ''
      }))
    };

    return NextResponse.json(serializedVisit);
  } catch (error) {
    console.error("Error fetching doctor visit:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor visit" },
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
    await connectDB();

    const doctorVisit = await DoctorVisit.findOne({ _id: id, userId });
    
    if (!doctorVisit) {
      return NextResponse.json({ error: "Doctor visit not found" }, { status: 404 });
    }

    // Update the doctor visit
    Object.assign(doctorVisit, {
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
      updatedAt: new Date(),
    });

    await doctorVisit.save();

    // Update the corresponding calendar event
    const calendarEvent = await CalendarEvent.findOne({
      userId,
      title: { $regex: doctorVisit.visitType, $options: 'i' },
      date: body.visitDate,
    });

    if (calendarEvent) {
      calendarEvent.title = `${body.visitType} - ${body.doctorName}`;
      calendarEvent.date = body.visitDate;
      calendarEvent.time = body.visitTime || '9:00 AM';
      calendarEvent.doctor = body.doctorName;
      calendarEvent.location = body.location;
      calendarEvent.status = body.status === 'completed' ? 'completed' : 'upcoming';
      calendarEvent.notes = body.notes || `Visit type: ${body.visitType}${body.specialty ? `, Specialty: ${body.specialty}` : ''}`;
      calendarEvent.updatedAt = new Date();
      
      await calendarEvent.save();
    }

    return NextResponse.json(doctorVisit);
  } catch (error) {
    console.error("Error updating doctor visit:", error);
    return NextResponse.json(
      { error: "Failed to update doctor visit" },
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
    await connectDB();

    const doctorVisit = await DoctorVisit.findOne({ _id: id, userId });
    
    if (!doctorVisit) {
      return NextResponse.json({ error: "Doctor visit not found" }, { status: 404 });
    }

    // Delete the doctor visit
    await DoctorVisit.findByIdAndDelete(id);

    // Delete the corresponding calendar event
    const calendarEvent = await CalendarEvent.findOne({
      userId,
      title: { $regex: doctorVisit.visitType, $options: 'i' },
      date: doctorVisit.visitDate,
    });

    if (calendarEvent) {
      await CalendarEvent.findByIdAndDelete(calendarEvent._id);
    }

    return NextResponse.json({ message: "Doctor visit deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor visit:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor visit" },
      { status: 500 }
    );
  }
} 