import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import BloodPressure from "@/lib/models/BloodPressure";
import BloodWork from "@/lib/models/BloodWork";
import DoctorVisit from "@/lib/models/DoctorVisit";
import Weight from "@/lib/models/Weight";
import UserProfile from "@/lib/models/UserProfile";
import { sendHealthDataSharingNotification } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { recipientEmail, recipientName, dataTypes, expiresInDays = 30 } = body;

    if (!recipientEmail || !recipientName || !dataTypes || dataTypes.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await connectDB();
    
    // Fetch user profile for patient information
    const userProfile = await UserProfile.findOne({ userId });
    const patientName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : user.firstName || 'Patient';

    // Fetch health data based on selected types
    const sharedData: Record<string, unknown[]> = {};
    let totalRecords = 0;

    if (dataTypes.includes('bloodPressure')) {
      const bloodPressureData = await BloodPressure.find({ userId }).sort({ date: -1 }).limit(50).lean();
      sharedData.bloodPressure = bloodPressureData;
      totalRecords += bloodPressureData.length;
    }

    if (dataTypes.includes('bloodWork')) {
      const bloodWorkData = await BloodWork.find({ userId }).sort({ testDate: -1 }).limit(50).lean();
      sharedData.bloodWork = bloodWorkData;
      totalRecords += bloodWorkData.length;
    }

    if (dataTypes.includes('weight')) {
      const weightData = await Weight.find({ userId }).sort({ date: -1 }).limit(50).lean();
      sharedData.weight = weightData;
      totalRecords += weightData.length;
    }

    if (dataTypes.includes('doctorVisits')) {
      const doctorVisitsData = await DoctorVisit.find({ userId }).sort({ visitDate: -1 }).limit(50).lean();
      sharedData.doctorVisits = doctorVisitsData;
      totalRecords += doctorVisitsData.length;
    }

    if (totalRecords === 0) {
      return NextResponse.json({ error: "No health data found to share" }, { status: 404 });
    }

    // Send email with health data
    const emailResult = await sendHealthDataSharingNotification(
      recipientEmail,
      recipientName,
      dataTypes,
      sharedData,
      expiresInDays,
      patientName,
      userProfile?.birthdate,
      userProfile?.address
    );

    if (!emailResult.success) {
      return NextResponse.json({ 
        error: "Failed to send email", 
        details: emailResult.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Health data shared successfully",
      recipientEmail,
      recipientName,
      dataTypes,
      totalRecords,
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Error sharing health data:', error);
    return NextResponse.json(
      { error: "Failed to share health data" },
      { status: 500 }
    );
  }
} 