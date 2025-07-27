import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import CalendarEvent from '@/lib/models/CalendarEvent';
import DoctorVisit from '@/lib/models/DoctorVisit';

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

    // Check if this is a doctor visit event
    if (id.startsWith('doctor_')) {
      const doctorVisitId = id.replace('doctor_', '');
      
      const event = await DoctorVisit.findOne({ _id: doctorVisitId, userId }).lean() as any;

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Convert to calendar event format
      const calendarEvent = {
        _id: id,
        title: `${event.visitType} - ${event.doctorName}`,
        type: 'appointment',
        date: event.visitDate,
        time: event.visitTime || '9:00 AM',
        doctor: event.doctorName,
        location: event.location,
        status: event.status === 'completed' ? 'completed' : 'upcoming',
        color: 'blue',
        notes: event.notes || `Visit type: ${event.visitType}${event.specialty ? `, Specialty: ${event.specialty}` : ''}`,
        isDoctorVisit: true,
        doctorVisitId: event._id
      };

      return NextResponse.json(calendarEvent);
    } else {
      // Regular calendar event
      const event = await CalendarEvent.findOne({ _id: id, userId }).lean();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(event);
    }
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar event' },
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
    const { title, type, date, time, doctor, location, status, color, notes } = body;

    await connectDB();

    // Check if this is a doctor visit event
    if (id.startsWith('doctor_')) {
      const doctorVisitId = id.replace('doctor_', '');
      
      // Map calendar status to doctor visit status
      let doctorVisitStatus = status;
      if (status === 'upcoming') {
        doctorVisitStatus = 'scheduled';
      } else if (status === 'completed') {
        doctorVisitStatus = 'completed';
      }
      
      // Update the doctor visit
      const updatedDoctorVisit = await DoctorVisit.findOneAndUpdate(
        { _id: doctorVisitId, userId },
        {
          doctorName: doctor,
          visitDate: date,
          visitTime: time,
          location,
          status: doctorVisitStatus,
          notes
        },
        { new: true, runValidators: true }
      );

      if (!updatedDoctorVisit) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Return in calendar event format
      const calendarEvent = {
        _id: id,
        title: `${updatedDoctorVisit.visitType} - ${updatedDoctorVisit.doctorName}`,
        type: 'appointment',
        date: updatedDoctorVisit.visitDate,
        time: updatedDoctorVisit.visitTime || '9:00 AM',
        doctor: updatedDoctorVisit.doctorName,
        location: updatedDoctorVisit.location,
        status: updatedDoctorVisit.status === 'completed' ? 'completed' : 'upcoming',
        color: 'blue',
        notes: updatedDoctorVisit.notes || `Visit type: ${updatedDoctorVisit.visitType}${updatedDoctorVisit.specialty ? `, Specialty: ${updatedDoctorVisit.specialty}` : ''}`,
        isDoctorVisit: true,
        doctorVisitId: updatedDoctorVisit._id
      };

      return NextResponse.json(calendarEvent);
    } else {
      // Regular calendar event
      const updatedEvent = await CalendarEvent.findOneAndUpdate(
        { _id: id, userId },
        {
          title,
          type,
          date,
          time,
          doctor,
          location,
          status,
          color,
          notes
        },
        { new: true, runValidators: true }
      );

      if (!updatedEvent) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(updatedEvent);
    }
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
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

    // Check if this is a doctor visit event
    if (id.startsWith('doctor_')) {
      const doctorVisitId = id.replace('doctor_', '');
      const deletedEvent = await DoctorVisit.findOneAndDelete({ 
        _id: doctorVisitId, 
        userId 
      });

      if (!deletedEvent) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Event deleted successfully' });
    } else {
      // Regular calendar event
      const deletedEvent = await CalendarEvent.findOneAndDelete({ 
        _id: id, 
        userId 
      });

      if (!deletedEvent) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Event deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
} 