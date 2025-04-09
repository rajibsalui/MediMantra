"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { API_URL, SOCKET_URL } from '@/config/environment';
import {
  User,
  Shield,
  Bell,
  LockKeyhole,
  ArrowLeft,
  Save,
  Loader2,
  Mail,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import ProfileManager from '@/components/patient/ProfileManager';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Schema for password change form
const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Schema for email change form
const emailSchema = yup.object({
  newEmail: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email'),
  password: yup.string().required('Password is required'),
});

export default function PatientSettings() {
  const router = useRouter();
  const { user, updatePassword, updateEmail, loading: authLoading } = useAuth();
  const { patient, loading: patientLoading } = usePatient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    medicationReminders: true,
    marketingEmails: false,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    shareDataWithDoctors: true,
    shareDataWithResearchers: false,
    allowProfileDiscovery: true,
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  // Email change form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors }
  } = useForm({
    resolver: yupResolver(emailSchema)
  });

  // Handle password change
  const onPasswordChange = async (data) => {
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  // Handle email change
  const onEmailChange = async (data) => {
    try {
      await updateEmail(data.newEmail, data.password);
      toast.success('Email updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update email');
    }
  };

  // Handle notification settings change
  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });

    // In a real app, you would save this to the backend
    toast.success(`${setting} setting updated`);
  };

  // Handle privacy settings change
  const handlePrivacyChange = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });

    // In a real app, you would save this to the backend
    toast.success(`${setting} setting updated`);
  };

  // Show loading state
  if (authLoading || patientLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList key="tabs-list" className="mb-6">
            <TabsTrigger value="profile" key="profile-tab">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" key="account-tab">
              <Shield className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" key="notifications-tab">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" key="privacy-tab">
              <LockKeyhole className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6" key="profile-content">
            <ProfileManager />
          </TabsContent>

          <TabsContent value="account" className="space-y-6" key="account-content">
            <Card>
              <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>
                  Update your email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit(onEmailChange)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-email">Current Email</Label>
                      <Input
                        id="current-email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-email">New Email</Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="Enter new email address"
                        {...registerEmail('newEmail')}
                      />
                      {emailErrors.newEmail && (
                        <p className="text-sm text-red-500">{emailErrors.newEmail.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="email-password"
                          type={showEmailPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...registerEmail('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowEmailPassword(!showEmailPassword)}
                        >
                          {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {emailErrors.password && (
                        <p className="text-sm text-red-500">{emailErrors.password.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      {authLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                      ) : (
                        <><Mail className="mr-2 h-4 w-4" /> Update Email</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordChange)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          {...registerPassword('currentPassword')}
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
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...registerPassword('newPassword')}
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
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...registerPassword('confirmPassword')}
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
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      {authLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                      ) : (
                        <><Key className="mr-2 h-4 w-4" /> Update Password</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6" key="notifications-content">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange('emailNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders about upcoming appointments
                    </p>
                  </div>
                  <Switch
                    id="appointment-reminders"
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={() => handleNotificationChange('appointmentReminders')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="medication-reminders">Medication Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders to take your medications
                    </p>
                  </div>
                  <Switch
                    id="medication-reminders"
                    checked={notificationSettings.medicationReminders}
                    onCheckedChange={() => handleNotificationChange('medicationReminders')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and offers
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationChange('marketingEmails')}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6" key="privacy-content">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your information is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-with-doctors">Share Data with Doctors</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your doctors to access your medical information
                    </p>
                  </div>
                  <Switch
                    id="share-with-doctors"
                    checked={privacySettings.shareDataWithDoctors}
                    onCheckedChange={() => handlePrivacyChange('shareDataWithDoctors')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-with-researchers">Share Data with Researchers</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymized data to be used for medical research
                    </p>
                  </div>
                  <Switch
                    id="share-with-researchers"
                    checked={privacySettings.shareDataWithResearchers}
                    onCheckedChange={() => handlePrivacyChange('shareDataWithResearchers')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-discovery">Profile Discovery</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow doctors to find your profile when searching for patients
                    </p>
                  </div>
                  <Switch
                    id="profile-discovery"
                    checked={privacySettings.allowProfileDiscovery}
                    onCheckedChange={() => handlePrivacyChange('allowProfileDiscovery')}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Privacy Settings
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription>
                  Actions that can permanently affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium">Download Your Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of all your personal data and medical records.
                  </p>
                  <Button variant="outline">
                    Request Data Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
