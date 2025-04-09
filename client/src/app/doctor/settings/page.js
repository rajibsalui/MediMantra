"use client";

import { useState } from "react";
import { API_URL, SOCKET_URL } from "@/config/environment";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";
import DoctorProfileManager from "@/components/doctor/DoctorProfileManager";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Password change validation schema
const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Email change validation schema
const emailSchema = yup.object().shape({
  newEmail: yup.string().email("Invalid email").required("New email is required"),
  password: yup.string().required("Password is required"),
});

export default function DoctorSettings() {
  const router = useRouter();
  const { user, updatePassword, updateEmail, loading: authLoading } = useAuth();
  const { doctor, loading: doctorLoading } = useDoctor();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    patientMessages: true,
    marketingEmails: false,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showProfilePublicly: true,
    allowPatientReviews: true,
    shareDataWithResearchers: false,
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  // Email change form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmailForm
  } = useForm({
    resolver: yupResolver(emailSchema)
  });

  // Handle password change
  const onPasswordChange = async (data) => {
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      toast.success("Password updated successfully");
      resetPasswordForm();
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    }
  };

  // Handle email change
  const onEmailChange = async (data) => {
    try {
      await updateEmail(data.newEmail, data.password);
      toast.success("Email updated successfully");
      resetEmailForm();
    } catch (error) {
      toast.error(error.message || "Failed to update email");
    }
  };

  // Handle notification setting change
  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
    toast.success(`${setting} setting updated`);
  };

  // Handle privacy setting change
  const handlePrivacyChange = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });
    toast.success(`${setting} setting updated`);
  };

  // Show loading state
  if (authLoading || doctorLoading) {
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
            <DoctorProfileManager />
          </TabsContent>

          <TabsContent value="account" className="space-y-6" key="account-content">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        {...registerPassword("currentPassword")}
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="newPassword">New Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...registerPassword("newPassword")}
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...registerPassword("confirmPassword")}
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    {authLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                    ) : (
                      <><Key className="h-4 w-4 mr-2" /> Update Password</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Email</CardTitle>
                <CardDescription>
                  Update your email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit(onEmailChange)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentEmail">Current Email</Label>
                    <Input
                      id="currentEmail"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="Enter new email"
                      {...registerEmail("newEmail")}
                    />
                    {emailErrors.newEmail && (
                      <p className="text-red-500 text-xs mt-1">{emailErrors.newEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailPassword">Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showEmailPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="emailPassword"
                        type={showEmailPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...registerEmail("password")}
                      />
                    </div>
                    {emailErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{emailErrors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    {authLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" /> Update Email</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6" key="notifications-content">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control what notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
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
                      Get notified about upcoming appointments
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
                    <Label htmlFor="patient-messages">Patient Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when patients send you messages
                    </p>
                  </div>
                  <Switch
                    id="patient-messages"
                    checked={notificationSettings.patientMessages}
                    onCheckedChange={() => handleNotificationChange('patientMessages')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and updates about new features
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationChange('marketingEmails')}
                  />
                </div>
              </CardContent>
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
                    <Label htmlFor="show-profile">Show Profile Publicly</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow patients to find and view your profile
                    </p>
                  </div>
                  <Switch
                    id="show-profile"
                    checked={privacySettings.showProfilePublicly}
                    onCheckedChange={() => handlePrivacyChange('showProfilePublicly')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-reviews">Allow Patient Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Let patients leave reviews on your profile
                    </p>
                  </div>
                  <Switch
                    id="allow-reviews"
                    checked={privacySettings.allowPatientReviews}
                    onCheckedChange={() => handlePrivacyChange('allowPatientReviews')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-data">Share Data with Researchers</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymized data to be used for medical research
                    </p>
                  </div>
                  <Switch
                    id="share-data"
                    checked={privacySettings.shareDataWithResearchers}
                    onCheckedChange={() => handlePrivacyChange('shareDataWithResearchers')}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <p className="text-xs text-gray-500">
                  Your privacy is important to us. We will never share your personal information without your consent.
                  For more information, please read our <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
