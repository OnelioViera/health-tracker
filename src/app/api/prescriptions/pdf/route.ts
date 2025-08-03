import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Medication from '@/lib/models/Medication';
import { generatePrescriptionPDF } from '@/lib/prescription-pdf-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientName,
      patientInfo,
      doctorInfo,
      pharmacyInfo,
      includeActiveOnly = true,
      includeNotes = true,
      includeSideEffects = true,
      includeInteractions = true
    } = body;

    if (!patientName) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const db = await connectDB();
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockPrescriptions = [
        {
          _id: 'mock_med_1',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once daily',
          timeOfDay: 'morning',
          duration: 'Ongoing',
          startDate: '2024-01-15',
          status: 'active',
          category: 'prescription',
          prescribedBy: 'Dr. Smith',
          pharmacy: 'CVS Pharmacy',
          notes: 'Take with food',
          sideEffects: ['Dizziness', 'Dry cough'],
          interactions: ['Avoid with NSAIDs']
        },
        {
          _id: 'mock_med_2',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          timeOfDay: 'morning',
          duration: 'Ongoing',
          startDate: '2024-02-01',
          status: 'active',
          category: 'prescription',
          prescribedBy: 'Dr. Johnson',
          pharmacy: 'Walgreens',
          notes: 'Take with meals',
          sideEffects: ['Nausea', 'Diarrhea'],
          interactions: ['Avoid alcohol']
        }
      ];

      const pdfBuffer = await generatePrescriptionPDF({
        prescriptions: mockPrescriptions,
        patientName,
        patientInfo,
        doctorInfo,
        pharmacyInfo,
        includeActiveOnly,
        includeNotes,
        includeSideEffects,
        includeInteractions
      });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="prescriptions_${Date.now()}.pdf"`
        }
      });
    }

    // Fetch prescriptions from database
    const prescriptions = await Medication.find({ userId }).sort({ startDate: -1 });

    if (prescriptions.length === 0) {
      return NextResponse.json({ error: "No prescriptions found" }, { status: 404 });
    }

    const pdfBuffer = await generatePrescriptionPDF({
      prescriptions,
      patientName,
      patientInfo,
      doctorInfo,
      pharmacyInfo,
      includeActiveOnly,
      includeNotes,
      includeSideEffects,
      includeInteractions
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prescriptions_${Date.now()}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating prescription PDF:', error);
    return NextResponse.json(
      { error: "Failed to generate prescription PDF" },
      { status: 500 }
    );
  }
} 