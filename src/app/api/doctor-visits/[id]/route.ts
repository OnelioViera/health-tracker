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
    // Try multiple search strategies to find the correct calendar event
    let calendarEvent = await CalendarEvent.findOne({
      userId,
      title: { $regex: doctorVisit.visitType, $options: 'i' },
      date: body.visitDate,
    });

    // If not found, try searching by doctor name and date
    if (!calendarEvent) {
      calendarEvent = await CalendarEvent.findOne({
        userId,
        doctor: { $regex: doctorVisit.doctorName, $options: 'i' },
        date: body.visitDate,
      });
    }

    // If still not found, try searching by date and type
    if (!calendarEvent) {
      calendarEvent = await CalendarEvent.findOne({
        userId,
        type: 'appointment',
        date: body.visitDate,
      });
    }

    if (calendarEvent) {
      console.log('Found calendar event to update:', calendarEvent.title);
      calendarEvent.title = `${body.visitType} - ${body.doctorName}`;
      calendarEvent.date = body.visitDate;
      calendarEvent.time = body.visitTime || '9:00 AM';
      calendarEvent.doctor = body.doctorName;
      calendarEvent.location = body.location;
      calendarEvent.status = body.status === 'completed' ? 'completed' : 'upcoming';
      calendarEvent.notes = body.notes || `Visit type: ${body.visitType}${body.specialty ? `, Specialty: ${body.specialty}` : ''}`;
      calendarEvent.updatedAt = new Date();
      
      await calendarEvent.save();
      console.log('Calendar event updated successfully. New status:', calendarEvent.status);
    } else {
      console.log('No matching calendar event found for doctor visit:', doctorVisit._id);
      // Create a new calendar event if none exists
      const newCalendarEvent = new CalendarEvent({
        userId,
        title: `${body.visitType} - ${body.doctorName}`,
        type: 'appointment',
        date: body.visitDate,
        time: body.visitTime || '9:00 AM',
        doctor: body.doctorName,
        location: body.location,
        status: body.status === 'completed' ? 'completed' : 'upcoming',
        color: 'blue',
        notes: body.notes || `Visit type: ${body.visitType}${body.specialty ? `, Specialty: ${body.specialty}` : ''}`
      });
      
      await newCalendarEvent.save();
      console.log('Created new calendar event for completed appointment');
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