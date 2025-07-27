import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import CalendarEvent from '@/lib/models/CalendarEvent';
import DoctorVisit from '@/lib/models/DoctorVisit';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch both calendar events and doctor visits
    const [calendarEvents, doctorVisits] = await Promise.all([
      CalendarEvent.find({ userId }).sort({ date: 1, time: 1 }).lean(),
      DoctorVisit.find({ userId }).sort({ visitDate: 1 }).lean()
    ]);

    // Convert doctor visits to calendar event format
    const doctorVisitEvents = doctorVisits.map(visit => ({
      _id: `doctor_${visit._id}`,
      title: `${visit.visitType} - ${visit.doctorName}`,
      type: 'appointment',
      date: visit.visitDate,
      time: visit.visitTime || '9:00 AM',
      doctor: visit.doctorName,
      location: visit.location,
      status: visit.status === 'completed' ? 'completed' : 'upcoming',
      color: 'blue',
      notes: visit.notes || `Visit type: ${visit.visitType}${visit.specialty ? `, Specialty: ${visit.specialty}` : ''}`,
      isDoctorVisit: true,
      doctorVisitId: visit._id
    }));

    // Filter out calendar events that are duplicates of doctor visits
    // (when a doctor visit was also saved as a calendar event)
    const filteredCalendarEvents = calendarEvents.filter(calendarEvent => {
      // Check if this calendar event corresponds to a doctor visit
      const isDuplicate = doctorVisits.some(visit => {
        const visitDate = new Date(visit.visitDate).toISOString().split('T')[0];
        const calendarDate = new Date(calendarEvent.date).toISOString().split('T')[0];
        return visitDate === calendarDate && 
               calendarEvent.title.includes(visit.doctorName) &&
               calendarEvent.type === 'appointment';
      });
      
      return !isDuplicate;
    });

    // Combine and sort all events
    const allEvents = [...filteredCalendarEvents, ...doctorVisitEvents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.time.localeCompare(b.time);
    });

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
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
    const { title, type, date, time, doctor, location, status, color, notes } = body;

    // Validate required fields
    if (!title || !type || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const newEvent = new CalendarEvent({
      userId,
      title,
      type,
      date,
      time,
      doctor,
      location,
      status: status || 'upcoming',
      color: color || 'blue',
      notes
    });

    const savedEvent = await newEvent.save();

    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
} 