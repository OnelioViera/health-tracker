"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Camera,
  Edit,
  Save,
  X,
  Lock,
  Download,
  Trash2,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Settings,
  Key,
  Smartphone,
  FileText,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import BackButton from "@/components/back-button";
import { toast } from "sonner";
import HealthDataShareModal from "@/components/health-data-share-modal";

export default function UserProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States"
    },
    phone: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    insurance: {
      policyNumber: "",
      groupNumber: ""
    },
    medicalHistory: {
      conditions: [],
      allergies: [],
      medications: [],
      surgeries: []
    }
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    updates: false,
    healthAlerts: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    dataSharing: false,
    analytics: true,
    healthDataSharing: false,
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        birthdate: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States"
        },
        phone: "",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: ""
        },
        insurance: {
          policyNumber: "",
          groupNumber: ""
        },
        medicalHistory: {
          conditions: [],
          allergies: [],
          medications: [],
          surgeries: []
        }
      });
      
      // Fetch additional user profile data
      fetch('/api/user-profile')
        .then(res => res.json())
        .then(data => {
          console.log('Fetched user profile data:', data);
          if (data && !data.error) {
            setFormData(prev => ({
              ...prev,
              birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : "",
              address: data.address || {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "United States"
              },
              phone: data.phone || "",
              emergencyContact: data.emergencyContact || {
                name: "",
                relationship: "",
                phone: ""
              },
              insurance: data.insurance || {
                policyNumber: "",
                groupNumber: ""
              },
              medicalHistory: data.medicalHistory || {
                conditions: [],
                allergies: [],
                medications: [],
                surgeries: []
              }
            }));
          }
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
        });
    }
    
    // Load privacy settings from localStorage
    const savedPrivacy = localStorage.getItem('healthDataSharing');
    if (savedPrivacy) {
      setPrivacy(prev => ({
        ...prev,
        healthDataSharing: JSON.parse(savedPrivacy)
      }));
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Saving form data:', formData);
      
      // Only save additional profile data to our API
      // Clerk user data (firstName, lastName) is managed separately
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response error:', errorData);
        throw new Error('Failed to save profile data');
      }
      
      const savedData = await response.json();
      console.log('Saved user profile data:', savedData);
      
      setIsEditing(false);
      toast.success("Profile Updated", {
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Update Failed", {
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      birthdate: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States"
      },
      phone: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: ""
      },
      insurance: {
        policyNumber: "",
        groupNumber: ""
      },
      medicalHistory: {
        conditions: [],
        allergies: [],
        medications: [],
        surgeries: []
      }
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords Don't Match", {
        description: "New password and confirm password must match.",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password Too Short", {
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Clerk does not support updating password directly via user.update().
      // Use Clerk's <UserProfile /> component or a custom password reset flow instead.
      toast.info("Password changes must be done via Clerk's built-in UI or password reset flow.");
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Password Update Failed", {
        description: "Failed to update password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    setIsLoading(true);
    try {
      await user?.delete();
      signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Deletion Failed", {
        description: "Failed to delete account. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would call an API to export user data
      // For now, we'll simulate the export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock export file
      const exportData = {
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.primaryEmailAddress?.emailAddress,
          createdAt: user?.createdAt,
        },
        settings: {
          notifications,
          privacy,
        },
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `myhealthfirst-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportConfirm(false);
      toast.success("Data Exported", {
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Export Failed", {
        description: "Failed to export data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File Too Large", {
        description: "Profile picture must be less than 5MB.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await user?.setProfileImage({ file });
      toast.success("Profile Picture Updated", {
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Update Failed", {
        description: "Failed to update profile picture. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthDataSharingChange = async (enabled: boolean) => {
    setPrivacy({ ...privacy, healthDataSharing: enabled });
    
    // Persist to localStorage
    localStorage.setItem('healthDataSharing', JSON.stringify(enabled));
    
    try {
      // In a real implementation, you would save this preference to your database
      // For now, we'll just show a toast message
      if (enabled) {
        toast.success("Health Data Sharing Enabled", {
          description: "You can now share your health data with trusted recipients.",
        });
      } else {
        toast.info("Health Data Sharing Disabled", {
          description: "Your health data will no longer be shared. You can re-enable this at any time.",
        });
      }
    } catch (error) {
      console.error("Error updating health data sharing preference:", error);
      toast.error("Failed to update sharing preference");
    }
  };

  const isEmailVerified = user?.primaryEmailAddress?.verification?.status === "verified";
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => {
            console.log('Edit button clicked, setting isEditing to true');
            setIsEditing(true);
          }} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
                {isEditing && (
                  <Badge variant="info">
                    Editing
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 bg-white border-2 border-gray-200 hover:border-gray-300 cursor-pointer flex items-center justify-center">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Managed by your account settings</p>
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Managed by your account settings</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="email"
                        value={formData.email}
                        disabled
                        className="flex-1 bg-gray-50"
                      />
                      <div className="flex items-center space-x-2">
                        {isEmailVerified ? (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                        {/*
                          Email verification must be handled by Clerk's built-in UI (e.g., <UserProfile />)
                          or via the sign-up/sign-in flows. Programmatic verification is not supported.
                        */}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="birthdate">Date of Birth</Label>
                    <Input
                      id="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label>Address</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      <Input
                        placeholder="Street Address"
                        value={formData.address.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                      <Input
                        placeholder="City"
                        value={formData.address.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <Input
                        placeholder="State"
                        value={formData.address.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                      <Input
                        placeholder="ZIP Code"
                        value={formData.address.zipCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, zipCode: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => {
                    console.log('Save button clicked');
                    handleSave();
                  }} size="sm" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={() => {
                    console.log('Cancel button clicked');
                    handleCancel();
                  }} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Password Change */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? "Cancel" : "Change Password"}
                  </Button>
                </div>

                {showPasswordForm && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handlePasswordChange} size="sm" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Password"}
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Manage your notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Health Reminders</h4>
                    <p className="text-sm text-gray-600">Get reminded about health tracking</p>
                  </div>
                  <Switch
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Health Alerts</h4>
                    <p className="text-sm text-gray-600">Get alerts for abnormal readings</p>
                  </div>
                  <Switch
                    checked={notifications.healthAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, healthAlerts: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-gray-600">Control who can see your profile</p>
                  </div>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-gray-600">Allow data sharing for research</p>
                  </div>
                  <Switch
                    checked={privacy.dataSharing}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, dataSharing: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Analytics</h4>
                    <p className="text-sm text-gray-600">Help improve the app with analytics</p>
                  </div>
                  <Switch
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Health Data Sharing</h4>
                    <p className="text-sm text-gray-600">Share health data with trusted recipients</p>
                  </div>
                  <Switch
                    checked={privacy.healthDataSharing}
                    onCheckedChange={handleHealthDataSharingChange}
                  />
                </div>
                {privacy.healthDataSharing && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-blue-700 mb-3">
                      <User className="h-4 w-4" />
                      <span>Ready to share health data</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Share Health Data
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowExportConfirm(true)}
                  disabled={isLoading}
                >
                  {isLoading ? "Exporting..." : "Export"}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-xs text-gray-600">{memberSince}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email Verified</p>
                  <p className="text-xs text-gray-600">
                    {isEmailVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <Badge variant="success">
                    Active
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-xs text-gray-600">Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => setShowPasswordForm(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => signOut({ redirectUrl: "/" })}
              >
                <Settings className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={handleAccountDeletion}
                variant="destructive"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Deleting..." : "Delete Account"}
              </Button>
              <Button 
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showExportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Export Data</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will export all your health data, settings, and account information to a JSON file. The export may take a few moments.
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={handleDataExport}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Exporting..." : "Export Data"}
              </Button>
              <Button 
                onClick={() => setShowExportConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <HealthDataShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
        />
      )}
    </div>
  );
} 