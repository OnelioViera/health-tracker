import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/lib/models/UserProfile';

// Mock storage for development
const mockPdfPreferencesStorage = new Map();

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockPreferences = mockPdfPreferencesStorage.get(userId) || {
        patientName: '',
        patientInfo: {
          dateOfBirth: '',
          address: '',
          phone: '',
          email: '',
        },
        doctorInfo: {
          name: '',
          license: '',
          specialty: '',
          phone: '',
          address: '',
        },
        pharmacyInfo: {
          name: '',
          address: '',
          phone: '',
        },
        includeActiveOnly: true,
        includeNotes: true,
        includeSideEffects: true,
        includeInteractions: true,
      };
      
      return NextResponse.json(mockPreferences);
    }

    const userProfile = await UserProfile.findOne({ userId });
    
    if (!userProfile || !userProfile.preferences?.pdfPreferences) {
      return NextResponse.json({
        patientName: '',
        patientInfo: {
          dateOfBirth: '',
          address: '',
          phone: '',
          email: '',
        },
        doctorInfo: {
          name: '',
          license: '',
          specialty: '',
          phone: '',
          address: '',
        },
        pharmacyInfo: {
          name: '',
          address: '',
          phone: '',
        },
        includeActiveOnly: true,
        includeNotes: true,
        includeSideEffects: true,
        includeInteractions: true,
      });
    }

    return NextResponse.json(userProfile.preferences.pdfPreferences);
  } catch (error) {
    console.error('Error fetching PDF preferences:', error);
    return NextResponse.json(
      { error: "Failed to fetch PDF preferences" },
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

    const pdfPreferences = await request.json();
    const db = await connectDB();
    
    // If using mock connection, save to mock storage
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      mockPdfPreferencesStorage.set(userId, pdfPreferences);
      
      return NextResponse.json({
        success: true,
        message: "PDF preferences saved successfully",
        preferences: pdfPreferences
      });
    }

    // Find and update user profile
    const userProfile = await UserProfile.findOne({ userId });
    
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Initialize preferences if they don't exist
    if (!userProfile.preferences) {
      userProfile.preferences = {};
    }
    if (!userProfile.preferences.pdfPreferences) {
      userProfile.preferences.pdfPreferences = {};
    }

    // Update PDF preferences
    userProfile.preferences.pdfPreferences = {
      patientName: pdfPreferences.patientName || '',
      patientInfo: {
        dateOfBirth: pdfPreferences.patientInfo?.dateOfBirth || '',
        address: pdfPreferences.patientInfo?.address || '',
        phone: pdfPreferences.patientInfo?.phone || '',
        email: pdfPreferences.patientInfo?.email || '',
      },
      doctorInfo: {
        name: pdfPreferences.doctorInfo?.name || '',
        license: pdfPreferences.doctorInfo?.license || '',
        specialty: pdfPreferences.doctorInfo?.specialty || '',
        phone: pdfPreferences.doctorInfo?.phone || '',
        address: pdfPreferences.doctorInfo?.address || '',
      },
      pharmacyInfo: {
        name: pdfPreferences.pharmacyInfo?.name || '',
        address: pdfPreferences.pharmacyInfo?.address || '',
        phone: pdfPreferences.pharmacyInfo?.phone || '',
      },
      includeActiveOnly: pdfPreferences.includeActiveOnly ?? true,
      includeNotes: pdfPreferences.includeNotes ?? true,
      includeSideEffects: pdfPreferences.includeSideEffects ?? true,
      includeInteractions: pdfPreferences.includeInteractions ?? true,
    };

    await userProfile.save();

    return NextResponse.json({
      success: true,
      message: "PDF preferences saved successfully",
      preferences: userProfile.preferences.pdfPreferences
    });
  } catch (error) {
    console.error('Error saving PDF preferences:', error);
    return NextResponse.json(
      { error: "Failed to save PDF preferences" },
      { status: 500 }
    );
  }
} 