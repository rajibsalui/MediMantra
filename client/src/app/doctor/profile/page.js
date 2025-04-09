"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Eye, 
  Edit,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";
import DoctorProfileManager from "@/components/doctor/DoctorProfileManager";
import DoctorProfileDetails from "@/components/doctor/DoctorProfileDetails";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_URL, SOCKET_URL } from '@/config/environment';

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export default function DoctorProfile() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { doctor, loading: doctorLoading, getDoctorProfile } = useDoctor();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch doctor profile if not already loaded
  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor" && !doctor) {
      getDoctorProfile().catch(error => {
        console.error("Error loading doctor profile:", error);
        toast.error("Failed to load profile data");
      });
    }
  }, [isAuthenticated, user, doctor, getDoctorProfile]);
  
  // Handle edit mode toggle
  const handleEditModeSwitch = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Handle view mode toggle
  const handleViewModeSwitch = () => {
    setIsEditMode(false);
  };
  
  // Show loading state
  if (authLoading || doctorLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }
  
  // Redirect if not authenticated or not a doctor
  if (!isAuthenticated || user?.role !== "doctor") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">You need to be logged in as a doctor to view this page.</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
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
          <h1 className="text-2xl font-bold">Doctor Profile</h1>
        </div>
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList key="tabs-list" className="mb-6">
            <TabsTrigger value="profile" key="profile-tab">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" key="security-tab">
              <Shield className="h-4 w-4 mr-2" />
              Security
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
                <DoctorProfileManager />
              </div>
            ) : (
              <DoctorProfileDetails onEditClick={handleEditModeSwitch} />
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-6" key="security-content">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
              <p className="font-medium">Security settings are managed in the Settings page</p>
              <p className="text-sm mt-1">Please visit the Settings page to manage your security preferences, change password, and update email.</p>
              <Button 
                variant="outline" 
                className="mt-3 bg-white dark:bg-transparent border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                onClick={() => router.push("/doctor/settings")}
              >
                Go to Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
