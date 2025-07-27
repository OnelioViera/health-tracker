import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import DoctorVisit from "@/lib/models/DoctorVisit";
import CalendarEvent from "@/lib/models/CalendarEvent";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if MongoDB is configured
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockDoctorVisit = {
        _id: `mock_${Date.now()}`,
        userId,
        doctorName: body.doctorName,
        specialty: body.specialty,
        visitDate: body.visitDate,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockDoctorVisit, { status: 201 });
    }

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

    const db = await connectDB();
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockData = [
        {
          _id: 'mock_1',
          userId,
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Primary Care',
          visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          visitTime: '10:00 AM',
          visitType: 'checkup',
          symptoms: ['Fatigue', 'Mild headache'],
          diagnosis: 'Common cold',
          treatment: 'Rest and fluids',
          medications: [
            {
              name: 'Acetaminophen',
              dosage: '500mg',
              frequency: 'Every 6 hours as needed',
              duration: '3 days',
              notes: 'For fever and pain',
            }
          ],
          recommendations: ['Get plenty of rest', 'Stay hydrated'],
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          notes: 'Annual physical examination',
          cost: 150,
          insurance: 'Blue Cross Blue Shield',
          location: 'Medical Center',
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'mock_2',
          userId,
          doctorName: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          visitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          visitTime: '2:30 PM',
          visitType: 'consultation',
          symptoms: ['Chest pain', 'Shortness of breath'],
          diagnosis: '',
          treatment: '',
          medications: [],
          recommendations: [],
          followUpDate: null,
          notes: 'Cardiology consultation for chest pain evaluation',
          cost: 250,
          insurance: 'Blue Cross Blue Shield',
          location: 'Heart Institute',
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'mock_3',
          userId,
          doctorName: 'Dr. Emily Rodriguez',
          specialty: 'Dermatology',
          visitDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          visitTime: '11:00 AM',
          visitType: 'follow-up',
          symptoms: ['Skin rash', 'Itching'],
          diagnosis: 'Eczema',
          treatment: 'Topical corticosteroids',
          medications: [
            {
              name: 'Hydrocortisone cream',
              dosage: '1%',
              frequency: 'Twice daily',
              duration: '2 weeks',
              notes: 'Apply to affected areas',
            }
          ],
          recommendations: ['Avoid hot showers', 'Use fragrance-free soap'],
          followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
          notes: 'Follow-up for eczema treatment',
          cost: 180,
          insurance: 'Blue Cross Blue Shield',
          location: 'Dermatology Clinic',
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'mock_4',
          userId,
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Primary Care',
          visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          visitTime: '9:00 AM',
          visitType: 'checkup',
          symptoms: ['Fatigue', 'Mild headache'],
          diagnosis: 'Common cold',
          treatment: 'Rest and fluids',
          medications: [
            {
              name: 'Acetaminophen',
              dosage: '500mg',
              frequency: 'Every 6 hours as needed',
              duration: '3 days',
              notes: 'For fever and pain',
            }
          ],
          recommendations: ['Get plenty of rest', 'Stay hydrated'],
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          notes: 'Annual physical examination',
          cost: 150,
          insurance: 'Blue Cross Blue Shield',
          location: 'Medical Center',
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      return NextResponse.json({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockData.length,
          pages: 1,
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const doctorVisits = await DoctorVisit.find({ userId })
      .sort({ visitDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await DoctorVisit.countDocuments({ userId });

    return NextResponse.json({
      data: doctorVisits,
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