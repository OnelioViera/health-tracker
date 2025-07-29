import { sendEmail } from './email-service';

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface NotificationData {
  title: string;
  message: string;
  type: 'blood_pressure_reminder' | 'health_alert' | 'general';
  userId: string;
  userEmail?: string;
  userPhone?: string;
}

export class NotificationService {
  private static convert12HourTo24Hour(time12Hour: string): { hour: number; minute: number } {
    // Clean up the time string - remove any extra spaces or characters
    const cleanedTime = time12Hour.trim().replace(/\s+/g, ' ');
    
    // Handle the specific malformed case "05:08 00" by extracting just the time part
    const malformedMatch = cleanedTime.match(/^(\d{1,2}):(\d{2})\s+(\d{2})$/);
    if (malformedMatch) {
      const hour = parseInt(malformedMatch[1]);
      const minute = parseInt(malformedMatch[2]);
      console.log('Handled malformed time format:', time12Hour, '->', { hour, minute });
      return { hour, minute };
    }
    
    // Handle formats like "10:00 PM", "8:00 AM", "10:30 PM", "8:30 AM"
    const match = cleanedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) {
      // If the time doesn't match 12-hour format, try to parse it as 24-hour format
      const time24Match = cleanedTime.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        const hour = parseInt(time24Match[1]);
        const minute = parseInt(time24Match[2]);
        return { hour, minute };
      }
      // If neither format works, throw a more descriptive error
      console.error('Invalid time format received:', time12Hour, 'cleaned:', cleanedTime);
      throw new Error(`Invalid time format: ${time12Hour}. Expected format: "HH:MM AM/PM" or "HH:MM"`);
    }
    
    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return { hour, minute };
  }

  private static isInQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHours) return false;

    console.log('Checking quiet hours with settings:', settings);

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Convert 12-hour format to 24-hour format for comparison
    const startTime = this.convert12HourTo24Hour(settings.quietHoursStart);
    const endTime = this.convert12HourTo24Hour(settings.quietHoursEnd);
    
    const startMinutes = startTime.hour * 60 + startTime.minute;
    const endMinutes = endTime.hour * 60 + endTime.minute;
    
    console.log('Quiet hours check:', {
      currentTime: `${now.getHours()}:${now.getMinutes()}`,
      startTime: `${startTime.hour}:${startTime.minute}`,
      endTime: `${endTime.hour}:${endTime.minute}`,
      startMinutes,
      endMinutes
    });
    
    // Handle overnight quiet hours (e.g., 10:00 PM to 8:00 AM)
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    } else {
      return currentTime >= startMinutes && currentTime <= endMinutes;
    }
  }

  static async sendNotification(
    data: NotificationData,
    settings: NotificationSettings
  ): Promise<{ success: boolean; message: string; sentTo: string[] }> {
    const sentTo: string[] = [];
    const errors: string[] = [];

    // Check quiet hours
    if (this.isInQuietHours(settings)) {
      return {
        success: true,
        message: 'Notification suppressed due to quiet hours',
        sentTo: []
      };
    }

    // Send push notification
    if (settings.pushNotifications) {
      try {
        await this.sendPushNotification(data);
        sentTo.push('push');
      } catch (error) {
        errors.push(`Push notification failed: ${error}`);
      }
    }

    // Send email notification
    if (settings.emailNotifications && data.userEmail) {
      try {
        await this.sendEmailNotification(data);
        sentTo.push('email');
      } catch (error) {
        errors.push(`Email notification failed: ${error}`);
      }
    }

    // Send SMS notification
    if (settings.smsNotifications && data.userPhone) {
      try {
        await this.sendSMSNotification(data);
        sentTo.push('sms');
      } catch (error) {
        errors.push(`SMS notification failed: ${error}`);
      }
    }

    if (sentTo.length === 0) {
      return {
        success: false,
        message: `No notifications sent. Errors: ${errors.join(', ')}`,
        sentTo: []
      };
    }

    return {
      success: true,
      message: `Notifications sent successfully to: ${sentTo.join(', ')}`,
      sentTo
    };
  }

  private static async sendPushNotification(data: NotificationData): Promise<void> {
    // This would integrate with a push notification service like Firebase Cloud Messaging
    // For now, we'll simulate the functionality
    console.log('Push notification sent:', {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type
    });
    
    // In a real implementation, you would:
    // 1. Get the user's FCM token from the database
    // 2. Send the notification via Firebase Admin SDK
    // 3. Handle delivery status
  }

  private static async sendEmailNotification(data: NotificationData): Promise<void> {
    if (!data.userEmail) {
      throw new Error('User email not provided');
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${data.title}</h2>
        <p style="color: #374151; line-height: 1.6;">${data.message}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            This is an automated notification from MyHealthFirst. 
            You can manage your notification preferences in your account settings.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: data.userEmail,
      subject: data.title,
      html: emailContent
    });
  }

  private static async sendSMSNotification(data: NotificationData): Promise<void> {
    if (!data.userPhone) {
      throw new Error('User phone not provided');
    }

    // This would integrate with an SMS service like Twilio
    // For now, we'll simulate the functionality
    console.log('SMS notification sent:', {
      phone: data.userPhone,
      message: `${data.title}: ${data.message}`
    });
    
    // In a real implementation, you would:
    // 1. Use Twilio SDK to send SMS
    // 2. Handle delivery status
    // 3. Log the message for compliance
  }

  static async sendBloodPressureReminder(
    userId: string,
    userEmail: string,
    userPhone: string,
    settings: NotificationSettings,
    reminderData: {
      title: string;
      message: string;
      scheduledTime: string;
    }
  ): Promise<{ success: boolean; message: string; sentTo: string[] }> {
    const notificationData: NotificationData = {
      title: reminderData.title,
      message: reminderData.message,
      type: 'blood_pressure_reminder',
      userId,
      userEmail,
      userPhone
    };

    return this.sendNotification(notificationData, settings);
  }

  static async sendHealthAlert(
    userId: string,
    userEmail: string,
    userPhone: string,
    settings: NotificationSettings,
    alertData: {
      title: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }
  ): Promise<{ success: boolean; message: string; sentTo: string[] }> {
    const notificationData: NotificationData = {
      title: `Health Alert: ${alertData.title}`,
      message: alertData.message,
      type: 'health_alert',
      userId,
      userEmail,
      userPhone
    };

    // For health alerts, we might want to override quiet hours
    const alertSettings = { ...settings };
    if (alertData.severity === 'high') {
      alertSettings.quietHours = false;
    }

    return this.sendNotification(notificationData, alertSettings);
  }
} 