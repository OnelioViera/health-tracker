import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import UserProfile from "@/lib/models/UserProfile";
import { NotificationService } from "@/lib/notification-service";

interface Reminder {
  _id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'custom';
  time: string;
  days: string[];
  isActive: boolean;
  message: string;
  notificationType: 'push' | 'email' | 'sms';
  createdAt: string;
  userId: string;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    
    // For now, return mock reminders
    // In a real implementation, you would store reminders in the database
    const mockReminders: Reminder[] = [
      {
        _id: '1',
        userId,
        title: 'Morning Blood Pressure Check',
        frequency: 'daily',
        time: '08:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        isActive: true,
        message: 'Time to check your blood pressure!',
        notificationType: 'push',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        userId,
        title: 'Evening Blood Pressure Check',
        frequency: 'daily',
        time: '20:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        isActive: true,
        message: 'Evening blood pressure check time!',
        notificationType: 'push',
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        userId,
        title: 'Weekly Blood Pressure Review',
        frequency: 'weekly',
        time: '10:00',
        days: ['sunday'],
        isActive: false,
        message: 'Weekly blood pressure review and analysis',
        notificationType: 'email',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ reminders: mockReminders });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
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

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, message, frequency, time, days, notificationType, isActive } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const db = await connectDB();
    
    // Get user profile for notification settings
    const userProfile = await UserProfile.findOne({ userId });
    
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Get notification settings from user profile
    const notificationSettings = userProfile.preferences?.notifications?.bloodPressure || {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      quietHours: false,
      quietHoursStart: '10:00 PM',
      quietHoursEnd: '8:00 AM'
    };

    // Create new reminder
    const newReminder: Reminder = {
      _id: Date.now().toString(),
      userId,
      title,
      message,
      frequency: frequency || 'daily',
      time: time || '08:00 AM',
      days: days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: isActive !== false,
      notificationType: notificationType || 'push',
      createdAt: new Date().toISOString()
    };

    // If reminder is active, send a test notification
    if (newReminder.isActive) {
      // Send immediate notification for new active reminder
      await NotificationService.sendNotification(
        {
          title: `Reminder Created: ${newReminder.title}`,
          message: `Your reminder "${newReminder.title}" has been created and is now active.`,
          type: 'blood_pressure_reminder',
          userId,
          userEmail: userProfile.email,
          userPhone: userProfile.phone
        },
        notificationSettings
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminder created successfully",
      reminder: newReminder
    });

  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
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
    const { reminderId, updates } = body;

    if (!reminderId) {
      return NextResponse.json({ error: "Reminder ID is required" }, { status: 400 });
    }

    // In a real implementation, you would update the reminder in the database
    // For now, we'll simulate the update
    const updatedReminder = {
      _id: reminderId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Reminder updated successfully",
      reminder: updatedReminder
    });

  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('id');

    if (!reminderId) {
      return NextResponse.json({ error: "Reminder ID is required" }, { status: 400 });
    }

    // In a real implementation, you would delete the reminder from the database
    // For now, we'll simulate the deletion

    return NextResponse.json({
      success: true,
      message: "Reminder deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
} 