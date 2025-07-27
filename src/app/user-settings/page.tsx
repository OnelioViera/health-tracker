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
  AlertTriangle,
  Key,
  Mountain,
  CheckCircle,
  XCircle
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

  // API Key Management State
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInfo, setApiKeyInfo] = useState<{
    hasApiKey: boolean;
    apiKeyMasked: string | null;
    lastUpdated: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key info on component mount
  useEffect(() => {
    if (isLoaded && user) {
      loadApiKeyInfo();
    }
  }, [isLoaded, user]);

  const loadApiKeyInfo = async () => {
    try {
      const response = await fetch('/api/user-api-key');
      if (response.ok) {
        const data = await response.json();
        setApiKeyInfo(data);
      }
    } catch (error) {
      console.error('Error loading API key info:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeyInfo(data);
        setApiKey("");
        setShowApiKey(false);
        toast.success('API key saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save API key');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user-api-key', {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeyInfo({ hasApiKey: false, apiKeyMasked: null, lastUpdated: null });
        setApiKey("");
        setShowApiKey(false);
        toast.success('API key deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* API Key Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Hiking Journal API Key</span>
                </CardTitle>
                <CardDescription>
                  Connect your Hiking Journal app to sync exercise data automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKeyInfo?.hasApiKey ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <h4 className="font-medium text-green-800">API Key Configured</h4>
                          <p className="text-sm text-green-600">
                            {apiKeyInfo.apiKeyMasked} • Last updated: {apiKeyInfo.lastUpdated ? new Date(apiKeyInfo.lastUpdated).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        {showApiKey ? 'Hide' : 'View'} Key
                      </Button>
                    </div>
                    
                    {showApiKey && (
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <Label htmlFor="current-api-key" className="text-sm font-medium text-gray-700">
                          Current API Key
                        </Label>
                        <div className="mt-2 flex items-center space-x-2">
                          <Input
                            id="current-api-key"
                            type="text"
                            value={apiKeyInfo.apiKeyMasked || ''}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(apiKeyInfo.apiKeyMasked || '');
                              toast.success('API key copied to clipboard');
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowApiKey(false)}
                        className="flex-1"
                      >
                        Update Key
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={deleteApiKey}
                        disabled={isLoading}
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {isLoading ? 'Deleting...' : 'Delete Key'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <h4 className="font-medium text-yellow-800">No API Key Configured</h4>
                          <p className="text-sm text-yellow-600">
                            Add your Hiking Journal API key to sync exercise data
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="api-key" className="text-sm font-medium">
                    {apiKeyInfo?.hasApiKey ? 'New API Key' : 'API Key'}
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your Hiking Journal API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={saveApiKey}
                      disabled={isLoading || !apiKey.trim()}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Get your API key from the Hiking Journal app settings
                  </p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Mountain className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">How to get your API key:</p>
                      <ol className="mt-1 space-y-1 text-xs">
                        <li>1. Log into your Hiking Journal app</li>
                        <li>2. Go to Settings or Developer section</li>
                        <li>3. Generate an API token for external access</li>
                        <li>4. Copy the token and paste it above</li>
                      </ol>
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <p className="font-medium">⚠️ Important:</p>
                        <p>The Hiking Journal app expects a JWT token (not a simple API key). The token should look like: <code className="bg-yellow-100 px-1 rounded">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code></p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Key Status</span>
                  <Badge variant={apiKeyInfo?.hasApiKey ? "default" : "secondary"}>
                    {apiKeyInfo?.hasApiKey ? "Configured" : "Not Set"}
                  </Badge>
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