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
  MessageSquare
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

export default function BloodPressureRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Partial<Reminder>>({});
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  });

  // Mock reminders data (in a real app, this would come from an API)
  const mockReminders: Reminder[] = [
    {
      _id: '1',
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
      title: 'Evening Blood Pressure Check',
      frequency: 'daily',
      time: '20:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: true,
      message: 'Evening blood pressure reading time',
      notificationType: 'push',
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      title: 'Weekly Review Reminder',
      frequency: 'weekly',
      time: '10:00',
      days: ['sunday'],
      isActive: false,
      message: 'Review your blood pressure trends this week',
      notificationType: 'email',
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReminders(mockReminders);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateReminder = () => {
    setEditingReminder({
      title: '',
      frequency: 'daily',
      time: '08:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: true,
      message: '',
      notificationType: 'push'
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r._id !== reminderId));
    toast.success('Reminder deleted successfully');
  };

  const handleToggleReminder = (reminderId: string) => {
    setReminders(prev => prev.map(r => 
      r._id === reminderId ? { ...r, isActive: !r.isActive } : r
    ));
    toast.success('Reminder status updated');
  };

  const handleSaveReminder = () => {
    if (!editingReminder.title || !editingReminder.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditMode) {
      setReminders(prev => prev.map(r => 
        r._id === editingReminder._id ? { ...r, ...editingReminder } as Reminder : r
      ));
      toast.success('Reminder updated successfully');
    } else {
      const newReminder: Reminder = {
        ...editingReminder as Reminder,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setReminders(prev => [...prev, newReminder]);
      toast.success('Reminder created successfully');
    }

    setIsModalOpen(false);
    setEditingReminder({});
  };

  const getFrequencyText = (frequency: string, days: string[]) => {
    if (frequency === 'daily') return 'Daily';
    if (frequency === 'weekly') return 'Weekly';
    if (frequency === 'custom') {
      const dayNames = {
        monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', 
        thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
      };
      return days.map(day => dayNames[day as keyof typeof dayNames]).join(', ');
    }
    return 'Custom';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const activeReminders = reminders.filter(r => r.isActive);
  const inactiveReminders = reminders.filter(r => !r.isActive);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Pressure Reminders</h1>
            <p className="text-gray-600">Configure your blood pressure check reminders</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Blood Pressure Reminders</h1>
            <p className="text-gray-600">Configure your blood pressure check reminders</p>
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
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quietStart">Start Time</Label>
                    <Input
                      id="quietStart"
                      type="time"
                      value={notificationSettings.quietHoursStart}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quietEnd">End Time</Label>
                    <Input
                      id="quietEnd"
                      type="time"
                      value={notificationSettings.quietHoursEnd}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                    />
                  </div>
                </div>
              )}
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
                placeholder="e.g., Morning Blood Pressure Check"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={editingReminder.message || ''}
                onChange={(e) => setEditingReminder({ ...editingReminder, message: e.target.value })}
                placeholder="e.g., Time to check your blood pressure!"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={editingReminder.frequency || 'daily'} 
                  onValueChange={(value) => setEditingReminder({ ...editingReminder, frequency: value as any })}
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
                <Input
                  id="time"
                  type="time"
                  value={editingReminder.time || '08:00'}
                  onChange={(e) => setEditingReminder({ ...editingReminder, time: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notificationType">Notification Type</Label>
              <Select 
                value={editingReminder.notificationType || 'push'} 
                onValueChange={(value) => setEditingReminder({ ...editingReminder, notificationType: value as any })}
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