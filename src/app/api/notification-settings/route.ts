import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import UserProfile from "@/lib/models/UserProfile";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const db = await connectDB();
    
    // If using mock connection, return default settings
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      return NextResponse.json({
        success: true,
        settings: {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          quietHours: false,
          quietHoursStart: '10:00 PM',
          quietHoursEnd: '8:00 AM'
        }
      });
    }

    let userProfile = await UserProfile.findOne({ userId });
    
    // If user profile doesn't exist, create one with default settings
    if (!userProfile) {
      console.log('Creating new user profile for:', userId);
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

    const notificationSettings = userProfile.preferences?.notifications?.bloodPressure || {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      quietHours: false,
      quietHoursStart: '10:00 PM',
      quietHoursEnd: '8:00 AM'
    };

    return NextResponse.json(notificationSettings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      pushNotifications,
      emailNotifications,
      smsNotifications,
      quietHours,
      quietHoursStart,
      quietHoursEnd
    } = body;

    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      return NextResponse.json({
        success: true,
        message: "Notification settings updated successfully",
        settings: {
          pushNotifications,
          emailNotifications,
          smsNotifications,
          quietHours,
          quietHoursStart: quietHoursStart || '10:00 PM',
          quietHoursEnd: quietHoursEnd || '8:00 AM'
        }
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
    if (!userProfile.preferences.notifications) {
      userProfile.preferences.notifications = {};
    }
    if (!userProfile.preferences.notifications.bloodPressure) {
      userProfile.preferences.notifications.bloodPressure = {};
    }

    // Update notification settings
    userProfile.preferences.notifications.bloodPressure = {
      pushNotifications: pushNotifications ?? true,
      emailNotifications: emailNotifications ?? true,
      smsNotifications: smsNotifications ?? false,
      quietHours: quietHours ?? false,
      quietHoursStart: quietHoursStart ?? '10:00 PM',
      quietHoursEnd: quietHoursEnd ?? '8:00 AM'
    };

    await userProfile.save();

    return NextResponse.json({
      success: true,
      message: "Notification settings updated successfully",
      settings: userProfile.preferences.notifications.bloodPressure
    });

  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
} 