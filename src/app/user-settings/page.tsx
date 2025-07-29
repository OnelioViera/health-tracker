"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Database,
  ArrowLeft,
  Download,
  Trash2,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "@/components/back-button";
import { toast } from "sonner";

export default function UserSettingsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    updates: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    dataSharing: false,
    analytics: true,
  });

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security settings</p>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <div>
                      <h4 className="font-medium">Health Reminders</h4>
                      <p className="text-sm text-gray-600">Get reminded about health checkups</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">App Updates</h4>
                      <p className="text-sm text-gray-600">Receive app update notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, updates: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <CardDescription>
                  Control your privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-gray-600">Who can see your profile</p>
                    </div>
                  </div>
                  <select 
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-gray-600">Allow data sharing for research</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.dataSharing}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, dataSharing: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Palette className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Analytics</h4>
                      <p className="text-sm text-gray-600">Help improve the app with analytics</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your health data and account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-gray-600">Download your health data</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Trash2 className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-gray-600">Permanently delete your account</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Type</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <span className="text-sm text-gray-600">2.3 MB / 100 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Login</span>
                  <span className="text-sm text-gray-600">Today</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Important</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  Your health data is encrypted and stored securely. We never share your personal health information with third parties without your explicit consent.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
} 