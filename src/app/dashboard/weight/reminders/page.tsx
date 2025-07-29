"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Clock, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Save,
  Scale
} from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

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
}

type FrequencyType = 'daily' | 'weekly' | 'custom';
type NotificationType = 'push' | 'email' | 'sms';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export default function WeightRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Partial<Reminder>>({});
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    quietHours: false,
    quietHoursStart: '10:00 PM',
    quietHoursEnd: '8:00 AM'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Helper functions for time format conversion
  const convert24HourTo12Hour = (time24Hour: string): string => {
    const [hours, minutes] = time24Hour.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const convert12HourTo24Hour = (time12Hour: string): string => {
    const match = time12Hour.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return time12Hour; // Return as-is if not in expected format
    
    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Load notification settings from API
  const loadNotificationSettings = async () => {
    try {
      const response = await fetch('/api/notification-settings');
      if (response.ok) {
        const settings = await response.json();
        setNotificationSettings(settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  // Save notification settings to API
  const saveNotificationSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationSettings),
      });

      if (response.ok) {
        toast.success('Notification settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Test notification
  const testNotification = async () => {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'weight_reminder',
          title: 'Test Weight Reminder',
          message: 'This is a test notification to verify your settings are working correctly.',
        }),
      });

      if (response.ok) {
        toast.success('Test notification sent successfully');
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  // Load reminders from localStorage
  useEffect(() => {
    const loadReminders = () => {
      try {
        const stored = localStorage.getItem('weight-reminders');
        if (stored) {
          setReminders(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
    loadNotificationSettings();
  }, []);

  // Save reminders to localStorage
  const saveRemindersToStorage = (updatedReminders: Reminder[]) => {
    try {
      localStorage.setItem('weight-reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  // Create new reminder
  const handleCreateReminder = () => {
    setEditingReminder({
      title: '',
      frequency: 'daily',
      time: '08:00 AM',
      days: [],
      isActive: true,
      message: '',
      notificationType: 'push'
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Edit reminder
  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Delete reminder
  const handleDeleteReminder = (reminderId: string) => {
    const updatedReminders = reminders.filter(r => r._id !== reminderId);
    setReminders(updatedReminders);
    saveRemindersToStorage(updatedReminders);
    toast.success('Reminder deleted successfully');
  };

  // Toggle reminder active status
  const handleToggleReminder = (reminderId: string) => {
    const updatedReminders = reminders.map(r => 
      r._id === reminderId ? { ...r, isActive: !r.isActive } : r
    );
    setReminders(updatedReminders);
    saveRemindersToStorage(updatedReminders);
    toast.success('Reminder status updated');
  };

  // Save reminder
  const handleSaveReminder = () => {
    if (!editingReminder.title || !editingReminder.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newReminder: Reminder = {
      _id: isEditMode ? editingReminder._id! : Date.now().toString(),
      title: editingReminder.title!,
      frequency: editingReminder.frequency || 'daily',
      time: editingReminder.time || '08:00 AM',
      days: editingReminder.days || [],
      isActive: editingReminder.isActive !== false,
      message: editingReminder.message!,
      notificationType: editingReminder.notificationType || 'push',
      createdAt: isEditMode ? editingReminder.createdAt! : new Date().toISOString()
    };

    if (isEditMode) {
      const updatedReminders = reminders.map(r => 
        r._id === newReminder._id ? newReminder : r
      );
      setReminders(updatedReminders);
      saveRemindersToStorage(updatedReminders);
      toast.success('Reminder updated successfully');
    } else {
      const updatedReminders = [newReminder, ...reminders];
      setReminders(updatedReminders);
      saveRemindersToStorage(updatedReminders);
      toast.success('Reminder created successfully');
    }

    setIsModalOpen(false);
    setEditingReminder({});
  };

  // Helper functions
  const getFrequencyText = (frequency: string, days: string[]) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'custom': return `Custom (${days.join(', ')})`;
      default: return frequency;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'push': return <Smartphone className="h-6 w-6 text-blue-500" />;
      case 'email': return <Mail className="h-6 w-6 text-green-500" />;
      case 'sms': return <MessageSquare className="h-6 w-6 text-purple-500" />;
      default: return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const createTimePickerOptions = (type: 'hour' | 'minute' | 'period') => {
    switch (type) {
      case 'hour':
        return Array.from({ length: 12 }, (_, i) => ({
          value: (i + 1).toString().padStart(2, '0'),
          label: (i + 1).toString()
        }));
      case 'minute':
        return Array.from({ length: 60 }, (_, i) => ({
          value: i.toString().padStart(2, '0'),
          label: i.toString().padStart(2, '0')
        }));
      case 'period':
        return [
          { value: 'AM', label: 'AM' },
          { value: 'PM', label: 'PM' }
        ];
    }
  };

  const activeReminders = reminders.filter(r => r.isActive);
  const inactiveReminders = reminders.filter(r => !r.isActive);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Weight Reminders</h1>
              <p className="text-gray-600">Configure your weight check reminders</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading reminders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weight Reminders</h1>
            <p className="text-gray-600">Configure your weight check reminders</p>
          </div>
        </div>
        <Button onClick={handleCreateReminder}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured reminders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReminders.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Reminder</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">08:00</div>
            <p className="text-xs text-muted-foreground">
              Tomorrow morning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notification Types</CardTitle>
            <Settings className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Push, Email, SMS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Active Reminders</span>
          </CardTitle>
          <CardDescription>
            Reminders that are currently active and sending notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeReminders.length > 0 ? (
            <div className="space-y-4">
              {activeReminders.map((reminder) => (
                <div key={reminder._id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      {getNotificationIcon(reminder.notificationType)}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{reminder.title}</p>
                      <p className="text-sm text-gray-600">
                        {getFrequencyText(reminder.frequency, reminder.days)} at {reminder.time}
                      </p>
                      <p className="text-xs text-gray-500">{reminder.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">
                      Active
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditReminder(reminder)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleReminder(reminder._id)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReminder(reminder._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No active reminders</p>
              <Button onClick={handleCreateReminder} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Reminder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Reminders */}
      {inactiveReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <span>Inactive Reminders</span>
            </CardTitle>
            <CardDescription>
              Reminders that are currently disabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveReminders.map((reminder) => (
                <div key={reminder._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getNotificationIcon(reminder.notificationType)}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{reminder.title}</p>
                      <p className="text-sm text-gray-600">
                        {getFrequencyText(reminder.frequency, reminder.days)} at {reminder.time}
                      </p>
                      <p className="text-xs text-gray-500">{reminder.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      Inactive
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditReminder(reminder)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleReminder(reminder._id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReminder(reminder._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
          <CardDescription>
            Configure how you receive reminder notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications on your device</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive reminders via email</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive text message reminders</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">Quiet Hours</h4>
                  <p className="text-sm text-gray-600">Pause notifications during specific hours</p>
                </div>
                <Switch
                  checked={notificationSettings.quietHours}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, quietHours: checked }))}
                />
              </div>
              
              {notificationSettings.quietHours && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="text-sm text-gray-600 mb-3">
                    Notifications will be paused during these hours
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="quietStart" className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Start Time</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={notificationSettings.quietHoursStart ? notificationSettings.quietHoursStart.split(':')[0] : '10'}
                          onValueChange={(hour) => {
                            const currentTime = notificationSettings.quietHoursStart || '10:00 PM';
                            const [_, minute, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['', '00', 'PM'];
                            setNotificationSettings(prev => ({ ...prev, quietHoursStart: `${hour}:${minute} ${period}` }));
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {createTimePickerOptions('hour').map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center text-gray-500">:</span>
                        <Select 
                          value={notificationSettings.quietHoursStart ? notificationSettings.quietHoursStart.split(':')[1]?.split(' ')[0] : '00'}
                          onValueChange={(minute) => {
                            const currentTime = notificationSettings.quietHoursStart || '10:00 PM';
                            const [hour, _, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['10', '00', 'PM'];
                            setNotificationSettings(prev => ({ ...prev, quietHoursStart: `${hour}:${minute} ${period}` }));
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {createTimePickerOptions('minute').map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={notificationSettings.quietHoursStart ? notificationSettings.quietHoursStart.split(' ')[1] : 'PM'}
                          onValueChange={(period) => {
                            const currentTime = notificationSettings.quietHoursStart || '10:00 PM';
                            const [hour, minute] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['10', '00'];
                            setNotificationSettings(prev => ({ ...prev, quietHoursStart: `${hour}:${minute} ${period}` }));
                          }}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {createTimePickerOptions('period').map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietEnd" className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>End Time</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={notificationSettings.quietHoursEnd ? notificationSettings.quietHoursEnd.split(':')[0] : '08'}
                          onValueChange={(hour) => {
                            const currentTime = notificationSettings.quietHoursEnd || '8:00 AM';
                            const [_, minute, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['', '00', 'AM'];
                            setNotificationSettings(prev => ({ ...prev, quietHoursEnd: `${hour}:${minute} ${period}` }));
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {createTimePickerOptions('hour').map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center text-gray-500">:</span>
                        <Select 
                          value={notificationSettings.quietHoursEnd ? notificationSettings.quietHoursEnd.split(':')[1]?.split(' ')[0] : '00'}
                          onValueChange={(minute) => {
                            const currentTime = notificationSettings.quietHoursEnd || '8:00 AM';
                            const [hour, _, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['08', '00', 'AM'];
                            setNotificationSettings(prev => ({ ...prev, quietHoursEnd: `${hour}:${minute} ${period}` }));
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {createTimePickerOptions('minute').map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={notificationSettings.quietHoursEnd ? notificationSettings.quietHoursEnd.split(' ')[1] : 'AM'}
                          onValueChange={(period) => {
                            const currentTime = notificationSettings.quietHoursEnd || '8:00 AM';
                            const [hour, minute] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['08', '00'];
                            setNotificationSettings(prev => ({ ...prev, quietHoursEnd: `${hour}:${minute} ${period}` }));
                          }}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {createTimePickerOptions('period').map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Settings and Test Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button 
                onClick={saveNotificationSettings}
                disabled={savingSettings}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button 
                variant="outline"
                onClick={testNotification}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>{isEditMode ? 'Edit Reminder' : 'Create Reminder'}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Reminder Title</Label>
              <Input
                id="title"
                value={editingReminder.title || ''}
                onChange={(e) => setEditingReminder({ ...editingReminder, title: e.target.value })}
                placeholder="e.g., Morning Weight Check"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={editingReminder.message || ''}
                onChange={(e) => setEditingReminder({ ...editingReminder, message: e.target.value })}
                placeholder="e.g., Time to check your weight!"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={editingReminder.frequency || 'daily'} 
                  onValueChange={(value) => setEditingReminder({ ...editingReminder, frequency: value as FrequencyType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={editingReminder.time ? editingReminder.time.split(':')[0] : '08'}
                    onValueChange={(hour) => {
                      const currentTime = editingReminder.time || '08:00 AM';
                      const [_, minute, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['', '00', 'AM'];
                      setEditingReminder({ ...editingReminder, time: `${hour}:${minute} ${period}` });
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {createTimePickerOptions('hour').map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center text-gray-500">:</span>
                  <Select 
                    value={editingReminder.time ? editingReminder.time.split(':')[1]?.split(' ')[0] : '00'}
                    onValueChange={(minute) => {
                      const currentTime = editingReminder.time || '08:00 AM';
                      const [hour, _, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['08', '00', 'AM'];
                      setEditingReminder({ ...editingReminder, time: `${hour}:${minute} ${period}` });
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {createTimePickerOptions('minute').map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={editingReminder.time ? editingReminder.time.split(' ')[1] : 'AM'}
                    onValueChange={(period) => {
                      const currentTime = editingReminder.time || '08:00 AM';
                      const [hour, minute] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['08', '00'];
                      setEditingReminder({ ...editingReminder, time: `${hour}:${minute} ${period}` });
                    }}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {createTimePickerOptions('period').map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notificationType">Notification Type</Label>
              <Select 
                value={editingReminder.notificationType || 'push'} 
                onValueChange={(value) => setEditingReminder({ ...editingReminder, notificationType: value as NotificationType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={editingReminder.isActive !== false}
                onCheckedChange={(checked) => setEditingReminder({ ...editingReminder, isActive: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            
            <div className="flex space-x-2 pt-4 border-t">
              <Button onClick={handleSaveReminder} className="flex-1">
                {isEditMode ? 'Update Reminder' : 'Create Reminder'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 