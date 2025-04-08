"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import ProfileManager from '@/components/patient/ProfileManager';
import ProfileDetails from '@/components/patient/ProfileDetails';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, LockKeyhole, User, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PatientProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditMode, setIsEditMode] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { patient, getPatientProfile, loading: patientLoading } = usePatient();

  useEffect(() => {
    // Redirect if not authenticated or not a patient
    if (!authLoading && !isAuthenticated) {
      toast.error("Please sign in to access your profile");
      router.push('/login');
    } else if (!authLoading && isAuthenticated && user?.role !== 'patient') {
      toast.error("Access denied. This page is for patients only.");
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      getPatientProfile();
    }
  }, [isAuthenticated]);

  // Refresh profile data when switching from edit to view mode
  const handleViewModeSwitch = () => {
    setIsEditMode(false);
    getPatientProfile(); // Refresh data
    toast.success("Profile view updated with latest information");
  };

  // Switch to edit mode
  const handleEditModeSwitch = () => {
    setIsEditMode(true);
  };

  // Show loading state
  if (authLoading || patientLoading || !patient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" key="profile-tab">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" key="security-tab">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="privacy" key="privacy-tab">
              <LockKeyhole className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6" key="profile-content">
            {isEditMode ? (
              <div className="relative">
                <div className="absolute right-0 top-0 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewModeSwitch}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Mode
                  </Button>
                </div>
                <ProfileManager />
              </div>
            ) : (
              <ProfileDetails onEditClick={handleEditModeSwitch} />
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-6" key="security-content">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md" key="security-notice">
                  Security settings will be implemented in the next update.
                </div>

                {/* Placeholder for security settings */}
                <div className="space-y-6 opacity-60 pointer-events-none" key="security-placeholder">
                  <div className="space-y-2" key="password-section">
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-500">Change your password or enable two-factor authentication</p>
                    <Button disabled>Change Password</Button>
                  </div>

                  <div className="space-y-2" key="login-history-section">
                    <h3 className="font-medium">Login History</h3>
                    <p className="text-sm text-gray-500">View your recent login activity</p>
                    <Button disabled variant="outline">View History</Button>
                  </div>

                  <div className="space-y-2" key="2fa-section">
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    <Button disabled variant="outline">Setup 2FA</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6" key="privacy-content">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md" key="privacy-notice">
                  Privacy settings will be implemented in the next update.
                </div>

                {/* Placeholder for privacy settings */}
                <div className="space-y-6 opacity-60 pointer-events-none" key="privacy-placeholder">
                  <div className="space-y-2" key="data-sharing-section">
                    <h3 className="font-medium">Data Sharing</h3>
                    <p className="text-sm text-gray-500">Control how your medical data is shared with healthcare providers</p>
                    <Button disabled>Manage Data Sharing</Button>
                  </div>

                  <div className="space-y-2" key="marketing-section">
                    <h3 className="font-medium">Marketing Preferences</h3>
                    <p className="text-sm text-gray-500">Choose what types of communications you receive</p>
                    <Button disabled variant="outline">Update Preferences</Button>
                  </div>

                  <div className="space-y-2" key="download-data-section">
                    <h3 className="font-medium">Download Your Data</h3>
                    <p className="text-sm text-gray-500">Get a copy of all your personal data</p>
                    <Button disabled variant="outline">Request Data</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
