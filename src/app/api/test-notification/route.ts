import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import UserProfile from "@/lib/models/UserProfile";
import { NotificationService } from "@/lib/notification-service";

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
    const { title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const db = await connectDB();
    
    // Get user profile for notification settings and contact info
    let userProfile = await UserProfile.findOne({ userId });
    
    // If user profile doesn't exist, create one with default settings
    if (!userProfile) {
      console.log('Creating new user profile for test notification:', userId);
      userProfile = new UserProfile({
        userId,
        firstName: user.firstName || 'User',
        lastName: user.lastName || 'User', // Provide default lastName
        email: user.emailAddresses[0]?.emailAddress || '',
        preferences: {
          healthDataSharing: false,
          notifications: {
            email: true,
            push: false,
            reminders: true,
            bloodPressure: {
              pushNotifications: true,
              emailNotifications: true,
              smsNotifications: false,
              quietHours: false,
              quietHoursStart: '10:00 PM',
              quietHoursEnd: '8:00 AM'
            }
          }
        }
      });
      await userProfile.save();
    }

    // Get notification settings
    const notificationSettings = userProfile.preferences?.notifications?.bloodPressure || {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      quietHours: false,
      quietHoursStart: '10:00 PM',
      quietHoursEnd: '8:00 AM'
    };

    console.log('Notification settings retrieved:', notificationSettings);
    console.log('User profile preferences:', userProfile.preferences);

    // Send test notification
    const result = await NotificationService.sendNotification(
      {
        title,
        message,
        type: type || 'blood_pressure_reminder',
        userId,
        userEmail: userProfile.email,
        userPhone: userProfile.phone
      },
      notificationSettings
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      sentTo: result.sentTo
    });

  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
} 